# Rota — Design (detalhes)

Componentes
- Use-cases: `GetRotaDetails`, `GetRotaProgress`.
- Repositório: `RouteRepository` com projeções para detalhes e progresso.

Considerações
- For large polylines, store separate `route_segments` if necessary.
