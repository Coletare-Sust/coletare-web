package com.coletare.backend.modules.auth.application.port.out;

import com.coletare.backend.modules.auth.domain.AuthSession;

import java.util.Optional;

public interface SessionStorePort {
    AuthSession save(AuthSession session);
    Optional<AuthSession> findById(String sessionId);
    void delete(String sessionId);
}
