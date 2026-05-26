package com.coletare.backend.modules.user.application.service;

import com.coletare.backend.modules.user.application.port.in.UserUseCase;
import com.coletare.backend.modules.user.application.port.out.UserRepositoryPort;
import com.coletare.backend.modules.user.domain.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserUseCase {

    private final UserRepositoryPort userRepositoryPort;

    public UserService(UserRepositoryPort userRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
    }

    @Override
    public User upsert(User user) {
        Instant now = Instant.now();
        User persisted = new User(
                user.id(),
                user.externalId(),
                user.email(),
                user.displayName(),
                user.roles(),
                user.metadata(),
                user.createdAt() == null ? now : user.createdAt(),
                now
        );
        return userRepositoryPort.save(persisted);
    }

    @Override
    public Optional<User> findById(String id) {
        return userRepositoryPort.findById(id);
    }

    @Override
    public List<User> list() {
        return userRepositoryPort.findAll();
    }

    @Override
    public void delete(String id) {
        userRepositoryPort.deleteById(id);
    }
}
