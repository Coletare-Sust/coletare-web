package com.coletare.backend.modules.coleta.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

public record Coleta(
        String id,
        String cityId,
        String routeId,
        String vehicleName,
        String carPlate,
        String employeeId,
        Double mass,
        Double consume,
        Double emission,
        ColetaCost cost,
        Double kmRun,
        List<String> withdrawalRequestsIds,
        Integer duration,
        Double vehicleLatitude,
        Double vehicleLongitude,
        @JsonProperty("hasEnded") boolean hasEnded,
        Instant createdAt,
        Instant updatedAt
) {
    public record ColetaCost(Double landfillDelivery, Double fuel) {}
}
