package com.dicukur.app.registration.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record BarberRegistrationRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 100) String email,
        @Size(max = 20) String phone,
        @NotBlank @Size(min = 8, max = 72) String password,
        @Min(0) @Max(60) Integer experienceYears,
        @Size(max = 2000) String skillDescription,
        @NotBlank @Size(max = 2000) String address,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 100) String province,
        @DecimalMin("1.0") @DecimalMax("100.0") BigDecimal serviceRadiusKm
) {
}
