package com.dicukur.app.admin.dto;

import java.math.BigDecimal;

public record AdminBookingResponse(
        Long id,
        String bookingCode,
        String customerName,
        String customerEmail,
        String barberName,
        String barbershopName,
        String serviceName,
        String startDatetime,
        String endDatetime,
        String address,
        BigDecimal totalPrice,
        String status,
        String paymentStatus,
        String createdAt
) {
}
