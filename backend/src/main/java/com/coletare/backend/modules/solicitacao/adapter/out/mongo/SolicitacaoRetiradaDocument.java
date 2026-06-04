package com.coletare.backend.modules.solicitacao.adapter.out.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("withdrawal_requests")
@CompoundIndexes({
        @CompoundIndex(name = "idx_withdrawals_city_created", def = "{'cityId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "idx_withdrawals_city_resolved", def = "{'cityId': 1, 'isResolved': 1}")
})
public class SolicitacaoRetiradaDocument {
    @Id
    private String id;
    private String cityId;
    private String createdById;
    private String fullAddress;
    private Double latitude;
    private Double longitude;
    private String residueType;
    private String type;
    private boolean isResolved;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCityId() { return cityId; }
    public void setCityId(String cityId) { this.cityId = cityId; }
    public String getCreatedById() { return createdById; }
    public void setCreatedById(String createdById) { this.createdById = createdById; }
    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getResidueType() { return residueType; }
    public void setResidueType(String residueType) { this.residueType = residueType; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isResolved() { return isResolved; }
    public void setResolved(boolean isResolved) { this.isResolved = isResolved; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
