package com.dicukur.app.review.dto;

public record ReviewResponse(
        Long id,
        Long bookingId,
        String customerName,
        String barberName,
        String barbershopName,
        Integer rating,
        String review,
        String createdAt
) {
}
