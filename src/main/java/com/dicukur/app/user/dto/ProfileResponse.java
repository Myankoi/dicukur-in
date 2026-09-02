package com.dicukur.app.user.dto;

public record ProfileResponse(
        Long id,
        String name,
        String email,
        String phone,
        String photo,
        String roleName,
        String status,
        String notes
) {
}
