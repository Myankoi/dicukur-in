package com.dicukur.app.registration.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistrationDocumentRequest(
        Long registrationId,
        @NotBlank String documentType,
        @NotBlank String filePath,
        String fileName,
        String mimeType,
        Long fileSize
) {
}
