package com.coletare.backend.modules.aviso.adapter.in.web;

import com.coletare.backend.modules.aviso.application.port.in.AvisoUseCase;
import com.coletare.backend.modules.aviso.domain.Aviso;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bff/avisos")
public class AvisoController {

    private final AvisoUseCase avisoUseCase;

    public AvisoController(AvisoUseCase avisoUseCase) {
        this.avisoUseCase = avisoUseCase;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Aviso aviso) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(avisoUseCase.create(aviso));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Aviso>> list(@RequestParam(required = false) String cityId) {
        List<Aviso> result = cityId != null ? avisoUseCase.listByCityId(cityId) : avisoUseCase.listAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aviso> findById(@PathVariable String id) {
        return avisoUseCase.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Aviso aviso) {
        try {
            return ResponseEntity.ok(avisoUseCase.update(id, aviso));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            avisoUseCase.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
