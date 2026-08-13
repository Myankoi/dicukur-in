package com.dicukur.app.registration.dto;

import java.math.BigDecimal;
import java.util.List;

public record RegistrationResponse(
        Long id,
        Long applicantId,
        String applicantName,
        String applicantEmail,
        String applicantPhone,
        String registrationType,
        String businessName,
        String businessLicenseNumber,
        String description,
        String address,
        String district,
        String city,
        String province,
        String postalCode,
        BigDecimal serviceRadiusKm,
        String status,
        String submittedAt,
        String reviewedByName,
        String reviewedAt,
        String adminNotes,
        String rejectionReason,
        List<DocumentResponse> documents
) {
}
