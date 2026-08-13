package com.dicukur.app.barbershop.dto;

import java.time.LocalDateTime;

public record BarbershopPhotoResponse(
    Long id,
    Long barbershopId,
    String filePath,
    String caption,
    Integer sortOrder,
    LocalDateTime uploadedAt
) {}
