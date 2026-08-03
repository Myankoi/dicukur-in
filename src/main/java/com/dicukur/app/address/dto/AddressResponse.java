package com.dicukur.app.address.dto;

public record AddressResponse(
        Long id,
        String label,
        String recipientName,
        String phone,
        String fullAddress,
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
