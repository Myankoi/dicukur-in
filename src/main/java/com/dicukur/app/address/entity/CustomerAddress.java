package com.dicukur.app.address.entity;

import com.dicukur.app.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "customer_addresses")
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(length = 50)
    private String label;

    @Column(name = "recipient_name", length = 100)
    private String recipientName;

    @Column(length = 20)
    private String phone;

    @Column(name = "full_address", nullable = false, columnDefinition = "TEXT")
    private String fullAddress;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String province;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
