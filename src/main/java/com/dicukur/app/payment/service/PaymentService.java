package com.dicukur.app.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.payment.dto.PaymentResponse;
import com.dicukur.app.payment.entity.Payment;
import com.dicukur.app.payment.repository.PaymentRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;
    private final String serverKey;
    private final boolean production;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public PaymentService(BookingRepository bookingRepository,
                          PaymentRepository paymentRepository,
                          CurrentUserService currentUserService,
                          ObjectMapper objectMapper,
                          @Value("${midtrans.server-key:}") String serverKey,
                          @Value("${midtrans.production:false}") boolean production) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.currentUserService = currentUserService;
        this.objectMapper = objectMapper;
        this.serverKey = serverKey == null ? "" : serverKey.trim();
        this.production = production;
    }

    @Transactional
    public PaymentResponse start(Long bookingId) {
        User customer = currentUserService.requireRole("Customer");
        Booking booking = bookingRepository.findByCustomer_IdAndId(customer.getId(), bookingId)
                .stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));
        Payment payment = paymentRepository.findByBooking_Id(bookingId).orElseGet(() -> newPayment(booking));

        if ("paid".equalsIgnoreCase(payment.getStatus())) {
            return toResponse(payment, "Pembayaran sudah diterima");
        }
        if (serverKey.isBlank()) {
            paymentRepository.save(payment);
            return toResponse(payment, "Payment gateway belum dikonfigurasi. Booking tersimpan sebagai unpaid.");
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("transaction_details", Map.of(
                    "order_id", booking.getBookingCode(),
                    "gross_amount", booking.getTotalPrice().longValueExact()
            ));
            payload.put("customer_details", Map.of(
                    "first_name", customer.getName(),
                    "email", customer.getEmail()
            ));
            String body = objectMapper.writeValueAsString(payload);
            String credentials = Base64.getEncoder().encodeToString((serverKey + ":")
                    .getBytes(StandardCharsets.UTF_8));
            String endpoint = production
                    ? "https://app.midtrans.com/snap/v1/transactions"
                    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(20))
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + credentials)
                    .POST(BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = httpClient.send(request, BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new IllegalStateException("Midtrans menolak transaksi: HTTP " + response.statusCode());
            }
            JsonNode result = objectMapper.readTree(response.body());
            payment.setSnapToken(text(result, "token"));
            payment.setStatus("pending");
            payment.setPaymentType("midtrans_snap");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            return toResponse(payment, "Lanjutkan pembayaran melalui Midtrans");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Payment gateway sedang tidak tersedia", exception);
        } catch (IOException exception) {
            throw new IllegalStateException("Payment gateway sedang tidak tersedia", exception);
        }
    }

    @Transactional
    public void processNotification(Map<String, String> notification) {
        String orderId = notification.get("order_id");
        String statusCode = notification.get("status_code");
        String grossAmount = notification.get("gross_amount");
        String signature = notification.get("signature_key");
        if (serverKey.isBlank() || orderId == null || statusCode == null || grossAmount == null) {
            throw new IllegalArgumentException("Payload payment tidak lengkap");
        }
        String expectedSignature = sha512(orderId + statusCode + grossAmount + serverKey);
        if (signature == null || !java.security.MessageDigest.isEqual(
                signature.toLowerCase(java.util.Locale.ROOT).getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Signature payment tidak valid");
        }

        Booking booking = bookingRepository.findByBookingCode(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Booking dari notifikasi tidak ditemukan"));
        if (booking.getTotalPrice().compareTo(new java.math.BigDecimal(grossAmount)) != 0) {
            throw new IllegalArgumentException("Nominal payment tidak sesuai booking");
        }
        Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElseGet(() -> newPayment(booking));
        String transactionStatus = notification.getOrDefault("transaction_status", "");
        String fraudStatus = notification.getOrDefault("fraud_status", "accept");
        if ("paid".equalsIgnoreCase(payment.getStatus()) && !"settlement".equalsIgnoreCase(transactionStatus)) {
            return;
        }
        String paymentStatus;
        String bookingPaymentStatus;
        if ("settlement".equalsIgnoreCase(transactionStatus)
                || ("capture".equalsIgnoreCase(transactionStatus) && "accept".equalsIgnoreCase(fraudStatus))) {
            paymentStatus = "paid";
            bookingPaymentStatus = "paid";
            payment.setPaidAt(LocalDateTime.now());
        } else if ("pending".equalsIgnoreCase(transactionStatus)) {
            paymentStatus = "pending";
            bookingPaymentStatus = "unpaid";
        } else if ("expire".equalsIgnoreCase(transactionStatus)
                || "cancel".equalsIgnoreCase(transactionStatus)
                || "deny".equalsIgnoreCase(transactionStatus)) {
            paymentStatus = "failed";
            bookingPaymentStatus = "failed";
        } else {
            return;
        }
        payment.setGatewayTransactionId(notification.get("transaction_id"));
        payment.setStatus(paymentStatus);
        payment.setVerifiedAt(LocalDateTime.now());
        booking.setPaymentStatus(bookingPaymentStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        bookingRepository.save(booking);
    }

    private Payment newPayment(Booking booking) {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setPaymentMethod("qris");
        payment.setAmount(booking.getTotalPrice());
        payment.setStatus("pending");
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        return payment;
    }

    private PaymentResponse toResponse(Payment payment, String message) {
        String redirectUrl = payment.getSnapToken() == null ? null
                : (production ? "https://app.midtrans.com/snap/v2/vtweb/" : "https://app.sandbox.midtrans.com/snap/v2/vtweb/")
                + payment.getSnapToken();
        return new PaymentResponse(payment.getBooking().getId(), payment.getBooking().getBookingCode(),
                payment.getStatus(), payment.getSnapToken(), redirectUrl, message);
    }

    private String text(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }

    private String sha512(String value) {
        try {
            byte[] digest = java.security.MessageDigest.getInstance("SHA-512")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder output = new StringBuilder();
            for (byte item : digest) {
                output.append(String.format("%02x", item));
            }
            return output.toString();
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-512 tidak tersedia", exception);
        }
    }
}
