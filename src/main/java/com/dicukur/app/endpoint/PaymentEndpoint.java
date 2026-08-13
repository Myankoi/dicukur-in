package com.dicukur.app.endpoint;

import com.dicukur.app.payment.dto.PaymentRequest;
import com.dicukur.app.payment.dto.PaymentResponse;
import com.dicukur.app.payment.service.PaymentService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;

import java.util.List;

@BrowserCallable
@RolesAllowed({"CUSTOMER", "BARBER", "Barber", "OWNER", "Owner", "ADMIN", "Admin"})
public class PaymentEndpoint {

    private final PaymentService paymentService;

    public PaymentEndpoint(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public PaymentResponse submitPayment(PaymentRequest request) {
        return paymentService.submitPayment(request);
    }

    public PaymentResponse verifyPayment(Long paymentId, String action, String notes) {
        return paymentService.verifyPayment(paymentId, action, notes);
    }

    public PaymentResponse getPaymentByBooking(Long bookingId) {
        return paymentService.getPaymentByBooking(bookingId);
    }

    @RolesAllowed({"ADMIN", "Admin"})
    public List<PaymentResponse> getAllPayments() {
        return paymentService.getAllPayments();
    }
}
