package com.coletare.backend.modules.user.adapter.out.mongo;

import com.coletare.backend.modules.user.application.port.out.UserRepositoryPort;
import com.coletare.backend.modules.user.domain.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class MongoUserRepositoryAdapter implements UserRepositoryPort {

    private final SpringDataUserRepository repository;

    public MongoUserRepositoryAdapter(SpringDataUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public User save(User user) {
        UserDocument document = toDocument(user);
        UserDocument saved = repository.save(document);
        return toDomain(saved);
    }

    @Override
    public Optional<User> findById(String id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public List<User> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public List<User> findByRole(String role) {
        return repository.findByRole(role).stream().map(this::toDomain).toList();
    }

    @Override
    public List<User> findByCityId(String cityId) {
        return repository.findByCityId(cityId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<User> findByCityIdAndRole(String cityId, String role) {
        return repository.findByCityIdAndRole(cityId, role).stream().map(this::toDomain).toList();
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    private UserDocument toDocument(User user) {
        UserDocument d = new UserDocument();
        d.setId(user.id());
        d.setExternalId(user.externalId());
        d.setEmail(user.email());
        d.setDisplayName(user.displayName());
        d.setName(user.displayName());
        d.setCityId(user.cityId());
        if (user.roles() != null && !user.roles().isEmpty()) {
            d.setRole(user.roles().get(0));
        }
        d.setRoles(user.roles());
        d.setMetadata(user.metadata());
        d.setCreatedAt(user.createdAt());
        d.setUpdatedAt(user.updatedAt());
        return d;
    }

    private User toDomain(UserDocument document) {
        return new User(
                document.getId(),
                document.getExternalId(),
                document.getEmail(),
                document.getDisplayName() != null ? document.getDisplayName() : document.getName(),
                document.getCityId(),
                document.getRoles() != null ? document.getRoles() : (document.getRole() != null ? java.util.List.of(document.getRole()) : java.util.List.of()),
                document.getMetadata(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}
