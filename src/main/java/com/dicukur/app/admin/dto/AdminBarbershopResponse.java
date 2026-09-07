package com.dicukur.app.admin.dto;

import java.math.BigDecimal;

public record AdminBarbershopResponse(
        Long id, String name, String ownerName, String ownerEmail, String city,
        String verificationStatus, String status, Integer staffCount, long bookingCount,
        BigDecimal ratingAverage
) {}
