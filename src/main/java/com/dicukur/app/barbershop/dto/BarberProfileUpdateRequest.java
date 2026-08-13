package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

public record BarberProfileUpdateRequest(
        String name,
        String phone,
        String bio,
        Integer experienceYears,
        String baseAddress,
        BigDecimal baseLatitude,
        BigDecimal baseLongitude,
        String photo
) {
}
