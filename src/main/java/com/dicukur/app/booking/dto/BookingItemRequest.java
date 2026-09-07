package com.dicukur.app.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookingItemRequest(
        @NotBlank(message = "Nama peserta wajib diisi") String participantName,
        @NotNull Long serviceId
) {
}
