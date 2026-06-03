package com.coletare.backend.modules.user.domain;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record User(
        String id,
        String externalId,
        String email,
        String displayName,
        String cityId,
        List<String> roles,
        Map<String, Object> metadata,
        Instant createdAt,
        Instant updatedAt
) {
}
