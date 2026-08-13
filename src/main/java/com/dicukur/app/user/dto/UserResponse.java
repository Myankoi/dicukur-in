package com.dicukur.app.user.dto;

public record UserResponse(
        Long id,
        String name,
        String email,
        String phone,
        String roleName,
        String status,
        String notes,
        String createdAt,
        String updatedAt
) {
}
