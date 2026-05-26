package com.coletare.backend.modules.user.application.port.out;

import com.coletare.backend.modules.user.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryPort {
    User save(User user);
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    void deleteById(String id);
}
