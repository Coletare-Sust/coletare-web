package com.coletare.backend.modules.notificacao.adapter.out.mongo;

import com.coletare.backend.modules.notificacao.application.port.out.NotificacaoRepositoryPort;
import com.coletare.backend.modules.notificacao.domain.Notificacao;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class MongoNotificacaoRepositoryAdapter implements NotificacaoRepositoryPort {

    private final SpringDataNotificacaoRepository repository;

    public MongoNotificacaoRepositoryAdapter(SpringDataNotificacaoRepository repository) {
        this.repository = repository;
    }

    @Override
    public Notificacao save(Notificacao notificacao) {
        return toDomain(repository.save(toDocument(notificacao)));
    }

    @Override
    public Optional<Notificacao> findById(String id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Notificacao> findByCityId(String cityId) {
        return repository.findByCityIdOrderByCreatedAtDesc(cityId).stream().map(this::toDomain).toList();
    }

    private NotificacaoDocument toDocument(Notificacao n) {
        NotificacaoDocument d = new NotificacaoDocument();
        d.setId(n.id());
        d.setCityId(n.cityId());
        d.setRouteId(n.routeId());
        d.setTitle(n.title());
        d.setContent(n.content());
        d.setRecipientCount(n.recipientCount());
        d.setStatus(n.status());
        d.setCreatedAt(n.createdAt());
        return d;
    }

    private Notificacao toDomain(NotificacaoDocument d) {
        return new Notificacao(
                d.getId(), d.getCityId(), d.getRouteId(),
                d.getTitle(), d.getContent(),
                d.getRecipientCount(), d.getStatus(), d.getCreatedAt()
        );
    }
}
