package com.dicukur.app.barbershop.dto;

import com.dicukur.app.booking.dto.BookingDetailResponse;
import java.math.BigDecimal;
import java.util.List;

public record BarberBookingResponse(
        Long id,
        String bookingCode,
        String customerName,
        String customerPhone,
        String serviceName,
        String startDatetime,
        String endDatetime,
        String address,
        BigDecimal customerLatitude,
        BigDecimal customerLongitude,
        BigDecimal barberLatitude,
        BigDecimal barberLongitude,
        BigDecimal distanceKm,
        BigDecimal totalPrice,
        String status,
        String paymentStatus,
        String notes,
        String cancellationReason,
        String paymentDeadline,
        String locationUpdatedAt,
        List<BookingDetailResponse> details
) {
}
