package com.coletare.backend.modules.aviso.application.service;

import com.coletare.backend.modules.aviso.application.port.in.AvisoUseCase;
import com.coletare.backend.modules.aviso.application.port.out.AvisoRepositoryPort;
import com.coletare.backend.modules.aviso.domain.Aviso;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AvisoService implements AvisoUseCase {

    private final AvisoRepositoryPort repository;

    public AvisoService(AvisoRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public Aviso create(Aviso aviso) {
        validate(aviso);
        Instant now = Instant.now();
        return repository.save(new Aviso(
                isBlank(aviso.id()) ? UUID.randomUUID().toString() : aviso.id(),
                aviso.cityId(),
                aviso.title(),
                aviso.description(),
                aviso.imageUrl(),
                now,
                now
        ));
    }

    @Override
    public Aviso update(String id, Aviso aviso) {
        validate(aviso);
        Aviso existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aviso não encontrado: " + id));
        return repository.save(new Aviso(
                existing.id(),
                aviso.cityId() != null ? aviso.cityId() : existing.cityId(),
                aviso.title(),
                aviso.description(),
                aviso.imageUrl(),
                existing.createdAt(),
                Instant.now()
        ));
    }

    @Override
    public Optional<Aviso> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public List<Aviso> listByCityId(String cityId) {
        if (isBlank(cityId)) return listAll();
        return repository.findByCityId(cityId);
    }

    @Override
    public List<Aviso> listAll() {
        return repository.findAll();
    }

    @Override
    public void delete(String id) {
        repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aviso não encontrado: " + id));
        repository.deleteById(id);
    }

    private void validate(Aviso aviso) {
        if (isBlank(aviso.title())) throw new IllegalArgumentException("Título é obrigatório");
        if (isBlank(aviso.description())) throw new IllegalArgumentException("Descrição é obrigatória");
        if (isBlank(aviso.cityId())) throw new IllegalArgumentException("cityId é obrigatório");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
