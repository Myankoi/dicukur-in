package com.dicukur.app.barbershop.dto;

public record BarberTimeOffResponse(
        Long id,
        String startDatetime,
        String endDatetime
) {
}
