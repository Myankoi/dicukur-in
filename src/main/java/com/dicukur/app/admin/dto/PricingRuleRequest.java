package com.dicukur.app.admin.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PricingRuleRequest(
        @NotBlank String name,
        @NotNull @DecimalMin("0") BigDecimal freeRadiusKm,
        @NotNull @DecimalMin("0") BigDecimal pricePerKm,
        @NotNull @DecimalMin("0") BigDecimal minimumTravelFee,
        @DecimalMin("0") BigDecimal maximumTravelFee
) {}
