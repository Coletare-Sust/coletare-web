package com.coletare.backend.modules.notificacao.adapter.out.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SpringDataNotificacaoRepository extends MongoRepository<NotificacaoDocument, String> {
    List<NotificacaoDocument> findByCityIdOrderByCreatedAtDesc(String cityId);
}
