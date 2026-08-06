package com.dicukur.app.barbershop.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BarbershopUpdateRequest(
        @NotBlank(message = "Nama barbershop wajib diisi")
        String name,

        String description,
        String businessPhone,
        String businessEmail,
        String businessLicenseNumber,

        @NotBlank(message = "Alamat lengkap wajib diisi")
        String businessAddress,

        String district,

        @NotBlank(message = "Kota wajib diisi")
        String city,

        String province,
        String postalCode,

        @NotNull(message = "Latitude wajib diisi")
        @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
        BigDecimal latitude,

        @NotNull(message = "Longitude wajib diisi")
        @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
        BigDecimal longitude,

        @NotNull(message = "Radius layanan wajib diisi")
        @DecimalMin(value = "0.5") @DecimalMax(value = "100.0")
        BigDecimal serviceRadiusKm
) {}
