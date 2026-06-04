package com.coletare.backend.modules.solicitacao.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record SolicitacaoRetirada(
        String id,
        String cityId,
        String createdById,
        String fullAddress,
        Double latitude,
        Double longitude,
        String residueType,
        String type,
        @JsonProperty("isResolved") boolean isResolved,
        String imageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
