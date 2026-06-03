package com.coletare.backend.modules.rota.application.port.out;

import com.coletare.backend.modules.rota.domain.Rota;

import java.util.List;
import java.util.Optional;

public interface RotaRepositoryPort {
    Rota save(Rota rota);

    Optional<Rota> findById(String id);

    List<Rota> findAll();

    List<Rota> findByCityId(String cityId);

    List<Rota> findByAssignedVehicleId(String vehicleId);

    List<Rota> findByStatus(String status);

    void deleteById(String id);
}
