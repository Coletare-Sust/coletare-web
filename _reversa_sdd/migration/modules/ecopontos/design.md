# Ecopontos — Design

Aggregate `Ecoponto`:
- id, name, address, coordinates {lat,lon}, residueTypes[], contact, municipalityId, photos[]

Indexes
- 2dsphere index on coordinates for geospatial queries.

Adapters
- `EcopontoRepository` (Mongo), `StorageAdapter` for photos.
