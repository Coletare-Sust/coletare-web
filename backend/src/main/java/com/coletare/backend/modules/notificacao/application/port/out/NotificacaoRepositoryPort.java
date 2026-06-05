package com.coletare.backend.modules.notificacao.application.port.out;

import com.coletare.backend.modules.notificacao.domain.Notificacao;

import java.util.List;
import java.util.Optional;

public interface NotificacaoRepositoryPort {
    Notificacao save(Notificacao notificacao);
    Optional<Notificacao> findById(String id);
    List<Notificacao> findByCityId(String cityId);
}
