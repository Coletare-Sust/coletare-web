package com.coletare.backend.modules.coleta.adapter.out.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document("collects")
@CompoundIndexes({
        @CompoundIndex(name = "idx_collects_city_created", def = "{'cityId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "idx_collects_route_created", def = "{'routeId': 1, 'createdAt': -1}")
})
public class ColetaDocument {
    @Id
    private String id;
    private String cityId;
    private String routeId;
    private String vehicleName;
    private String carPlate;
    private String employeeId;
    private Double mass;
    private Double consume;
    private Double emission;
    private ColetaCostDocument cost;
    private Double kmRun;
    private List<String> withdrawalRequestsIds;
    private Integer duration;
    private Double vehicleLatitude;
    private Double vehicleLongitude;
    private boolean hasEnded;
    private Instant createdAt;
    private Instant updatedAt;

    public static class ColetaCostDocument {
        private Double landfillDelivery;
        private Double fuel;
        public Double getLandfillDelivery() { return landfillDelivery; }
        public void setLandfillDelivery(Double v) { this.landfillDelivery = v; }
        public Double getFuel() { return fuel; }
        public void setFuel(Double v) { this.fuel = v; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCityId() { return cityId; }
    public void setCityId(String cityId) { this.cityId = cityId; }
    public String getRouteId() { return routeId; }
    public void setRouteId(String routeId) { this.routeId = routeId; }
    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }
    public String getCarPlate() { return carPlate; }
    public void setCarPlate(String carPlate) { this.carPlate = carPlate; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public Double getMass() { return mass; }
    public void setMass(Double mass) { this.mass = mass; }
    public Double getConsume() { return consume; }
    public void setConsume(Double consume) { this.consume = consume; }
    public Double getEmission() { return emission; }
    public void setEmission(Double emission) { this.emission = emission; }
    public ColetaCostDocument getCost() { return cost; }
    public void setCost(ColetaCostDocument cost) { this.cost = cost; }
    public Double getKmRun() { return kmRun; }
    public void setKmRun(Double kmRun) { this.kmRun = kmRun; }
    public List<String> getWithdrawalRequestsIds() { return withdrawalRequestsIds; }
    public void setWithdrawalRequestsIds(List<String> v) { this.withdrawalRequestsIds = v; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Double getVehicleLatitude() { return vehicleLatitude; }
    public void setVehicleLatitude(Double vehicleLatitude) { this.vehicleLatitude = vehicleLatitude; }
    public Double getVehicleLongitude() { return vehicleLongitude; }
    public void setVehicleLongitude(Double vehicleLongitude) { this.vehicleLongitude = vehicleLongitude; }
    public boolean isHasEnded() { return hasEnded; }
    public void setHasEnded(boolean hasEnded) { this.hasEnded = hasEnded; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
