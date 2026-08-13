package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

public record BarberDashboardResponse(
        long pendingCount,
        long todayCompleted,
        long totalCompleted,
        BigDecimal totalEarnings,
        BigDecimal averageRating
) {
}
