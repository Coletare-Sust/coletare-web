package com.coletare.backend.modules.user.application.port.in;

import com.coletare.backend.modules.user.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserUseCase {
    User upsert(User user);
    Optional<User> findById(String id);
    List<User> list();
    void delete(String id);
}
