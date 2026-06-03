package com.coletare.backend.modules.user.adapter.out.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SpringDataUserRepository extends MongoRepository<UserDocument, String> {
    Optional<UserDocument> findByEmail(String email);
    List<UserDocument> findByRole(String role);
    List<UserDocument> findByCityId(String cityId);
    List<UserDocument> findByCityIdAndRole(String cityId, String role);
}
