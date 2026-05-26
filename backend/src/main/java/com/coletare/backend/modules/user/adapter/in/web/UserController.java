package com.coletare.backend.modules.user.adapter.in.web;

import com.coletare.backend.modules.user.adapter.in.web.dto.UpsertUserRequest;
import com.coletare.backend.modules.user.application.port.in.UserUseCase;
import com.coletare.backend.modules.user.domain.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bff/users")
public class UserController {

    private final UserUseCase userUseCase;

    public UserController(UserUseCase userUseCase) {
        this.userUseCase = userUseCase;
    }

    @GetMapping
    public ResponseEntity<List<User>> list() {
        return ResponseEntity.ok(userUseCase.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable String id) {
        return userUseCase.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> upsert(@RequestBody @Valid UpsertUserRequest request) {
        User user = new User(
                request.id(),
                request.externalId(),
                request.email(),
                request.displayName(),
                request.roles() == null ? List.of() : request.roles(),
                request.metadata() == null ? Map.of() : request.metadata(),
                Instant.now(),
                Instant.now()
        );

        User saved = userUseCase.upsert(user);
        return ResponseEntity.ok(Map.of("error", (Object) null, "user", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String id) {
        userUseCase.delete(id);
        return ResponseEntity.ok(Map.of("error", (Object) null));
    }
}
