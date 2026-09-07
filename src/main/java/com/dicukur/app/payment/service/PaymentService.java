package com.dicukur.app.payment.service;

import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.admin.service.AdminAuditService;
import com.dicukur.app.notification.service.NotificationService;
import com.dicukur.app.payment.dto.PaymentRequest;
import com.dicukur.app.payment.dto.PaymentResponse;
import com.dicukur.app.payment.entity.Payment;
import com.dicukur.app.payment.repository.PaymentRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Base64;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    private final String midtransServerKey;
    private final boolean midtransProduction;
    private final AdminAuditService auditService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          CurrentUserService currentUserService,
                          NotificationService notificationService,
                          ObjectMapper objectMapper,
                          @Value("${midtrans.server-key:}") String midtransServerKey,
                          @Value("${midtrans.production:false}") boolean midtransProduction,
                          AdminAuditService auditService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
        this.midtransServerKey = midtransServerKey;
        this.midtransProduction = midtransProduction;
        this.auditService = auditService;
    }

    public PaymentResponse submitPayment(PaymentRequest request) {
        if (request == null || request.bookingId() == null) {
            throw new IllegalArgumentException("Booking pembayaran wajib dipilih");
        }
        User user = currentUserService.requireUser();

        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));

        if (!booking.getCustomer().getId().equals(user.getId())) {
            throw new IllegalStateException("Anda tidak memiliki akses ke booking ini");
        }

        String method = request.paymentMethod() == null ? "" : request.paymentMethod().trim().toLowerCase();
        if (!List.of("transfer", "qris").contains(method)) {
            throw new IllegalArgumentException("Metode pembayaran tidak didukung");
        }

        if (!"accepted".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Pembayaran hanya dapat dilakukan setelah barber menerima booking");
        }
        if (booking.getPaymentDeadline() != null && booking.getPaymentDeadline().isBefore(LocalDateTime.now())) {
            booking.setStatus("cancelled_unpaid");
            booking.setCancellationReason("Pembayaran tidak diselesaikan dalam 30 menit setelah booking diterima");
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);
            throw new IllegalStateException("Batas waktu pembayaran sudah habis. Silakan buat booking baru.");
        }
        if ("paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new IllegalStateException("Booking ini sudah lunas");
        }

        Payment payment = paymentRepository.findByBooking_Id(booking.getId())
                .orElseGet(Payment::new);

        if ("qris".equals(method) && "pending".equalsIgnoreCase(payment.getStatus())
                && payment.getSnapToken() != null && !payment.getSnapToken().isBlank()) {
            return mapToResponse(payment);
        }

        payment.setBooking(booking);
        payment.setPaymentMethod(method);
        // Total selalu dihitung dari booking server-side, bukan dari payload client.
        payment.setAmount(booking.getTotalPrice());
        payment.setProof(request.proof());
        payment.setNotes(request.notes());

        if ("qris".equals(method)) {
            createMidtransTransaction(booking, payment, user);
            payment.setStatus("pending");
            booking.setPaymentStatus("unpaid");
        } else {
            // transfer
            if (request.proof() == null || request.proof().isBlank()) {
                throw new IllegalArgumentException("Bukti transfer wajib diunggah");
            }
            payment.setStatus("waiting_verification");
            payment.setPaidAt(null);
            payment.setVerifiedAt(null);
            booking.setPaymentStatus("waiting_verification");
        }

        if (payment.getCreatedAt() == null) {
            payment.setCreatedAt(LocalDateTime.now());
        }
        payment.setUpdatedAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        bookingRepository.save(booking);

        // Notify barber & customer
        if ("waiting_verification".equals(payment.getStatus())) {
            notificationService.createNotification(
                    booking.getBarber().getId(),
                    "Bukti Pembayaran Diunggah",
                    "Customer " + user.getName() + " telah mengunggah bukti pembayaran untuk booking #" + booking.getBookingCode(),
                    "payment",
                    booking.getId()
            );
        }

        return mapToResponse(saved);
    }

    private void createMidtransTransaction(Booking booking, Payment payment, User user) {
        if (midtransServerKey == null || midtransServerKey.isBlank()) {
            throw new IllegalStateException("Pembayaran online belum dikonfigurasi. Pilih Transfer Manual atau hubungi admin.");
        }

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("first_name", user.getName());
        customerDetails.put("email", user.getEmail());
        if (user.getPhone() != null) customerDetails.put("phone", user.getPhone());

        Map<String, Object> body = new HashMap<>();
        body.put("transaction_details", Map.of(
                "order_id", booking.getBookingCode(),
                "gross_amount", booking.getTotalPrice().setScale(0, java.math.RoundingMode.HALF_UP).longValue()
        ));
        body.put("customer_details", customerDetails);

        String endpoint = midtransProduction ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
        String auth = Base64.getEncoder().encodeToString((midtransServerKey + ":").getBytes(java.nio.charset.StandardCharsets.UTF_8));
        try {
            JsonNode response = RestClient.builder().baseUrl(endpoint).build()
                    .post()
                    .uri("/snap/v1/transactions")
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            String token = response != null ? response.path("token").asText(null) : null;
            if (token == null || token.isBlank()) {
                throw new IllegalStateException("Gateway tidak mengembalikan token pembayaran");
            }
            payment.setSnapToken(token);
        } catch (RestClientResponseException cause) {
            throw new IllegalStateException("Gateway pembayaran menolak transaksi (" + cause.getStatusCode().value() + ")");
        } catch (Exception cause) {
            if (cause instanceof IllegalStateException state) throw state;
            throw new IllegalStateException("Gateway pembayaran sedang tidak dapat dihubungi");
        }
    }

    public void processNotification(Map<String, String> payload) {
        String orderId = payload.get("order_id");
        String transactionStatus = payload.get("transaction_status");

        if (orderId == null) return;

        bookingRepository.findByBookingCode(orderId).ifPresent(booking -> {
            if (booking.getStatus() != null && booking.getStatus().startsWith("cancelled")) {
                return;
            }
            LocalDateTime now = LocalDateTime.now();
            if ("accepted".equalsIgnoreCase(booking.getStatus())
                    && booking.getPaymentDeadline() != null
                    && booking.getPaymentDeadline().isBefore(now)
                    && !"waiting_verification".equalsIgnoreCase(booking.getPaymentStatus())
                    && !"paid".equalsIgnoreCase(booking.getPaymentStatus())) {
                booking.setStatus("cancelled_unpaid");
                booking.setPaymentStatus("unpaid");
                booking.setCancellationReason("Pembayaran diterima setelah batas waktu pembayaran berakhir");
                booking.setUpdatedAt(now);
                paymentRepository.findByBooking_Id(booking.getId()).ifPresent(payment -> {
                    payment.setStatus("cancelled");
                    payment.setUpdatedAt(now);
                    paymentRepository.save(payment);
                });
                bookingRepository.save(booking);
                return;
            }
            Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElseGet(Payment::new);
            payment.setBooking(booking);
            payment.setGatewayTransactionId(payload.get("transaction_id"));
            payment.setPaymentMethod("midtrans");
            payment.setAmount(booking.getTotalPrice());
            if (payment.getCreatedAt() == null) payment.setCreatedAt(now);
            payment.setUpdatedAt(now);

            if ("settlement".equals(transactionStatus) || "capture".equals(transactionStatus)) {
                payment.setStatus("paid");
                payment.setPaidAt(now);
                payment.setVerifiedAt(now);
                booking.setPaymentStatus("paid");
            } else if ("deny".equals(transactionStatus) || "expire".equals(transactionStatus) || "cancel".equals(transactionStatus)) {
                payment.setStatus("failed");
                booking.setPaymentStatus("failed");
            }

            paymentRepository.save(payment);
            bookingRepository.save(booking);
        });
    }

    public PaymentResponse verifyPayment(Long paymentId, String action, String notes) {
        currentUserService.requireRole("Admin");
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Pembayaran tidak ditemukan"));

        Booking booking = payment.getBooking();

        if (!"waiting_verification".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Pembayaran ini sudah diproses sebelumnya");
        }
        if (booking.getStatus() == null || booking.getStatus().startsWith("cancelled")
                || "rejected".equalsIgnoreCase(booking.getStatus())) {
            payment.setStatus("cancelled");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            throw new IllegalStateException("Booking sudah tidak aktif sehingga bukti pembayaran tidak dapat diverifikasi");
        }

        if ("approve".equalsIgnoreCase(action)) {
            payment.setStatus("paid");
            payment.setPaidAt(LocalDateTime.now());
            payment.setVerifiedAt(LocalDateTime.now());
            booking.setPaymentStatus("paid");

            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    "Pembayaran Diverifikasi",
                    "Pembayaran untuk booking #" + booking.getBookingCode() + " telah disetujui.",
                    "payment",
                    booking.getId()
            );
        } else if ("reject".equalsIgnoreCase(action)) {
            if (notes == null || notes.isBlank()) {
                throw new IllegalArgumentException("Alasan penolakan wajib diisi");
            }
            payment.setStatus("failed");
            payment.setNotes(notes);
            booking.setPaymentStatus("unpaid");

            notificationService.createNotification(
                    booking.getCustomer().getId(),
                    "Pembayaran Ditolak",
                    "Bukti pembayaran untuk booking #" + booking.getBookingCode() + " ditolak. Alasan: " + notes,
                    "payment",
                    booking.getId()
            );
        } else {
            throw new IllegalArgumentException("Aksi verifikasi tidak valid");
        }

        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        bookingRepository.save(booking);
        auditService.record("VERIFY_PAYMENT_" + action.toUpperCase(), "PAYMENT", payment.getId(), notes);

        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse processRefund(Long paymentId, String action, String notes, String reference, String proof) {
        currentUserService.requireRole("Admin");
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Pembayaran tidak ditemukan"));
        Booking booking = payment.getBooking();
        if (!"refund_pending".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Pembayaran ini tidak sedang menunggu refund");
        }
        if ("approve".equalsIgnoreCase(action)) {
            if ((reference == null || reference.isBlank()) && ("transfer".equalsIgnoreCase(payment.getPaymentMethod()))) {
                throw new IllegalArgumentException("Nomor referensi refund wajib diisi");
            }
            payment.setStatus("refunded");
            payment.setRefundReference(blankToNull(reference));
            payment.setRefundProof(blankToNull(proof));
            payment.setRefundedAt(LocalDateTime.now());
            payment.setNotes(blankToNull(notes));
            booking.setPaymentStatus("refunded");
            notificationService.createNotification(booking.getCustomer().getId(), "Refund diproses",
                    "Refund booking #" + booking.getBookingCode() + " telah diproses oleh admin.",
                    "payment_refund", booking.getId());
        } else if ("reject".equalsIgnoreCase(action)) {
            if (notes == null || notes.isBlank()) {
                throw new IllegalArgumentException("Alasan penolakan refund wajib diisi");
            }
            payment.setStatus("paid");
            payment.setRefundReason(notes.trim());
            payment.setNotes("Refund ditolak: " + notes.trim());
            booking.setPaymentStatus("paid");
            notificationService.createNotification(booking.getCustomer().getId(), "Refund ditolak",
                    "Permintaan refund booking #" + booking.getBookingCode() + " ditolak. Alasan: " + notes.trim(),
                    "payment_refund", booking.getId());
        } else {
            throw new IllegalArgumentException("Aksi refund tidak valid");
        }
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        bookingRepository.save(booking);
        auditService.record("REFUND_" + action.toUpperCase(), "PAYMENT", payment.getId(),
                notes == null ? null : notes.trim());
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBooking(Long bookingId) {
        User user = currentUserService.requireUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));
        boolean isAdmin = user.getRole() != null && "Admin".equalsIgnoreCase(user.getRole().getName());
        if (!isAdmin && !booking.getCustomer().getId().equals(user.getId())) {
            throw new IllegalStateException("Anda tidak memiliki akses ke pembayaran ini");
        }
        return paymentRepository.findByBooking_Id(bookingId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        currentUserService.requireRole("Admin");
        return paymentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PaymentResponse mapToResponse(Payment p) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        Booking b = p.getBooking();
        return new PaymentResponse(
                p.getId(),
                b.getId(),
                b.getBookingCode(),
                b.getCustomer() != null ? b.getCustomer().getName() : "-",
                b.getCustomer() != null ? b.getCustomer().getPhone() : "-",
                p.getPaymentMethod(),
                p.getAmount(),
                p.getStatus(),
                p.getProof(),
                p.getSnapToken(),
                p.getPaidAt() != null ? p.getPaidAt().format(fmt) : null,
                p.getVerifiedAt() != null ? p.getVerifiedAt().format(fmt) : null,
                p.getNotes(),
                p.getCreatedAt() != null ? p.getCreatedAt().format(fmt) : null,
                p.getRefundReason(), p.getRefundReference(), p.getRefundProof(),
                p.getRefundedAt() != null ? p.getRefundedAt().format(fmt) : null
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
