# Municípios — Design

Model
- Collection `municipios`: id, name, ibgeCode, state, metadata

Adapters
- `MunicipioRepository`, seed scripts to import base dataset.

Considerações
- Cache municipio list in Redis for fast lookups.
