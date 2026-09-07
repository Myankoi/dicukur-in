package com.dicukur.app.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BookingRequest(
        @NotNull Long barbershopId,
        @NotNull Long barberId,
        @NotNull Long addressId,
    @NotEmpty(message = "Minimal satu peserta harus ditambahkan")
    @Valid List<BookingItemRequest> items,
        @NotNull String startDatetime,
        String notes
) {
}
