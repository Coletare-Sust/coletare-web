package com.coletare.backend.modules.auth.application.port.in;

import com.coletare.backend.modules.auth.domain.AuthSession;

import java.util.Optional;

public interface AuthUseCase {
    AuthSession login(String email, String password);
    Optional<AuthSession> me(String sessionId);
    Optional<AuthSession> refresh(String sessionId);
    void logout(String sessionId);
}
