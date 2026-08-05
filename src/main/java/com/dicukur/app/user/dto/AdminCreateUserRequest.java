package com.dicukur.app.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCreateUserRequest(
        @NotBlank(message = "Nama wajib diisi")
        String name,

        @NotBlank(message = "Email wajib diisi")
        @Email(message = "Format email tidak valid")
        String email,

        String phone,

        @NotBlank(message = "Password wajib diisi")
        @Size(min = 6, message = "Password minimal 6 karakter")
        String password,

        @NotBlank(message = "Role wajib dipilih")
        String roleName,

        String status,
        String notes
) {
}
