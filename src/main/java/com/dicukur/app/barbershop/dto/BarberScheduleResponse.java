package com.dicukur.app.barbershop.dto;

public record BarberScheduleResponse(
        Long id,
        Byte dayOfWeek,
        String startTime,
        String endTime,
        String status
) {
}
