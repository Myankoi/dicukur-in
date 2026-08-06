package com.dicukur.app.barbershop.dto;

public record BarberTimeOffRequest(
        Long id,
        String startDatetime,
        String endDatetime
) {
}
