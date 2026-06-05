package com.coletare.backend.modules.notificacao.application.service;

import com.coletare.backend.modules.notificacao.application.port.in.NotificacaoUseCase;
import com.coletare.backend.modules.notificacao.application.port.out.NotificacaoRepositoryPort;
import com.coletare.backend.modules.notificacao.domain.Notificacao;
import com.coletare.backend.modules.notificacao.domain.NotificacaoPayload;
import com.coletare.backend.modules.rota.application.port.in.RotaUseCase;
import com.coletare.backend.modules.rota.domain.Rota;
import com.coletare.backend.modules.solicitacao.application.port.in.SolicitacaoRetiradaUseCase;
import com.coletare.backend.modules.solicitacao.domain.SolicitacaoRetirada;
import com.coletare.backend.modules.user.application.port.in.UserUseCase;
import com.coletare.backend.modules.user.domain.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificacaoService implements NotificacaoUseCase {

    private static final double PROXIMITY_THRESHOLD_KM = 0.1;

    private final NotificacaoRepositoryPort repository;
    private final RotaUseCase rotaUseCase;
    private final UserUseCase userUseCase;
    private final SolicitacaoRetiradaUseCase solicitacaoUseCase;

    public NotificacaoService(
            NotificacaoRepositoryPort repository,
            RotaUseCase rotaUseCase,
            UserUseCase userUseCase,
            SolicitacaoRetiradaUseCase solicitacaoUseCase
    ) {
        this.repository = repository;
        this.rotaUseCase = rotaUseCase;
        this.userUseCase = userUseCase;
        this.solicitacaoUseCase = solicitacaoUseCase;
    }

    @Override
    public NotificacaoPayload prepare(String title, String content, String routeId, String cityId) {
        if (isBlank(title)) throw new IllegalArgumentException("title é obrigatório");
        if (isBlank(content)) throw new IllegalArgumentException("content é obrigatório");
        if (isBlank(routeId)) throw new IllegalArgumentException("routeId é obrigatório");
        if (isBlank(cityId)) throw new IllegalArgumentException("cityId é obrigatório");

        Rota route = rotaUseCase.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Rota não encontrada: " + routeId));

        List<User> citizens = userUseCase.listByCityIdAndRole(cityId, "CITIZEN");

        List<double[]> polylinePoints = decodePolyline(route.polyline() != null ? route.polyline() : "");

        Set<String> eligibleUserIds = new LinkedHashSet<>();

        for (User user : citizens) {
            double lat = extractDouble(user.metadata(), "latitude");
            double lng = extractDouble(user.metadata(), "longitude");
            if (lat == 0 && lng == 0) continue;
            if (isCloseToPolyline(lat, lng, polylinePoints)) {
                eligibleUserIds.add(user.id());
            }
        }

        if (route.isSpecial() && route.withdrawalRequestsIds() != null && !route.withdrawalRequestsIds().isEmpty()) {
            List<SolicitacaoRetirada> withdrawals = solicitacaoUseCase.listByCityId(cityId);
            Set<String> creatorsFromRoute = withdrawals.stream()
                    .filter(w -> route.withdrawalRequestsIds().contains(w.id()))
                    .map(SolicitacaoRetirada::createdById)
                    .collect(Collectors.toSet());
            eligibleUserIds.addAll(creatorsFromRoute);
        }

        Map<String, User> userMap = citizens.stream().collect(Collectors.toMap(User::id, u -> u));

        List<String> tokens = eligibleUserIds.stream()
                .map(userMap::get)
                .filter(Objects::nonNull)
                .flatMap(u -> extractTokens(u.metadata()).stream())
                .distinct()
                .collect(Collectors.toList());

        String id = UUID.randomUUID().toString();
        Notificacao record = new Notificacao(id, cityId, routeId, title, content, tokens.size(), "PREPARED", Instant.now());
        repository.save(record);

        return new NotificacaoPayload(id, tokens, title, content, tokens.size());
    }

    @Override
    public void markSent(String id) {
        repository.findById(id).ifPresent(n -> {
            Notificacao updated = new Notificacao(
                    n.id(), n.cityId(), n.routeId(), n.title(), n.content(),
                    n.recipientCount(), "SENT", n.createdAt()
            );
            repository.save(updated);
        });
    }

    @Override
    public List<Notificacao> listByCityId(String cityId) {
        return repository.findByCityId(cityId);
    }

    // --- Polyline decoding (Google Encoded Polyline Algorithm) ---

    private List<double[]> decodePolyline(String encoded) {
        List<double[]> path = new ArrayList<>();
        int index = 0;
        int len = encoded.length();
        int lat = 0;
        int lng = 0;
        while (index < len) {
            int b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lat += ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lng += ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            path.add(new double[]{lat / 1e5, lng / 1e5});
        }
        return path;
    }

    private boolean isCloseToPolyline(double userLat, double userLng, List<double[]> points) {
        for (double[] point : points) {
            if (distanceKm(userLat, userLng, point[0], point[1]) <= PROXIMITY_THRESHOLD_KM) {
                return true;
            }
        }
        return false;
    }

    // Haversine formula — returns distance in km (mirrors frontend getDistanceBetweenTwoPoints)
    private double distanceKm(double lat1, double lng1, double lat2, double lng2) {
        if (lat1 == lat2 && lng1 == lng2) return 0;
        double radlat1 = Math.PI * lat1 / 180;
        double radlat2 = Math.PI * lat2 / 180;
        double radtheta = Math.PI * (lng1 - lng2) / 180;
        double dist = Math.sin(radlat1) * Math.sin(radlat2)
                + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) dist = 1;
        dist = Math.acos(dist) * 180 / Math.PI * 60 * 1.1515 * 1.609344;
        return dist;
    }

    // --- Metadata helpers ---

    @SuppressWarnings("unchecked")
    private List<String> extractTokens(Map<String, Object> metadata) {
        if (metadata == null) return List.of();
        Object raw = metadata.get("tokens");
        if (raw instanceof List<?> list) {
            return list.stream()
                    .filter(t -> t instanceof String)
                    .map(t -> (String) t)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    private double extractDouble(Map<String, Object> metadata, String key) {
        if (metadata == null) return 0;
        Object value = metadata.get(key);
        if (value instanceof Number n) return n.doubleValue();
        if (value instanceof String s) {
            try { return Double.parseDouble(s); } catch (NumberFormatException ignored) {}
        }
        return 0;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
