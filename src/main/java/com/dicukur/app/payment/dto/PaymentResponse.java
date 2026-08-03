package com.dicukur.app.payment.dto;

public record PaymentResponse(
        Long bookingId,
        String bookingCode,
        String status,
        String snapToken,
        String redirectUrl,
        String message
) {
}
