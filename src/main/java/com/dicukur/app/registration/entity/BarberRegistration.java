package com.dicukur.app.registration.entity;

import com.dicukur.app.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "barber_registrations")
public class BarberRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Column(name = "registration_type", nullable = false, length = 20)
    private String registrationType;

    @Column(name = "personal_experience_years")
    private Integer personalExperienceYears;

    @Column(name = "personal_skill_description", columnDefinition = "TEXT")
    private String personalSkillDescription;

    @Column(name = "business_name", length = 150)
    private String businessName;

    @Column(name = "business_license_number", length = 100)
    private String businessLicenseNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String province;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "service_radius_km", nullable = false, precision = 6, scale = 2)
    private BigDecimal serviceRadiusKm;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
