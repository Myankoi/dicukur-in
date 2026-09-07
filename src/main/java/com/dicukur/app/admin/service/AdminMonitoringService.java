package com.dicukur.app.admin.service;

import com.dicukur.app.admin.dto.AdminBookingResponse;
import com.dicukur.app.admin.dto.AdminReportResponse;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.notification.service.NotificationService;
import com.dicukur.app.payment.repository.PaymentRepository;
import com.dicukur.app.review.repository.ReviewRepository;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminMonitoringService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BarberProfileRepository barberProfileRepository;
    private final BarbershopRepository barbershopRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;
    private final PaymentRepository paymentRepository;
    private final AdminAuditService auditService;

    public AdminMonitoringService(BookingRepository bookingRepository,
                                  UserRepository userRepository,
                                  BarberProfileRepository barberProfileRepository,
                                  BarbershopRepository barbershopRepository,
                                  ReviewRepository reviewRepository,
                                  NotificationService notificationService,
                                  PaymentRepository paymentRepository,
                                  AdminAuditService auditService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.barberProfileRepository = barberProfileRepository;
        this.barbershopRepository = barbershopRepository;
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
        this.paymentRepository = paymentRepository;
        this.auditService = auditService;
    }

    public List<AdminBookingResponse> getAllBookings() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        return bookingRepository.findAll()
                .stream()
                .map(b -> new AdminBookingResponse(
                        b.getId(),
                        b.getBookingCode(),
                        b.getCustomer() != null ? b.getCustomer().getName() : "-",
                        b.getCustomer() != null ? b.getCustomer().getEmail() : "-",
                        b.getBarber() != null ? b.getBarber().getName() : "-",
                        b.getBarbershop() != null ? b.getBarbershop().getName() : "-",
                        b.getDetails() != null && !b.getDetails().isEmpty()
                                ? b.getDetails().get(0).getServiceName()
                                : "Layanan Grooming",
                        b.getStartDatetime() != null ? b.getStartDatetime().format(fmt) : null,
                        b.getEndDatetime() != null ? b.getEndDatetime().format(fmt) : null,
                        b.getAddressSnapshot(),
                        b.getTotalPrice(),
                        b.getStatus(),
                        b.getPaymentStatus(),
                        b.getCreatedAt() != null ? b.getCreatedAt().format(fmt) : null
                ))
                .toList();
    }

    @Transactional
    public void cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));
        if (booking.getStatus() == null || booking.getStatus().startsWith("cancelled")
                || "completed".equalsIgnoreCase(booking.getStatus())
                || "rejected".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking sudah tidak dapat dibatalkan");
        }
        booking.setStatus("cancelled_by_admin");
        booking.setCancellationReason(reason == null || reason.isBlank() ? "Dibatalkan oleh admin" : reason.trim());
        booking.setUpdatedAt(java.time.LocalDateTime.now());
        if ("paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            booking.setPaymentStatus("refund_pending");
            paymentRepository.findByBooking_Id(booking.getId()).ifPresent(payment -> {
                payment.setStatus("refund_pending");
                payment.setRefundReason(booking.getCancellationReason());
                payment.setUpdatedAt(java.time.LocalDateTime.now());
                paymentRepository.save(payment);
            });
        } else {
            booking.setPaymentStatus("unpaid");
            paymentRepository.findByBooking_Id(booking.getId()).ifPresent(payment -> {
                payment.setStatus("cancelled");
                payment.setUpdatedAt(java.time.LocalDateTime.now());
                paymentRepository.save(payment);
            });
        }
        bookingRepository.save(booking);
        auditService.record("CANCEL_BOOKING", "BOOKING", booking.getId(), booking.getCancellationReason());

        if (booking.getCustomer() != null) {
            notificationService.createNotification(booking.getCustomer().getId(), "Booking Dibatalkan Admin",
                    "Booking #" + booking.getBookingCode() + " dibatalkan oleh admin. Alasan: " + booking.getCancellationReason(),
                    "booking_cancelled", booking.getId());
        }
        if (booking.getBarber() != null) {
            notificationService.createNotification(booking.getBarber().getId(), "Booking Dibatalkan Admin",
                    "Booking #" + booking.getBookingCode() + " dibatalkan oleh admin.", "booking_cancelled", booking.getId());
        }
    }

    public AdminReportResponse getReportSummary() {
        List<Booking> allBookings = bookingRepository.findAll();

        long completedCount = allBookings.stream().filter(b -> "completed".equalsIgnoreCase(b.getStatus())).count();
        long cancelledCount = allBookings.stream().filter(b -> b.getStatus() != null && b.getStatus().startsWith("cancelled")).count();

        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> "completed".equalsIgnoreCase(b.getStatus()))
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalUsers = userRepository.count();
        long totalBarbers = barberProfileRepository.count();
        long totalBarbershops = barbershopRepository.count();

        // Barber performance breakdown
        List<AdminReportResponse.BarberPerformanceDto> barberList = new ArrayList<>();
        barberProfileRepository.findAll().forEach(bp -> {
            Long barberId = bp.getUser().getId();
            String barberName = bp.getUser().getName();
            String shopName = bp.getBarbershop() != null ? bp.getBarbershop().getName() : "Independent";

            List<Booking> barberBookings = allBookings.stream()
                    .filter(b -> b.getBarber() != null && b.getBarber().getId().equals(barberId))
                    .toList();

            long countTotal = barberBookings.size();
            long countCompleted = barberBookings.stream().filter(b -> "completed".equalsIgnoreCase(b.getStatus())).count();
            BigDecimal rev = barberBookings.stream()
                    .filter(b -> "completed".equalsIgnoreCase(b.getStatus()))
                    .map(Booking::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal avgRating = bp.getRatingAverage() != null ? bp.getRatingAverage() : BigDecimal.ZERO;

            barberList.add(new AdminReportResponse.BarberPerformanceDto(
                    barberId, barberName, shopName, countTotal, countCompleted, rev, avgRating
            ));
        });

        return new AdminReportResponse(
                totalRevenue,
                completedCount,
                cancelledCount,
                totalUsers,
                totalBarbers,
                totalBarbershops,
                barberList
        );
    }
}
