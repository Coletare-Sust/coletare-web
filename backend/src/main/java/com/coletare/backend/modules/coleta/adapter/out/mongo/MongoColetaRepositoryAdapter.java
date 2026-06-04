package com.coletare.backend.modules.coleta.adapter.out.mongo;

import com.coletare.backend.modules.coleta.application.port.out.ColetaRepositoryPort;
import com.coletare.backend.modules.coleta.domain.Coleta;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class MongoColetaRepositoryAdapter implements ColetaRepositoryPort {

    private final SpringDataColetaRepository repository;

    public MongoColetaRepositoryAdapter(SpringDataColetaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Coleta save(Coleta c) {
        return toDomain(repository.save(toDocument(c)));
    }

    @Override
    public Optional<Coleta> findById(String id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Coleta> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Coleta> findByCityId(String cityId) {
        return repository.findByCityIdOrderByCreatedAtDesc(cityId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Coleta> findByRouteId(String routeId) {
        return repository.findByRouteIdOrderByCreatedAtDesc(routeId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Coleta> findByCityIdAndHasEndedFalse(String cityId) {
        return repository.findByCityIdAndHasEndedFalse(cityId).stream().map(this::toDomain).toList();
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    private ColetaDocument toDocument(Coleta c) {
        ColetaDocument d = new ColetaDocument();
        d.setId(c.id()); d.setCityId(c.cityId()); d.setRouteId(c.routeId());
        d.setVehicleName(c.vehicleName()); d.setCarPlate(c.carPlate());
        d.setEmployeeId(c.employeeId()); d.setMass(c.mass());
        d.setConsume(c.consume()); d.setEmission(c.emission());
        if (c.cost() != null) {
            ColetaDocument.ColetaCostDocument cost = new ColetaDocument.ColetaCostDocument();
            cost.setLandfillDelivery(c.cost().landfillDelivery());
            cost.setFuel(c.cost().fuel());
            d.setCost(cost);
        }
        d.setKmRun(c.kmRun()); d.setWithdrawalRequestsIds(c.withdrawalRequestsIds());
        d.setDuration(c.duration()); d.setVehicleLatitude(c.vehicleLatitude());
        d.setVehicleLongitude(c.vehicleLongitude()); d.setHasEnded(c.hasEnded());
        d.setCreatedAt(c.createdAt()); d.setUpdatedAt(c.updatedAt());
        return d;
    }

    private Coleta toDomain(ColetaDocument d) {
        Coleta.ColetaCost cost = d.getCost() != null
                ? new Coleta.ColetaCost(d.getCost().getLandfillDelivery(), d.getCost().getFuel())
                : null;
        return new Coleta(
                d.getId(), d.getCityId(), d.getRouteId(), d.getVehicleName(), d.getCarPlate(),
                d.getEmployeeId(), d.getMass(), d.getConsume(), d.getEmission(), cost,
                d.getKmRun(), d.getWithdrawalRequestsIds(), d.getDuration(),
                d.getVehicleLatitude(), d.getVehicleLongitude(), d.isHasEnded(),
                d.getCreatedAt(), d.getUpdatedAt()
        );
    }
}
