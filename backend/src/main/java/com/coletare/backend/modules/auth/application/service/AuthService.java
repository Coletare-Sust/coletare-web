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
