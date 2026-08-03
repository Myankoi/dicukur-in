package com.dicukur.app.endpoint;

import com.dicukur.app.payment.dto.PaymentResponse;
import com.dicukur.app.payment.service.PaymentService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;

@BrowserCallable
@RolesAllowed("CUSTOMER")
public class PaymentEndpoint {

    private final PaymentService paymentService;

    public PaymentEndpoint(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public PaymentResponse start(Long bookingId) {
        return paymentService.start(bookingId);
    }
}
