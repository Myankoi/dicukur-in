package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

public record BarberProfileResponse(
        String name,
        String email,
        String phone,
        String bio,
        Integer experienceYears,
        String baseAddress,
        BigDecimal baseLatitude,
        BigDecimal baseLongitude,
        BigDecimal serviceRadiusKm,
        String verificationStatus,
        String availabilityStatus,
        BigDecimal ratingAverage,
        Integer totalCompleted
) {
}
