package com.coletare.backend.modules.auth.domain;

import java.time.Instant;

public record AuthSession(
        String sessionId,
        String userId,
        String email,
        AuthTokens tokens,
        Instant createdAt,
        Instant updatedAt
) {
}
