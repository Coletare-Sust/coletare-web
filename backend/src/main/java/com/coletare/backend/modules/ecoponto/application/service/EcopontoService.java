package com.coletare.backend.modules.ecoponto.application.service;

import com.coletare.backend.modules.ecoponto.application.port.in.EcopontoUseCase;
import com.coletare.backend.modules.ecoponto.application.port.out.EcopontoRepositoryPort;
import com.coletare.backend.modules.ecoponto.domain.Ecoponto;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EcopontoService implements EcopontoUseCase {

    private final EcopontoRepositoryPort repository;

    public EcopontoService(EcopontoRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public Ecoponto create(Ecoponto ecoponto) {
        validateEcoponto(ecoponto);
        
        Ecoponto newEcoponto = new Ecoponto(
                ecoponto.id() != null && !ecoponto.id().isBlank() ? ecoponto.id() : UUID.randomUUID().toString(),
            ecoponto.cityId(),
                Instant.now(),
            ecoponto.description(),
            ecoponto.isActive() == null ? Boolean.TRUE : ecoponto.isActive(),
            ecoponto.lat(),
            ecoponto.lng(),
            ecoponto.name(),
            ecoponto.residueType(),
            Instant.now()
        );
        
        return repository.save(newEcoponto);
    }

    @Override
    public Ecoponto update(String id, Ecoponto ecoponto) {
        validateEcoponto(ecoponto);
        
        Ecoponto existing = findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ecoponto not found: " + id));
        
        Ecoponto updated = new Ecoponto(
                existing.id(),
            ecoponto.cityId(),
                existing.createdAt(),
            ecoponto.description(),
            ecoponto.isActive() != null ? ecoponto.isActive() : existing.isActive(),
            ecoponto.lat(),
            ecoponto.lng(),
            ecoponto.name(),
            ecoponto.residueType(),
            Instant.now()
        );
        
        return repository.save(updated);
    }

    @Override
    public Optional<Ecoponto> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public List<Ecoponto> listByCity(String cityId) {
        return repository.findByCityId(cityId);
    }

    @Override
    public List<Ecoponto> listByResidueType(String residueType) {
        return repository.findByResidueType(residueType);
    }

    @Override
    public List<Ecoponto> listNearby(Double latitude, Double longitude, Double radiusKm) {
        if (latitude == null || longitude == null || radiusKm == null) {
            throw new IllegalArgumentException("Latitude, longitude, and radius are required for geospatial queries");
        }
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        if (radiusKm <= 0) {
            throw new IllegalArgumentException("Radius must be greater than 0");
        }
        
        return repository.findNearby(latitude, longitude, radiusKm);
    }

    @Override
    public List<Ecoponto> listAll() {
        return repository.findAll();
    }

    @Override
    public void delete(String id) {
        if (!repository.findById(id).isPresent()) {
            throw new IllegalArgumentException("Ecoponto not found: " + id);
        }
        repository.deleteById(id);
    }

    private void validateEcoponto(Ecoponto ecoponto) {
        if (ecoponto.name() == null || ecoponto.name().isBlank()) {
            throw new IllegalArgumentException("Ecoponto name is required");
        }
        if (ecoponto.cityId() == null || ecoponto.cityId().isBlank()) {
            throw new IllegalArgumentException("City ID is required");
        }
        if (ecoponto.lat() == null || ecoponto.lng() == null) {
            throw new IllegalArgumentException("Latitude and longitude are required");
        }
        if (ecoponto.lat() < -90 || ecoponto.lat() > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (ecoponto.lng() < -180 || ecoponto.lng() > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        if (ecoponto.residueType() == null || ecoponto.residueType().isEmpty()) {
            throw new IllegalArgumentException("At least one residue type is required");
        }
    }
}
