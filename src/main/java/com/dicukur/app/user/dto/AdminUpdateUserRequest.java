package com.dicukur.app.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminUpdateUserRequest(
        @NotBlank(message = "Nama wajib diisi")
        String name,

        @NotBlank(message = "Email wajib diisi")
        @Email(message = "Format email tidak valid")
        String email,

        String phone,
        String password,
        String status,
        String notes
) {
}
