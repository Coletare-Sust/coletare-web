package com.coletare.backend.modules.notificacao.adapter.in.web;

import com.coletare.backend.modules.notificacao.adapter.in.web.dto.PrepareNotificacaoRequest;
import com.coletare.backend.modules.notificacao.application.port.in.NotificacaoUseCase;
import com.coletare.backend.modules.notificacao.domain.Notificacao;
import com.coletare.backend.modules.notificacao.domain.NotificacaoPayload;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bff/notifications")
public class NotificacaoController {

    private final NotificacaoUseCase useCase;

    public NotificacaoController(NotificacaoUseCase useCase) {
        this.useCase = useCase;
    }

    @PostMapping("/prepare")
    public ResponseEntity<?> prepare(@RequestBody @Valid PrepareNotificacaoRequest request) {
        try {
            NotificacaoPayload payload = useCase.prepare(
                    request.title(), request.content(), request.routeId(), request.cityId()
            );
            return ResponseEntity.ok(payload);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/sent")
    public ResponseEntity<Void> markSent(@PathVariable String id) {
        useCase.markSent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Notificacao>> list(@RequestParam String cityId) {
        return ResponseEntity.ok(useCase.listByCityId(cityId));
    }
}
