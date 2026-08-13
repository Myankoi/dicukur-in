package com.dicukur.app.booking.dto;

import java.math.BigDecimal;

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
        BigDecimal distanceKm,
        BigDecimal serviceSubtotal,
        BigDecimal travelFee,
        BigDecimal totalPrice,
        String status,
        String paymentStatus
) {
}
