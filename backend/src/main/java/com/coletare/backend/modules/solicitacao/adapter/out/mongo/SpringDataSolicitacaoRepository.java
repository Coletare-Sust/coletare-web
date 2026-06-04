package com.coletare.backend.modules.solicitacao.adapter.out.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SpringDataSolicitacaoRepository extends MongoRepository<SolicitacaoRetiradaDocument, String> {
    List<SolicitacaoRetiradaDocument> findByCityIdOrderByCreatedAtDesc(String cityId);
}
