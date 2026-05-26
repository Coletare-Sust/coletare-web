package com.coletare.backend.modules.auth.domain;

import java.time.Instant;
import java.util.List;

public record AuthTokens(
        String accessToken,
        String refreshToken,
        long expiresIn,
        String tokenType,
        String subject,
        String email,
        List<String> roles,
        Instant issuedAt
) {
}
