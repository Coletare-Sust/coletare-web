package com.coletare.backend.modules.rota.domain;

import java.time.Instant;
import java.util.List;

public record Rota(
        String id,
        String name,
        String cityId,
        String period,
        List<Boolean> days,
        String residueType,
        List<Waypoint> waypoints,
        String polyline,
        boolean wasChecked,
        List<String> withdrawalRequestsIds,
        boolean isSpecial,
        String assignedVehicleId,
        List<String> assignedCollaborators,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
    public record Waypoint(double lat, double lng, boolean wasChecked) {
    }
}
