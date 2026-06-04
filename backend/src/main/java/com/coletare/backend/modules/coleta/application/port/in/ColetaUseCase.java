package com.coletare.backend.modules.coleta.application.port.in;

import com.coletare.backend.modules.coleta.application.dto.DashboardData;
import com.coletare.backend.modules.coleta.domain.Coleta;

import java.util.List;
import java.util.Optional;

public interface ColetaUseCase {
    Coleta create(Coleta coleta);
    Coleta update(String id, Coleta coleta);
    Optional<Coleta> findById(String id);
    List<Coleta> listAll();
    List<Coleta> listByCityId(String cityId);
    List<Coleta> listByRouteId(String routeId);
    List<Coleta> listActiveByCityId(String cityId);
    void delete(String id);
    DashboardData getDashboardData(String cityId, String routeId);
}
