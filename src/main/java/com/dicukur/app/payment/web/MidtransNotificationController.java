package com.dicukur.app.payment.web;

import com.dicukur.app.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/midtrans")
public class MidtransNotificationController {

    private final PaymentService paymentService;

    public MidtransNotificationController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/notification")
    public ResponseEntity<Void> notification(@RequestBody Map<String, String> payload) {
        paymentService.processNotification(payload);
        return ResponseEntity.ok().build();
    }
}
