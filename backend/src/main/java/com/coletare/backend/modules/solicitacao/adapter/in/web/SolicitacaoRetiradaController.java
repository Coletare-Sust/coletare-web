package com.coletare.backend.modules.solicitacao.adapter.in.web;

import com.coletare.backend.modules.solicitacao.application.port.in.SolicitacaoRetiradaUseCase;
import com.coletare.backend.modules.solicitacao.domain.SolicitacaoRetirada;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bff/solicitacoes-retirada")
public class SolicitacaoRetiradaController {

    private final SolicitacaoRetiradaUseCase useCase;

    public SolicitacaoRetiradaController(SolicitacaoRetiradaUseCase useCase) {
        this.useCase = useCase;
    }

    @GetMapping
    public ResponseEntity<List<SolicitacaoRetirada>> list(
            @RequestParam(required = false) String cityId) {
        List<SolicitacaoRetirada> result = cityId != null
                ? useCase.listByCityId(cityId)
                : useCase.listAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitacaoRetirada> findById(@PathVariable String id) {
        return useCase.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SolicitacaoRetirada solicitacao) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(useCase.create(solicitacao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody SolicitacaoRetirada solicitacao) {
        try {
            return ResponseEntity.ok(useCase.update(id, solicitacao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // State machine: ABERTA → RESOLVIDA
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> resolve(@PathVariable String id) {
        try {
            return ResponseEntity.ok(useCase.resolve(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            useCase.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
