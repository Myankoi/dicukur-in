package com.dicukur.app.booking.dto;

import jakarta.validation.constraints.NotNull;

public record BookingRequest(
        @NotNull Long barbershopId,
        @NotNull Long barberId,
        @NotNull Long addressId,
        @NotNull Long serviceId,
        @NotNull String startDatetime,
        String notes
) {
}
