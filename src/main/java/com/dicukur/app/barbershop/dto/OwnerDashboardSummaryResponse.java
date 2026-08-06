package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

public record OwnerDashboardSummaryResponse(
        Long barbershopId,
        String barbershopName,
        String verificationStatus,
        String status,
        long totalBookings,
        long completedBookings,
        long activeStaffCount,
        BigDecimal totalRevenue,
        BigDecimal ratingAverage
) {}
