package com.dicukur.app.payment.dto;

import java.math.BigDecimal;

public record PaymentRequest(
        Long bookingId,
        String paymentMethod,
        BigDecimal amount,
        String proof,
        String notes
) {
}
