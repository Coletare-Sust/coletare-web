package com.coletare.backend.modules.ecoponto.adapter.in.rest;

import com.coletare.backend.modules.ecoponto.application.port.in.EcopontoUseCase;
import com.coletare.backend.modules.ecoponto.domain.Ecoponto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ecopontos")
public class EcopontoController {

    private final EcopontoUseCase ecopontoUseCase;

    public EcopontoController(EcopontoUseCase ecopontoUseCase) {
        this.ecopontoUseCase = ecopontoUseCase;
    }

    @PostMapping
    public ResponseEntity<Ecoponto> create(@RequestBody Ecoponto ecoponto) {
        Ecoponto created = ecopontoUseCase.create(ecoponto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ecoponto> findById(@PathVariable String id) {
        return ecopontoUseCase.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Ecoponto>> listAll() {
        List<Ecoponto> ecopontos = ecopontoUseCase.listAll();
        return ResponseEntity.ok(ecopontos);
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<Ecoponto>> listByCity(@PathVariable String cityId) {
        List<Ecoponto> ecopontos = ecopontoUseCase.listByCity(cityId);
        return ResponseEntity.ok(ecopontos);
    }

    @GetMapping("/residue/{residueType}")
    public ResponseEntity<List<Ecoponto>> listByResidueType(@PathVariable String residueType) {
        List<Ecoponto> ecopontos = ecopontoUseCase.listByResidueType(residueType);
        return ResponseEntity.ok(ecopontos);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Ecoponto>> listNearby(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Double radiusKm) {
        List<Ecoponto> ecopontos = ecopontoUseCase.listNearby(latitude, longitude, radiusKm);
        return ResponseEntity.ok(ecopontos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ecoponto> update(@PathVariable String id, @RequestBody Ecoponto ecoponto) {
        try {
            Ecoponto updated = ecopontoUseCase.update(id, ecoponto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            ecopontoUseCase.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
