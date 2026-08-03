package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

public record ShopServiceResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer duration
) {
}
