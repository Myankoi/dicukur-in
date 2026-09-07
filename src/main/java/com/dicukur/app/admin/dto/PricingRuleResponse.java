package com.dicukur.app.admin.dto;

import java.math.BigDecimal;

public record PricingRuleResponse(Long id, String name, BigDecimal freeRadiusKm, BigDecimal pricePerKm,
                                  BigDecimal minimumTravelFee, BigDecimal maximumTravelFee, String status) {}
