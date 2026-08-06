package com.dicukur.app.servicecatalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ServiceOfferingRequest(
        @NotBlank(message = "Nama layanan wajib diisi")
        String name,

        String description,

        @NotNull(message = "Harga layanan wajib diisi")
        @DecimalMin(value = "0.0", message = "Harga tidak boleh negatif")
        BigDecimal price,

        @NotNull(message = "Durasi layanan wajib diisi")
        @Min(value = 5, message = "Durasi minimal 5 menit")
        Integer duration,

        String status
) {}
