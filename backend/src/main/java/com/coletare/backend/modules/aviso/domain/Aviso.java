package com.coletare.backend.modules.aviso.domain;

import java.time.Instant;

public record Aviso(
        String id,
        String cityId,
        String title,
        String description,
        String imageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
