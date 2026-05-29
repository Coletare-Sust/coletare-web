package com.coletare.backend.modules.ecoponto.application.port.out;

import com.coletare.backend.modules.ecoponto.domain.Ecoponto;

import java.util.List;
import java.util.Optional;

public interface EcopontoRepositoryPort {
    Ecoponto save(Ecoponto ecoponto);
    Optional<Ecoponto> findById(String id);
    List<Ecoponto> findAll();
    List<Ecoponto> findByCityId(String cityId);
    List<Ecoponto> findByResidueType(String residueType);
    List<Ecoponto> findNearby(Double latitude, Double longitude, Double radiusKm);
    void deleteById(String id);
    long count();
}
