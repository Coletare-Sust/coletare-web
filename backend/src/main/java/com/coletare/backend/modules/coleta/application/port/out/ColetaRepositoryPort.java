package com.coletare.backend.modules.coleta.application.port.out;

import com.coletare.backend.modules.coleta.domain.Coleta;

import java.util.List;
import java.util.Optional;

public interface ColetaRepositoryPort {
    Coleta save(Coleta coleta);
    Optional<Coleta> findById(String id);
    List<Coleta> findAll();
    List<Coleta> findByCityId(String cityId);
    List<Coleta> findByRouteId(String routeId);
    List<Coleta> findByCityIdAndHasEndedFalse(String cityId);
    void deleteById(String id);
}
