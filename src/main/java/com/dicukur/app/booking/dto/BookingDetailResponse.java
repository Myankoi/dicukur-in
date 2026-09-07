package com.dicukur.app.booking.dto;

import java.math.BigDecimal;

public record BookingDetailResponse(
        Long id,
        String participantName,
        Integer sequenceNumber,
        Long serviceId,
        String serviceName,
        BigDecimal price,
        Integer duration,
        BigDecimal subtotal
) {
}
