package com.coletare.backend.modules.rota.adapter.out.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document("routes")
@CompoundIndexes({
        @CompoundIndex(name = "idx_rotas_city_created", def = "{'cityId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "idx_rotas_vehicle_created", def = "{'assignedVehicleId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "idx_rotas_status_created", def = "{'status': 1, 'createdAt': -1}")
})
public class RotaDocument {
    @Id
    private String id;
    private String name;
    private String cityId;
    private String period;
    private List<Boolean> days;
    private String residueType;
    private List<WaypointDocument> waypoints;
    private String polyline;
    private boolean wasChecked;
    private List<String> withdrawalRequestsIds;
    private boolean isSpecial;
    private String assignedVehicleId;
    private List<String> assignedCollaborators;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCityId() {
        return cityId;
    }

    public void setCityId(String cityId) {
        this.cityId = cityId;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public List<Boolean> getDays() {
        return days;
    }

    public void setDays(List<Boolean> days) {
        this.days = days;
    }

    public String getResidueType() {
        return residueType;
    }

    public void setResidueType(String residueType) {
        this.residueType = residueType;
    }

    public List<WaypointDocument> getWaypoints() {
        return waypoints;
    }

    public void setWaypoints(List<WaypointDocument> waypoints) {
        this.waypoints = waypoints;
    }

    public String getPolyline() {
        return polyline;
    }

    public void setPolyline(String polyline) {
        this.polyline = polyline;
    }

    public boolean isWasChecked() {
        return wasChecked;
    }

    public void setWasChecked(boolean wasChecked) {
        this.wasChecked = wasChecked;
    }

    public List<String> getWithdrawalRequestsIds() {
        return withdrawalRequestsIds;
    }

    public void setWithdrawalRequestsIds(List<String> withdrawalRequestsIds) {
        this.withdrawalRequestsIds = withdrawalRequestsIds;
    }

    public boolean isSpecial() {
        return isSpecial;
    }

    public void setIsSpecial(boolean isSpecial) {
        this.isSpecial = isSpecial;
    }

    public String getAssignedVehicleId() {
        return assignedVehicleId;
    }

    public void setAssignedVehicleId(String assignedVehicleId) {
        this.assignedVehicleId = assignedVehicleId;
    }

    public List<String> getAssignedCollaborators() {
        return assignedCollaborators;
    }

    public void setAssignedCollaborators(List<String> assignedCollaborators) {
        this.assignedCollaborators = assignedCollaborators;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class WaypointDocument {
        private double lat;
        private double lng;
        private boolean wasChecked;

        public double getLat() {
            return lat;
        }

        public void setLat(double lat) {
            this.lat = lat;
        }

        public double getLng() {
            return lng;
        }

        public void setLng(double lng) {
            this.lng = lng;
        }

        public boolean isWasChecked() {
            return wasChecked;
        }

        public void setWasChecked(boolean wasChecked) {
            this.wasChecked = wasChecked;
        }
    }
}
