package com.coletare.backend.modules.ecoponto.domain;

import java.time.Instant;
import java.util.List;

public record Ecoponto(
        String id,
        String cityId,
        Instant createdAt,
        String description,
        Boolean isActive,
        Double lat,
        Double lng,
        String name,
        List<String> residueType,
        Instant updatedAt
) {
}
