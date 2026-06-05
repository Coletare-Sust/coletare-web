package com.coletare.backend.modules.notificacao.domain;

import java.time.Instant;

public record Notificacao(
        String id,
        String cityId,
        String routeId,
        String title,
        String content,
        int recipientCount,
        String status,
        Instant createdAt
) {
}
