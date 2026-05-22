# Avisos (Warnings) — Requisitos

Resumo
- CRUD de avisos, criação por colaboradores/operadores, visibilidade por município/rota.

Funcionais
- Endpoints: `/bff/avisos`, `/bff/avisos/{id}` (GET, POST, PUT, DELETE).
- Anexos opcionais (imagem) referenciados via storage adapter.

Não-funcionais
- Pesquisas por filtro (municipio, status) com paginação.

Critérios de aceitação
- Operações CRUD validadas em staging; filtros retornam resultados equivalentes ao sistema atual.
