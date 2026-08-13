package com.dicukur.app.notification.dto;

public record NotificationResponse(
        Long id,
        Long bookingId,
        Long registrationId,
        String title,
        String message,
        String type,
        Boolean isRead,
        String createdAt
) {
}
