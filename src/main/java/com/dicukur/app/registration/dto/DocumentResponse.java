package com.dicukur.app.registration.dto;

public record DocumentResponse(
        Long id,
        String documentType,
        String fileName,
        String filePath,
        String mimeType,
        Long fileSize,
        String verificationStatus,
        String adminNotes
) {
}
