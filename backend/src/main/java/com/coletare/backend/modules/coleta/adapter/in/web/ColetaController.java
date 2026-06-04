package com.coletare.backend.modules.coleta.adapter.in.web;

import com.coletare.backend.modules.coleta.application.dto.DashboardData;
import com.coletare.backend.modules.coleta.application.port.in.ColetaUseCase;
import com.coletare.backend.modules.coleta.domain.Coleta;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bff/coletas")
public class ColetaController {

    private final ColetaUseCase useCase;

    public ColetaController(ColetaUseCase useCase) {
        this.useCase = useCase;
    }

    @GetMapping
    public ResponseEntity<List<Coleta>> list(
            @RequestParam(required = false) String cityId,
            @RequestParam(required = false) String routeId) {
        if (cityId != null) return ResponseEntity.ok(useCase.listByCityId(cityId));
        if (routeId != null) return ResponseEntity.ok(useCase.listByRouteId(routeId));
        return ResponseEntity.ok(useCase.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coleta> findById(@PathVariable String id) {
        return useCase.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardData> dashboard(
            @RequestParam String cityId,
            @RequestParam(required = false) String routeId) {
        return ResponseEntity.ok(useCase.getDashboardData(cityId, routeId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Coleta coleta) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(useCase.create(coleta));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Coleta coleta) {
        try {
            return ResponseEntity.ok(useCase.update(id, coleta));
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
