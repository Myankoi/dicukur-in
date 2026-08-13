package com.dicukur.app.barbershop.dto;

public record BarberScheduleRequest(
        Long id,
        Byte dayOfWeek,
        String startTime,
        String endTime,
        String status
) {
}
