package com.dicukur.app.address.dto;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
        String label,
        String recipientName,
        String phone,
        @NotBlank String fullAddress,
        String district,
        String city,
        String province,
        String postalCode,
        double latitude,
        double longitude,
        String notes,
        boolean isDefault
) {
}
