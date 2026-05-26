package com.coletare.backend.modules.user.adapter.out.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SpringDataUserRepository extends MongoRepository<UserDocument, String> {
    Optional<UserDocument> findByEmail(String email);
}
