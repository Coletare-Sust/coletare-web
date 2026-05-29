package com.coletare.backend.modules.ecoponto.adapter.out.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataEcopontoRepository extends MongoRepository<EcopontoDocument, String> {
    
    List<EcopontoDocument> findByCityId(String cityId);
    
    List<EcopontoDocument> findByResidueTypeContaining(String residueType);
}
