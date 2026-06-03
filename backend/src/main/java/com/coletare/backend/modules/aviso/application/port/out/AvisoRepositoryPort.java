package com.coletare.backend.modules.aviso.application.port.out;

import com.coletare.backend.modules.aviso.domain.Aviso;

import java.util.List;
import java.util.Optional;

public interface AvisoRepositoryPort {
    Aviso save(Aviso aviso);
    Optional<Aviso> findById(String id);
    List<Aviso> findAll();
    List<Aviso> findByCityId(String cityId);
    void deleteById(String id);
}
