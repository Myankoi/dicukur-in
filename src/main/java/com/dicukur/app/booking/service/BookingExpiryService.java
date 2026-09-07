package com.dicukur.app.booking.service;

import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.notification.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class BookingExpiryService {
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public BookingExpiryService(BookingRepository bookingRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireUnpaidBookings() {
        bookingRepository.findByStatusAndPaymentStatusAndPaymentDeadlineBefore(
                        "accepted", "unpaid", LocalDateTime.now())
                .forEach(this::expire);
    }

    private void expire(Booking booking) {
        booking.setStatus("cancelled_unpaid");
        booking.setCancellationReason("Pembayaran tidak diselesaikan dalam 30 menit setelah booking diterima");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        if (booking.getCustomer() != null) {
            notificationService.createNotification(booking.getCustomer().getId(), "Booking kedaluwarsa",
                    "Booking #" + booking.getBookingCode() + " dibatalkan karena pembayaran belum selesai.",
                    "booking_expired", booking.getId());
        }
        if (booking.getBarber() != null) {
            notificationService.createNotification(booking.getBarber().getId(), "Slot booking dilepas",
                    "Booking #" + booking.getBookingCode() + " kedaluwarsa karena belum dibayar.",
                    "booking_expired", booking.getId());
        }
    }
}
