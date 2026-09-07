package com.dicukur.app.barbershop.dto;

public record StaffInvitationResponse(
        Long id,
        String email,
        String phone,
        String position,
        String status,
        String expiresAt,
        String inviteToken,
        String invitePath
) {
}
