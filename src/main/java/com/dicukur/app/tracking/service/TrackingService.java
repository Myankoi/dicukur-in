package com.dicukur.app.tracking.service;

import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.tracking.dto.TrackingResponse;
import com.dicukur.app.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TrackingService {
    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUserService;

    public TrackingService(BookingRepository bookingRepository, CurrentUserService currentUserService) {
        this.bookingRepository = bookingRepository;
        this.currentUserService = currentUserService;
    }

    public TrackingResponse getTracking(Long bookingId) {
        User user = currentUserService.requireUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));
        boolean admin = user.getRole() != null && "Admin".equalsIgnoreCase(user.getRole().getName());
        boolean allowed = admin
                || booking.getCustomer().getId().equals(user.getId())
                || booking.getBarber().getId().equals(user.getId());
        if (!allowed) throw new IllegalStateException("Anda tidak memiliki akses ke tracking booking ini");

        return new TrackingResponse(
                booking.getId(), booking.getBookingCode(), booking.getStatus(), booking.getPaymentStatus(),
                booking.getAddressSnapshot(), booking.getCustomerLatitude(), booking.getCustomerLongitude(),
                booking.getBarberLatitude(), booking.getBarberLongitude(), booking.getLocationAccuracy(),
                booking.getLocationUpdatedAt() == null ? "base" : "gps",
                booking.getLocationUpdatedAt() == null ? null : booking.getLocationUpdatedAt().toString(),
                booking.getBarber().getName(), booking.getBarber().getPhone(),
                booking.getCustomer().getName(), booking.getCustomer().getPhone(),
                booking.getStartDatetime().toString(), booking.getEndDatetime().toString()
        );
    }
}
