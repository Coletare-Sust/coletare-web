package com.coletare.backend.modules.ecoponto.adapter.out.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.List;

@Document(collection = "ecopoints")
public class EcopontoDocument {

    @Id
    private String id;

    @Field("cityId")
    private String cityId;

    @Field("createdAt")
    private Instant createdAt;

    @Field("description")
    private String description;

    @Field("isActive")
    private Boolean isActive;

    @Field("lat")
    private Double lat;

    @Field("lng")
    private Double lng;

    @Field("name")
    private String name;

    @Field("residueType")
    private List<String> residueType;

    @Field("updatedAt")
    private Instant updatedAt;

    public EcopontoDocument() {
    }

    public EcopontoDocument(String id, String cityId, Instant createdAt, String description, Boolean isActive,
                            Double lat, Double lng, String name, List<String> residueType, Instant updatedAt) {
        this.id = id;
        this.cityId = cityId;
        this.createdAt = createdAt;
        this.description = description;
        this.isActive = isActive;
        this.lat = lat;
        this.lng = lng;
        this.name = name;
        this.residueType = residueType;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCityId() { return cityId; }
    public void setCityId(String cityId) { this.cityId = cityId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getResidueType() { return residueType; }
    public void setResidueType(List<String> residueType) { this.residueType = residueType; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
