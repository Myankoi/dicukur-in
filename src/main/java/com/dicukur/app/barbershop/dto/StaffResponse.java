package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

public record StaffResponse(
        Long id,
        String name,
        String position,
        BigDecimal ratingAverage,
        Integer totalCompleted,
        String availabilityStatus
) {
}
