package com.coletare.backend.modules.notificacao.application.port.in;

import com.coletare.backend.modules.notificacao.domain.Notificacao;
import com.coletare.backend.modules.notificacao.domain.NotificacaoPayload;

import java.util.List;

public interface NotificacaoUseCase {
    NotificacaoPayload prepare(String title, String content, String routeId, String cityId);
    void markSent(String id);
    List<Notificacao> listByCityId(String cityId);
}
