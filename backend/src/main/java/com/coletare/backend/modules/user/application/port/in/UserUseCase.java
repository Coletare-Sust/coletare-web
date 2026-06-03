package com.coletare.backend.modules.user.application.port.in;

import com.coletare.backend.modules.user.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserUseCase {
    User upsert(User user);
    Optional<User> findById(String id);
    List<User> list();
    List<User> listByRole(String role);
    List<User> listByCityId(String cityId);
    List<User> listByCityIdAndRole(String cityId, String role);
    void delete(String id);
}
