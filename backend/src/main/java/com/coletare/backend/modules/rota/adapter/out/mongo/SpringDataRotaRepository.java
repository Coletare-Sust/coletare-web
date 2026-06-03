package com.coletare.backend.modules.rota.adapter.out.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SpringDataRotaRepository extends MongoRepository<RotaDocument, String> {
    List<RotaDocument> findByCityId(String cityId);

    List<RotaDocument> findByAssignedVehicleId(String assignedVehicleId);

    List<RotaDocument> findByStatus(String status);
}
