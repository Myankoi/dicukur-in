package com.dicukur.app.servicecatalog.dto;

import java.math.BigDecimal;

public record ServiceOfferingResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer duration,
        String status
) {}
