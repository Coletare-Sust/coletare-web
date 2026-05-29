package com.coletare.backend.modules.ecoponto.adapter.out.mongo;

import com.coletare.backend.modules.ecoponto.application.port.out.EcopontoRepositoryPort;
import com.coletare.backend.modules.ecoponto.domain.Ecoponto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class MongoEcopontoRepositoryAdapter implements EcopontoRepositoryPort {

    private final SpringDataEcopontoRepository repository;

    public MongoEcopontoRepositoryAdapter(SpringDataEcopontoRepository repository) {
        this.repository = repository;
    }

    @Override
    public Ecoponto save(Ecoponto ecoponto) {
        EcopontoDocument document = toDocument(ecoponto);
        EcopontoDocument saved = repository.save(document);
        return toDomain(saved);
    }

    @Override
    public Optional<Ecoponto> findById(String id) {
        return repository.findById(id)
                .map(this::toDomain);
    }

    @Override
    public List<Ecoponto> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ecoponto> findByCityId(String cityId) {
        return repository.findByCityId(cityId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ecoponto> findByResidueType(String residueType) {
        return repository.findByResidueTypeContaining(residueType)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ecoponto> findNearby(Double latitude, Double longitude, Double radiusKm) {
        return repository.findAll()
                .stream()
                .map(this::toDomain)
                .filter(ecoponto -> distanceKm(latitude, longitude, ecoponto.lat(), ecoponto.lng()) <= radiusKm)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    @Override
    public long count() {
        return repository.count();
    }

    private EcopontoDocument toDocument(Ecoponto ecoponto) {
        return new EcopontoDocument(
                ecoponto.id(),
                ecoponto.cityId(),
                ecoponto.createdAt(),
                ecoponto.description(),
                ecoponto.isActive(),
                ecoponto.lat(),
                ecoponto.lng(),
                ecoponto.name(),
                ecoponto.residueType(),
                ecoponto.updatedAt()
        );
    }

    private Ecoponto toDomain(EcopontoDocument document) {
        return new Ecoponto(
                document.getId(),
                document.getCityId(),
                document.getCreatedAt(),
                document.getDescription(),
                document.getIsActive(),
                document.getLat(),
                document.getLng(),
                document.getName(),
                document.getResidueType(),
                document.getUpdatedAt()
        );
    }

    private double distanceKm(Double lat1, Double lon1, Double lat2, Double lon2) {
        final double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }
}
