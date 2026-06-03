package com.coletare.backend.modules.aviso.application.port.in;

import com.coletare.backend.modules.aviso.domain.Aviso;

import java.util.List;
import java.util.Optional;

public interface AvisoUseCase {
    Aviso create(Aviso aviso);
    Aviso update(String id, Aviso aviso);
    Optional<Aviso> findById(String id);
    List<Aviso> listByCityId(String cityId);
    List<Aviso> listAll();
    void delete(String id);
}
