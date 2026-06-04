package com.coletare.backend.modules.solicitacao.application.service;

import com.coletare.backend.modules.solicitacao.application.port.in.SolicitacaoRetiradaUseCase;
import com.coletare.backend.modules.solicitacao.application.port.out.SolicitacaoRetiradaRepositoryPort;
import com.coletare.backend.modules.solicitacao.domain.SolicitacaoRetirada;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SolicitacaoRetiradaService implements SolicitacaoRetiradaUseCase {

    private final SolicitacaoRetiradaRepositoryPort repository;

    public SolicitacaoRetiradaService(SolicitacaoRetiradaRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public SolicitacaoRetirada create(SolicitacaoRetirada s) {
        validate(s);
        Instant now = Instant.now();
        return repository.save(new SolicitacaoRetirada(
                isBlank(s.id()) ? UUID.randomUUID().toString() : s.id(),
                s.cityId(),
                s.createdById(),
                s.fullAddress(),
                s.latitude(),
                s.longitude(),
                s.residueType(),
                s.type(),
                false,
                s.imageUrl(),
                now,
                now
        ));
    }

    @Override
    public SolicitacaoRetirada update(String id, SolicitacaoRetirada s) {
        validate(s);
        SolicitacaoRetirada existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada: " + id));
        return repository.save(new SolicitacaoRetirada(
                existing.id(),
                s.cityId() != null ? s.cityId() : existing.cityId(),
                existing.createdById(),
                s.fullAddress() != null ? s.fullAddress() : existing.fullAddress(),
                s.latitude() != null ? s.latitude() : existing.latitude(),
                s.longitude() != null ? s.longitude() : existing.longitude(),
                s.residueType() != null ? s.residueType() : existing.residueType(),
                s.type() != null ? s.type() : existing.type(),
                s.isResolved(),
                s.imageUrl() != null ? s.imageUrl() : existing.imageUrl(),
                existing.createdAt(),
                Instant.now()
        ));
    }

    // State machine: ABERTA → RESOLVIDA
    @Override
    public SolicitacaoRetirada resolve(String id) {
        SolicitacaoRetirada existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada: " + id));
        return repository.save(new SolicitacaoRetirada(
                existing.id(), existing.cityId(), existing.createdById(),
                existing.fullAddress(), existing.latitude(), existing.longitude(),
                existing.residueType(), existing.type(),
                true,
                existing.imageUrl(), existing.createdAt(), Instant.now()
        ));
    }

    @Override
    public Optional<SolicitacaoRetirada> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public List<SolicitacaoRetirada> listByCityId(String cityId) {
        if (isBlank(cityId)) return listAll();
        return repository.findByCityId(cityId);
    }

    @Override
    public List<SolicitacaoRetirada> listAll() {
        return repository.findAll();
    }

    @Override
    public void delete(String id) {
        repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada: " + id));
        repository.deleteById(id);
    }

    private void validate(SolicitacaoRetirada s) {
        if (isBlank(s.cityId())) throw new IllegalArgumentException("cityId é obrigatório");
        if (isBlank(s.fullAddress())) throw new IllegalArgumentException("endereço é obrigatório");
        if (s.latitude() == null) throw new IllegalArgumentException("latitude é obrigatória");
        if (s.longitude() == null) throw new IllegalArgumentException("longitude é obrigatória");
        if (isBlank(s.residueType())) throw new IllegalArgumentException("tipo de resíduo é obrigatório");
        if (isBlank(s.type())) throw new IllegalArgumentException("tipo de solicitação é obrigatório");
    }

    private boolean isBlank(String v) {
        return v == null || v.isBlank();
    }
}
