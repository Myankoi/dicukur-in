package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

public record NearbyBarbershopResponse(
        Long id,
        String name,
        String description,
        String address,
        String district,
        String city,
        String province,
        double latitude,
        double longitude,
        double distanceKm,
        BigDecimal ratingAverage,
        Integer totalCompleted,
        BigDecimal serviceRadiusKm
) {
}
