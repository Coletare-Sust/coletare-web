package com.coletare.backend.modules.notificacao.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record PrepareNotificacaoRequest(
        @NotBlank String title,
        @NotBlank String content,
        @NotBlank String routeId,
        @NotBlank String cityId
) {
}
