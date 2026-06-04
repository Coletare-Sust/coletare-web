package com.coletare.backend.modules.solicitacao.application.port.in;

import com.coletare.backend.modules.solicitacao.domain.SolicitacaoRetirada;

import java.util.List;
import java.util.Optional;

public interface SolicitacaoRetiradaUseCase {
    SolicitacaoRetirada create(SolicitacaoRetirada solicitacao);
    SolicitacaoRetirada update(String id, SolicitacaoRetirada solicitacao);
    SolicitacaoRetirada resolve(String id);
    Optional<SolicitacaoRetirada> findById(String id);
    List<SolicitacaoRetirada> listByCityId(String cityId);
    List<SolicitacaoRetirada> listAll();
    void delete(String id);
}
