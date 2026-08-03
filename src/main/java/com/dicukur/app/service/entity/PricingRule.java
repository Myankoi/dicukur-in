package com.dicukur.app.service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "pricing_rules")
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "free_radius_km", nullable = false, precision = 6, scale = 2)
    private BigDecimal freeRadiusKm;

    @Column(name = "price_per_km", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerKm;

    @Column(name = "minimum_travel_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal minimumTravelFee;

    @Column(name = "maximum_travel_fee", precision = 12, scale = 2)
    private BigDecimal maximumTravelFee;

    @Column(nullable = false, length = 20)
    private String status;
}
