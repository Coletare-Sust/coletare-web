package com.coletare.backend.modules.rota.application.port.in;

import com.coletare.backend.modules.rota.domain.Rota;

import java.util.List;
import java.util.Optional;

public interface RotaUseCase {
    Rota create(Rota rota);

    Rota update(String id, Rota rota);

    Optional<Rota> findById(String id);

    List<Rota> listAll();

    List<Rota> listByCityId(String cityId);

    List<Rota> listByAssignedVehicleId(String vehicleId);

    List<Rota> listByStatus(String status);

    void delete(String id);
}
