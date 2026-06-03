package com.coletare.backend.modules.aviso.adapter.out.mongo;

import com.coletare.backend.modules.aviso.application.port.out.AvisoRepositoryPort;
import com.coletare.backend.modules.aviso.domain.Aviso;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class MongoAvisoRepositoryAdapter implements AvisoRepositoryPort {

    private final SpringDataAvisoRepository repository;

    public MongoAvisoRepositoryAdapter(SpringDataAvisoRepository repository) {
        this.repository = repository;
    }

    @Override
    public Aviso save(Aviso aviso) {
        return toDomain(repository.save(toDocument(aviso)));
    }

    @Override
    public Optional<Aviso> findById(String id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Aviso> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<Aviso> findByCityId(String cityId) {
        return repository.findByCityIdOrderByCreatedAtDesc(cityId).stream().map(this::toDomain).toList();
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    private AvisoDocument toDocument(Aviso aviso) {
        AvisoDocument d = new AvisoDocument();
        d.setId(aviso.id());
        d.setCityId(aviso.cityId());
        d.setTitle(aviso.title());
        d.setDescription(aviso.description());
        d.setImageUrl(aviso.imageUrl());
        d.setCreatedAt(aviso.createdAt());
        d.setUpdatedAt(aviso.updatedAt());
        return d;
    }

    private Aviso toDomain(AvisoDocument d) {
        return new Aviso(
                d.getId(),
                d.getCityId(),
                d.getTitle(),
                d.getDescription(),
                d.getImageUrl(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
