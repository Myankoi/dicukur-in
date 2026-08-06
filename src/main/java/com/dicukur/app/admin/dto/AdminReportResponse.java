package com.dicukur.app.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminReportResponse(
        BigDecimal totalRevenue,
        long completedBookings,
        long cancelledBookings,
        long totalUsers,
        long totalBarbers,
        long totalBarbershops,
        List<BarberPerformanceDto> topBarbers
) {
    public record BarberPerformanceDto(
            Long barberId,
            String barberName,
            String barbershopName,
            long totalBookings,
            long completedBookings,
            BigDecimal totalRevenue,
            BigDecimal averageRating
    ) {}
}
