package com.coletare.backend.modules.solicitacao.application.port.out;

import com.coletare.backend.modules.solicitacao.domain.SolicitacaoRetirada;

import java.util.List;
import java.util.Optional;

public interface SolicitacaoRetiradaRepositoryPort {
    SolicitacaoRetirada save(SolicitacaoRetirada solicitacao);
    Optional<SolicitacaoRetirada> findById(String id);
    List<SolicitacaoRetirada> findAll();
    List<SolicitacaoRetirada> findByCityId(String cityId);
    void deleteById(String id);
}
