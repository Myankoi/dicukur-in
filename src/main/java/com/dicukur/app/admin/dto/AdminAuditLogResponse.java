package com.dicukur.app.admin.dto;

public record AdminAuditLogResponse(
        Long id,
        Long adminId,
        String adminName,
        String action,
        String targetType,
        Long targetId,
        String details,
        String createdAt
) {
}
