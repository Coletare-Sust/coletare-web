package com.coletare.backend.modules.rota.application.service;

import com.coletare.backend.modules.rota.application.port.in.RotaUseCase;
import com.coletare.backend.modules.rota.application.port.out.RotaRepositoryPort;
import com.coletare.backend.modules.rota.domain.Rota;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RotaService implements RotaUseCase {

    private final RotaRepositoryPort repository;

    public RotaService(RotaRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public Rota create(Rota rota) {
        validate(rota);
        Instant now = Instant.now();
        Rota toSave = new Rota(
                isBlank(rota.id()) ? UUID.randomUUID().toString() : rota.id(),
                rota.name(),
                rota.cityId(),
                rota.period(),
                rota.days(),
                rota.residueType(),
                rota.waypoints(),
                rota.polyline(),
                rota.wasChecked(),
                rota.withdrawalRequestsIds() == null ? List.of() : rota.withdrawalRequestsIds(),
                rota.isSpecial(),
                rota.assignedVehicleId(),
                rota.assignedCollaborators() == null ? List.of() : rota.assignedCollaborators(),
                isBlank(rota.status()) ? "scheduled" : rota.status(),
                now,
                now
        );
        return repository.save(toSave);
    }

    @Override
    public Rota update(String id, Rota rota) {
        validate(rota);
        Rota current = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rota not found"));

        Rota toSave = new Rota(
                id,
                rota.name(),
                rota.cityId(),
                rota.period(),
                rota.days(),
                rota.residueType(),
                rota.waypoints(),
                rota.polyline(),
                rota.wasChecked(),
                rota.withdrawalRequestsIds() == null ? List.of() : rota.withdrawalRequestsIds(),
                rota.isSpecial(),
                rota.assignedVehicleId(),
                rota.assignedCollaborators() == null ? List.of() : rota.assignedCollaborators(),
                isBlank(rota.status()) ? current.status() : rota.status(),
                current.createdAt(),
                Instant.now()
        );

        return repository.save(toSave);
    }

    @Override
    public Optional<Rota> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public List<Rota> listAll() {
        return repository.findAll();
    }

    @Override
    public List<Rota> listByCityId(String cityId) {
        if (isBlank(cityId)) {
            return listAll();
        }
        return repository.findByCityId(cityId);
    }

    @Override
    public List<Rota> listByAssignedVehicleId(String vehicleId) {
        if (isBlank(vehicleId)) {
            return List.of();
        }
        return repository.findByAssignedVehicleId(vehicleId);
    }

    @Override
    public List<Rota> listByStatus(String status) {
        if (isBlank(status)) {
            return List.of();
        }
        return repository.findByStatus(status);
    }

    @Override
    public void delete(String id) {
        if (repository.findById(id).isEmpty()) {
            throw new IllegalArgumentException("Rota not found");
        }
        repository.deleteById(id);
    }

    private void validate(Rota rota) {
        if (rota == null) {
            throw new IllegalArgumentException("Rota is required");
        }
        if (isBlank(rota.name())) {
            throw new IllegalArgumentException("Route name is required");
        }
        if (isBlank(rota.cityId())) {
            throw new IllegalArgumentException("cityId is required");
        }
        if (isBlank(rota.period())) {
            throw new IllegalArgumentException("period is required");
        }
        if (rota.days() == null || rota.days().isEmpty()) {
            throw new IllegalArgumentException("days are required");
        }
        if (isBlank(rota.residueType())) {
            throw new IllegalArgumentException("residueType is required");
        }
        if (rota.waypoints() == null || rota.waypoints().size() < 2) {
            throw new IllegalArgumentException("At least two waypoints are required");
        }
        if (isBlank(rota.polyline())) {
            throw new IllegalArgumentException("polyline is required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
