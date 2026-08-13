package com.dicukur.app.barbershop.dto;

import java.math.BigDecimal;

public record StaffResponse(
        Long staffId,
        Long barberUserId,
        String name,
        String email,
        String phone,
        String position,
        String employmentStatus,
        String joinedAt,
        BigDecimal ratingAverage,
        Integer totalCompleted,
        String availabilityStatus,
        String photo
) {
    // Constructor fleksibel untuk BarbershopDiscoveryService
    public StaffResponse(Long id, String name, String position, BigDecimal ratingAverage, Integer totalCompleted, String availabilityStatus, String photo) {
        this(id, id, name, null, null, position, "active", null, ratingAverage, totalCompleted, availabilityStatus, photo);
    }
    public StaffResponse(Long id, String name, String position, BigDecimal ratingAverage, Integer totalCompleted, String availabilityStatus) {
        this(id, id, name, null, null, position, "active", null, ratingAverage, totalCompleted, availabilityStatus, null);
    }
}
