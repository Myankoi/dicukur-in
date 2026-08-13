package com.dicukur.app.registration.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record OwnerRegistrationRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 100) String email,
        @Size(max = 20) String phone,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(max = 150) String businessName,
        @Size(max = 100) String businessLicenseNumber,
        @Size(max = 2000) String description,
        @NotBlank @Size(max = 2000) String address,
        @Size(max = 100) String district,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 100) String province,
        @Size(max = 20) String postalCode,
        @DecimalMin("1.0") @DecimalMax("100.0") BigDecimal serviceRadiusKm
) {
}
