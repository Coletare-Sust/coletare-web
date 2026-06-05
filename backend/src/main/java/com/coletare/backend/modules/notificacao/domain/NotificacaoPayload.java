package com.coletare.backend.modules.notificacao.domain;

import java.util.List;

public record NotificacaoPayload(
        String id,
        List<String> tokens,
        String title,
        String content,
        int recipientCount
) {
}
