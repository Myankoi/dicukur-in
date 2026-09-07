package com.dicukur.app.barbershop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StaffInvitationRequest(
        @NotBlank(message = "Email barber wajib diisi") @Email String email,
        String phone,
        String position
) {
}
