package com.coletare.backend.modules.auth.adapter.in.web;

import com.coletare.backend.modules.auth.adapter.in.web.dto.AuthMeResponse;
import com.coletare.backend.modules.auth.adapter.in.web.dto.LoginRequest;
import com.coletare.backend.modules.auth.application.port.in.AuthUseCase;
import com.coletare.backend.shared.config.SecurityProperties;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bff/auth")
public class AuthController {

    private final AuthUseCase authUseCase;
    private final SecurityProperties securityProperties;

    public AuthController(AuthUseCase authUseCase, SecurityProperties securityProperties) {
        this.authUseCase = authUseCase;
        this.securityProperties = securityProperties;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody @Valid LoginRequest request) {
        var session = authUseCase.login(request.email(), request.password());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildCookie(session.sessionId()).toString())
                .body(Map.of(
                        "error", (Object) null,
                        "user", Map.of(
                                "uid", session.userId(),
                                "email", session.email(),
                                "emailVerified", true,
                                "roles", session.tokens().roles()
                        )
                ));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthMeResponse> me(@CookieValue(name = "COLETARE_SESSION", required = false) String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return ResponseEntity.ok(new AuthMeResponse("", "", List.of(), false));
        }

        return authUseCase.me(sessionId)
                .map(session -> ResponseEntity.ok(new AuthMeResponse(
                        session.userId(),
                        session.email(),
                        session.tokens().roles(),
                        true
                )))
                .orElseGet(() -> ResponseEntity.ok(new AuthMeResponse("", "", List.of(), false)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@CookieValue(name = "COLETARE_SESSION", required = false) String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "Sessão ausente"));
        }

        return authUseCase.refresh(sessionId)
                .map(session -> ResponseEntity.ok(Map.of(
                        "error", (Object) null,
                        "user", Map.of(
                                "uid", session.userId(),
                                "email", session.email(),
                                "emailVerified", true,
                                "roles", session.tokens().roles()
                        )
                )))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Sessão inválida")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@CookieValue(name = "COLETARE_SESSION", required = false) String sessionId) {
        if (sessionId != null && !sessionId.isBlank()) {
            authUseCase.logout(sessionId);
        }

        ResponseCookie clearCookie = ResponseCookie.from(securityProperties.sessionCookieName(), "")
                .httpOnly(true)
                .secure(securityProperties.sessionCookieSecure())
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(Map.of("error", (Object) null));
    }

    private ResponseCookie buildCookie(String sessionId) {
        return ResponseCookie.from(securityProperties.sessionCookieName(), sessionId)
                .httpOnly(true)
                .secure(securityProperties.sessionCookieSecure())
                .path("/")
                .sameSite("Strict")
                .maxAge(securityProperties.sessionCookieMaxAgeSeconds())
                .build();
    }
}
