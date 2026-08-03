package com.dicukur.app.service.entity;

import com.dicukur.app.barbershop.entity.Barbershop;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "barbershop_services")
public class BarbershopService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "barbershop_id", nullable = false)
    private Barbershop barbershop;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceOffering service;

    @Column(name = "business_price", precision = 12, scale = 2)
    private BigDecimal businessPrice;

    @Column(name = "business_duration")
    private Integer businessDuration;

    @Column(nullable = false, length = 20)
    private String status;
}
