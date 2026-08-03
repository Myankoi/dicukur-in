package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;
import java.util.List;

public record BarbershopDetailResponse(
        Long id,
        String name,
        String description,
        String address,
        String district,
        String city,
        String province,
        String phone,
        double latitude,
        double longitude,
        BigDecimal serviceRadiusKm,
        BigDecimal ratingAverage,
        Integer totalCompleted,
        List<StaffResponse> staff,
        List<ShopServiceResponse> services
) {
}
