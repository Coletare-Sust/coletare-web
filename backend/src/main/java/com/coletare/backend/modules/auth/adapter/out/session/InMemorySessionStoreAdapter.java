package com.coletare.backend.modules.auth.adapter.out.session;

import com.coletare.backend.modules.auth.application.port.out.SessionStorePort;
import com.coletare.backend.modules.auth.domain.AuthSession;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemorySessionStoreAdapter implements SessionStorePort {

    private final Map<String, AuthSession> sessions = new ConcurrentHashMap<>();

    @Override
    public AuthSession save(AuthSession session) {
        sessions.put(session.sessionId(), session);
        return session;
    }

    @Override
    public Optional<AuthSession> findById(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }

    @Override
    public void delete(String sessionId) {
        sessions.remove(sessionId);
    }
}
