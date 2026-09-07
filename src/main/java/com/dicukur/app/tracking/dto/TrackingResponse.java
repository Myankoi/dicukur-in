package com.dicukur.app.tracking.dto;

import java.math.BigDecimal;

public record TrackingResponse(
        Long bookingId,
        String bookingCode,
        String status,
        String paymentStatus,
        String customerAddress,
        BigDecimal customerLatitude,
        BigDecimal customerLongitude,
        BigDecimal barberLatitude,
        BigDecimal barberLongitude,
        BigDecimal barberAccuracy,
        String barberLocationSource,
        String locationUpdatedAt,
        String barberName,
        String barberPhone,
        String customerName,
        String customerPhone,
        String startDatetime,
        String endDatetime
) {
}
