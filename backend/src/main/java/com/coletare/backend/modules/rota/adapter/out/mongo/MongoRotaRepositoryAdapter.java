package com.coletare.backend.modules.rota.adapter.out.mongo;

import com.coletare.backend.modules.rota.application.port.out.RotaRepositoryPort;
import com.coletare.backend.modules.rota.domain.Rota;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class MongoRotaRepositoryAdapter implements RotaRepositoryPort {

    private final SpringDataRotaRepository repository;

    public MongoRotaRepositoryAdapter(SpringDataRotaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Rota save(Rota rota) {
        RotaDocument saved = repository.save(toDocument(rota));
        return toDomain(saved);
    }

    @Override
    public Optional<Rota> findById(String id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Rota> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Rota> findByCityId(String cityId) {
        return repository.findByCityId(cityId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Rota> findByAssignedVehicleId(String vehicleId) {
        return repository.findByAssignedVehicleId(vehicleId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Rota> findByStatus(String status) {
        return repository.findByStatus(status).stream().map(this::toDomain).toList();
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    private RotaDocument toDocument(Rota rota) {
        RotaDocument document = new RotaDocument();
        document.setId(rota.id());
        document.setName(rota.name());
        document.setCityId(rota.cityId());
        document.setPeriod(rota.period());
        document.setDays(rota.days());
        document.setResidueType(rota.residueType());
        document.setPolyline(rota.polyline());
        document.setWasChecked(rota.wasChecked());
        document.setWithdrawalRequestsIds(rota.withdrawalRequestsIds());
        document.setIsSpecial(rota.isSpecial());
        document.setAssignedVehicleId(rota.assignedVehicleId());
        document.setAssignedCollaborators(rota.assignedCollaborators());
        document.setStatus(rota.status());
        document.setCreatedAt(rota.createdAt());
        document.setUpdatedAt(rota.updatedAt());
        if (rota.waypoints() != null) {
            document.setWaypoints(rota.waypoints().stream().map(this::toDocumentWaypoint).toList());
        }
        return document;
    }

    private RotaDocument.WaypointDocument toDocumentWaypoint(Rota.Waypoint waypoint) {
        RotaDocument.WaypointDocument document = new RotaDocument.WaypointDocument();
        document.setLat(waypoint.lat());
        document.setLng(waypoint.lng());
        document.setWasChecked(waypoint.wasChecked());
        return document;
    }

    private Rota toDomain(RotaDocument document) {
        return new Rota(
                document.getId(),
                document.getName(),
                document.getCityId(),
                document.getPeriod(),
                document.getDays(),
                document.getResidueType(),
                document.getWaypoints() == null ? List.of() : document.getWaypoints().stream().map(this::toDomainWaypoint).toList(),
                document.getPolyline(),
                document.isWasChecked(),
                document.getWithdrawalRequestsIds() == null ? List.of() : document.getWithdrawalRequestsIds(),
                document.isSpecial(),
                document.getAssignedVehicleId(),
                document.getAssignedCollaborators() == null ? List.of() : document.getAssignedCollaborators(),
                document.getStatus(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }

    private Rota.Waypoint toDomainWaypoint(RotaDocument.WaypointDocument waypoint) {
        return new Rota.Waypoint(waypoint.getLat(), waypoint.getLng(), waypoint.isWasChecked());
    }
}
