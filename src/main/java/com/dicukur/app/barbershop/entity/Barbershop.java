package com.dicukur.app.barbershop.entity;

import com.dicukur.app.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "barbershops")
public class Barbershop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private com.dicukur.app.registration.entity.BarberRegistration registration;

    @Column(length = 150, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "business_phone", length = 20)
    private String businessPhone;

    @Column(name = "business_email", length = 100)
    private String businessEmail;

    @Column(name = "business_license_number", length = 100)
    private String businessLicenseNumber;

    @Column(name = "business_address", nullable = false, columnDefinition = "TEXT")
    private String businessAddress;

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

    @Column(name = "service_radius_km", nullable = false, precision = 6, scale = 2)
    private BigDecimal serviceRadiusKm;

    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "rating_average", nullable = false, precision = 3, scale = 2)
    private BigDecimal ratingAverage;

    @Column(name = "total_completed", nullable = false)
    private Integer totalCompleted;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
