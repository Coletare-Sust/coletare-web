package com.coletare.backend.modules.solicitacao.adapter.out.mongo;

import com.coletare.backend.modules.solicitacao.application.port.out.SolicitacaoRetiradaRepositoryPort;
import com.coletare.backend.modules.solicitacao.domain.SolicitacaoRetirada;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class MongoSolicitacaoRepositoryAdapter implements SolicitacaoRetiradaRepositoryPort {

    private final SpringDataSolicitacaoRepository repository;

    public MongoSolicitacaoRepositoryAdapter(SpringDataSolicitacaoRepository repository) {
        this.repository = repository;
    }

    @Override
    public SolicitacaoRetirada save(SolicitacaoRetirada s) {
        return toDomain(repository.save(toDocument(s)));
    }

    @Override
    public Optional<SolicitacaoRetirada> findById(String id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<SolicitacaoRetirada> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<SolicitacaoRetirada> findByCityId(String cityId) {
        return repository.findByCityIdOrderByCreatedAtDesc(cityId).stream().map(this::toDomain).toList();
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    private SolicitacaoRetiradaDocument toDocument(SolicitacaoRetirada s) {
        SolicitacaoRetiradaDocument d = new SolicitacaoRetiradaDocument();
        d.setId(s.id());
        d.setCityId(s.cityId());
        d.setCreatedById(s.createdById());
        d.setFullAddress(s.fullAddress());
        d.setLatitude(s.latitude());
        d.setLongitude(s.longitude());
        d.setResidueType(s.residueType());
        d.setType(s.type());
        d.setResolved(s.isResolved());
        d.setImageUrl(s.imageUrl());
        d.setCreatedAt(s.createdAt());
        d.setUpdatedAt(s.updatedAt());
        return d;
    }

    private SolicitacaoRetirada toDomain(SolicitacaoRetiradaDocument d) {
        return new SolicitacaoRetirada(
                d.getId(), d.getCityId(), d.getCreatedById(),
                d.getFullAddress(), d.getLatitude(), d.getLongitude(),
                d.getResidueType(), d.getType(), d.isResolved(),
                d.getImageUrl(), d.getCreatedAt(), d.getUpdatedAt()
        );
    }
}
