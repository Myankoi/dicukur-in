package com.dicukur.app.barbershop.entity;

import com.dicukur.app.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "barber_profiles")
public class BarberProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "barber_type", nullable = false, length = 20)
    private String barberType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barbershop_id")
    private Barbershop barbershop;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;

    @Column(name = "base_address", columnDefinition = "TEXT")
    private String baseAddress;

    @Column(name = "base_latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal baseLatitude;

    @Column(name = "base_longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal baseLongitude;

    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus;

    @Column(name = "availability_status", nullable = false, length = 20)
    private String availabilityStatus;

    @Column(name = "rating_average", nullable = false, precision = 3, scale = 2)
    private BigDecimal ratingAverage;

    @Column(name = "total_completed", nullable = false)
    private Integer totalCompleted;
}
