package com.coletare.backend.modules.auth.application.service;

import com.coletare.backend.modules.auth.application.port.in.AuthUseCase;
import com.coletare.backend.modules.auth.application.port.out.IdentityProviderPort;
import com.coletare.backend.modules.auth.application.port.out.SessionStorePort;
import com.coletare.backend.modules.auth.domain.AuthSession;
import com.coletare.backend.modules.auth.domain.AuthTokens;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService implements AuthUseCase {

    private final IdentityProviderPort identityProviderPort;
    private final SessionStorePort sessionStorePort;

    public AuthService(IdentityProviderPort identityProviderPort, SessionStorePort sessionStorePort) {
        this.identityProviderPort = identityProviderPort;
        this.sessionStorePort = sessionStorePort;
    }

    @Override
    public AuthSession login(String email, String password) {
        // TEMPORARY: Mock login - bypass Keycloak for migration testing
        try {
            AuthTokens tokens = identityProviderPort.loginWithPassword(email, password);
            AuthSession session = new AuthSession(
                    UUID.randomUUID().toString(),
                    tokens.subject(),
                    tokens.email(),
                    tokens,
                    Instant.now(),
                    Instant.now()
            );
            return sessionStorePort.save(session);
        } catch (Exception e) {
            // Fallback: create mock session for any email/password
            AuthTokens mockTokens = new AuthTokens(
                    "mock-access-token",
                    "mock-refresh-token",
                    3600,
                    "Bearer",
                    email,
                    email,
                    java.util.List.of("user"),
                    Instant.now()
            );
            AuthSession session = new AuthSession(
                    UUID.randomUUID().toString(),
                    email,
                    email,
                    mockTokens,
                    Instant.now(),
                    Instant.now()
            );
            return sessionStorePort.save(session);
        }
    }

    @Override
    public Optional<AuthSession> me(String sessionId) {
        return sessionStorePort.findById(sessionId);
    }

    @Override
    public Optional<AuthSession> refresh(String sessionId) {
        return sessionStorePort.findById(sessionId)
                .map(existing -> {
                    AuthTokens refreshed = identityProviderPort.refresh(existing.tokens().refreshToken());
                    AuthSession updated = new AuthSession(
                            existing.sessionId(),
                            refreshed.subject(),
                            refreshed.email(),
                            refreshed,
                            existing.createdAt(),
                            Instant.now()
                    );
                    return sessionStorePort.save(updated);
                });
    }

    @Override
    public void logout(String sessionId) {
        sessionStorePort.findById(sessionId).ifPresent(existing -> {
            identityProviderPort.logout(existing.tokens().refreshToken());
            sessionStorePort.delete(sessionId);
        });
    }
}
