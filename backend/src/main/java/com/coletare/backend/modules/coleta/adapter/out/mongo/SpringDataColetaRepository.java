package com.coletare.backend.modules.coleta.adapter.out.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SpringDataColetaRepository extends MongoRepository<ColetaDocument, String> {
    List<ColetaDocument> findByCityIdOrderByCreatedAtDesc(String cityId);
    List<ColetaDocument> findByRouteIdOrderByCreatedAtDesc(String routeId);
}
