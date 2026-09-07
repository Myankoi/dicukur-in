package com.dicukur.app.booking.dto;

import java.math.BigDecimal;
import java.util.List;

public record BookingResponse(
        Long id,
        String bookingCode,
        String barbershopName,
        String barberName,
        String serviceName,
        String startDatetime,
        String endDatetime,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal barberLatitude,
        BigDecimal barberLongitude,
        String barberPhone,
        BigDecimal distanceKm,
        BigDecimal serviceSubtotal,
        BigDecimal travelFee,
        BigDecimal totalPrice,
        String status,
        String paymentStatus,
        String paymentDeadline,
        String locationUpdatedAt,
        List<BookingDetailResponse> details
) {
}
