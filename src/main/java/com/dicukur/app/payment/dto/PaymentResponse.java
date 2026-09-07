package com.dicukur.app.payment.dto;

import java.math.BigDecimal;

public record PaymentResponse(
        Long id,
        Long bookingId,
        String bookingCode,
        String customerName,
        String customerPhone,
        String paymentMethod,
        BigDecimal amount,
        String status,
        String proof,
        String snapToken,
        String paidAt,
        String verifiedAt,
        String notes,
        String createdAt,
        String refundReason,
        String refundReference,
        String refundProof,
        String refundedAt
) {
}
