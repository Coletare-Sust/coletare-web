package com.coletare.backend.modules.user.application.port.out;

import com.coletare.backend.modules.user.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryPort {
    User save(User user);
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    List<User> findByRole(String role);
    List<User> findByCityId(String cityId);
    List<User> findByCityIdAndRole(String cityId, String role);
    void deleteById(String id);
}
