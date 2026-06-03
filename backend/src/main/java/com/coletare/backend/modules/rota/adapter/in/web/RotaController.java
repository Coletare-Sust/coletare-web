package com.coletare.backend.modules.rota.adapter.in.web;

import com.coletare.backend.modules.rota.application.port.in.RotaUseCase;
import com.coletare.backend.modules.rota.domain.Rota;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/rotas", "/bff/rotas"})
public class RotaController {

    private final RotaUseCase rotaUseCase;

    public RotaController(RotaUseCase rotaUseCase) {
        this.rotaUseCase = rotaUseCase;
    }

    @PostMapping
    public ResponseEntity<Rota> create(@RequestBody Rota rota) {
        Rota created = rotaUseCase.create(rota);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Rota>> listAll(@RequestParam(required = false) String cityId) {
        List<Rota> rotas = cityId == null ? rotaUseCase.listAll() : rotaUseCase.listByCityId(cityId);
        return ResponseEntity.ok(rotas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rota> findById(@PathVariable String id) {
        return rotaUseCase.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<Rota>> listByCity(@PathVariable String cityId) {
        return ResponseEntity.ok(rotaUseCase.listByCityId(cityId));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Rota>> listByVehicle(@PathVariable String vehicleId) {
        return ResponseEntity.ok(rotaUseCase.listByAssignedVehicleId(vehicleId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Rota>> listByStatus(@PathVariable String status) {
        return ResponseEntity.ok(rotaUseCase.listByStatus(status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rota> update(@PathVariable String id, @RequestBody Rota rota) {
        try {
            return ResponseEntity.ok(rotaUseCase.update(id, rota));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            rotaUseCase.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
