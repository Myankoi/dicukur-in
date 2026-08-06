package com.dicukur.app.payment.service;

import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.notification.service.NotificationService;
import com.dicukur.app.payment.dto.PaymentRequest;
import com.dicukur.app.payment.dto.PaymentResponse;
import com.dicukur.app.payment.entity.Payment;
import com.dicukur.app.payment.repository.PaymentRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          CurrentUserService currentUserService,
                          NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    public PaymentResponse submitPayment(PaymentRequest request) {
        User user = currentUserService.requireUser();

        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));

        if (!booking.getCustomer().getId().equals(user.getId())) {
            throw new IllegalStateException("Anda tidak memiliki akses ke booking ini");
        }

        Payment payment = paymentRepository.findByBooking_Id(booking.getId())
                .orElseGet(Payment::new);

        payment.setBooking(booking);
        payment.setPaymentMethod(request.paymentMethod());
        payment.setAmount(request.amount() != null ? request.amount() : booking.getTotalPrice());
        payment.setProof(request.proof());
        payment.setNotes(request.notes());

        if ("cash".equalsIgnoreCase(request.paymentMethod())) {
            payment.setStatus("paid");
            payment.setPaidAt(LocalDateTime.now());
            payment.setVerifiedAt(LocalDateTime.now());
            booking.setPaymentStatus("paid");
        } else {
            // transfer
            payment.setStatus("waiting_verification");
            payment.setPaidAt(LocalDateTime.now());
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

    public void processNotification(Map<String, String> payload) {
        String orderId = payload.get("order_id");
        String transactionStatus = payload.get("transaction_status");

        if (orderId == null) return;

        bookingRepository.findByBookingCode(orderId).ifPresent(booking -> {
            Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElseGet(Payment::new);
            payment.setBooking(booking);
            payment.setGatewayTransactionId(payload.get("transaction_id"));
            payment.setPaymentMethod("midtrans");
            payment.setAmount(booking.getTotalPrice());

            if ("settlement".equals(transactionStatus) || "capture".equals(transactionStatus)) {
                payment.setStatus("paid");
                payment.setPaidAt(LocalDateTime.now());
                payment.setVerifiedAt(LocalDateTime.now());
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
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Pembayaran tidak ditemukan"));

        Booking booking = payment.getBooking();

        if ("approve".equalsIgnoreCase(action)) {
            payment.setStatus("paid");
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
        }

        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBooking(Long bookingId) {
        return paymentRepository.findByBooking_Id(bookingId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
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
                p.getCreatedAt() != null ? p.getCreatedAt().format(fmt) : null
        );
    }
}
