package com.dicukur.app.payment.entity;

import com.dicukur.app.booking.entity.Booking;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "gateway_transaction_id", length = 100)
    private String gatewayTransactionId;

    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod;

    @Column(name = "payment_type", length = 50)
    private String paymentType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(length = 255)
    private String proof;

    @Column(name = "snap_token", length = 255)
    private String snapToken;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
