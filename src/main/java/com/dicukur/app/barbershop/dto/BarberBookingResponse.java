package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

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
        BigDecimal distanceKm,
        BigDecimal totalPrice,
        String status,
        String paymentStatus,
        String notes,
        String cancellationReason
) {
}
