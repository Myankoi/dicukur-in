package com.dicukur.app.review.dto;

public record ReviewRequest(
        Long bookingId,
        Integer rating,
        String review
) {
}
