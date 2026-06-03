package com.coletare.backend.modules.aviso.adapter.out.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SpringDataAvisoRepository extends MongoRepository<AvisoDocument, String> {
    List<AvisoDocument> findByCityIdOrderByCreatedAtDesc(String cityId);
}
