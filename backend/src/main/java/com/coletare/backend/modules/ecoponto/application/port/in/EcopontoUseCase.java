package com.coletare.backend.modules.ecoponto.application.port.in;

import com.coletare.backend.modules.ecoponto.domain.Ecoponto;

import java.util.List;
import java.util.Optional;

public interface EcopontoUseCase {
    Ecoponto create(Ecoponto ecoponto);
    Ecoponto update(String id, Ecoponto ecoponto);
    Optional<Ecoponto> findById(String id);
    List<Ecoponto> listByCity(String cityId);
    List<Ecoponto> listByResidueType(String residueType);
    List<Ecoponto> listNearby(Double latitude, Double longitude, Double radiusKm);
    List<Ecoponto> listAll();
    void delete(String id);
}
