# C4 Context — coletare-new-back

```mermaid
flowchart LR
    citizen[Cidadão]
    cityAdmin[Admin do Município]
    platformAdmin[Platform Admin]
    employee[Colaborador]
    vehicle[Veículo]

    coletare[Coletare Web\nNext.js + TypeScript]

    firebaseAuth[Firebase Auth]
    firebaseDb[Firebase Realtime DB / Firestore]
    firebaseStorage[Firebase Storage]
    maps[Google Maps Platform]
    expo[Expo Push Service]
    smtp[Gmail SMTP / Nodemailer]
    ecotools[API Ecoponto (REST)]

    citizen -->|consulta avisos / recebe notificações / solicita retirada| coletare
    cityAdmin -->|gerencia rotas, veículos, colaboradores, avisos| coletare
    platformAdmin -->|gerencia municípios e visão global| coletare
    employee -->|opera coleta| coletare
    vehicle -->|dados operacionais de coleta| coletare

    coletare -->|autenticação| firebaseAuth
    coletare -->|dados de domínio| firebaseDb
    coletare -->|upload/remoção de imagens| firebaseStorage
    coletare -->|mapas, geocoding, rotas| maps
    coletare -->|envio de push| expo
    coletare -->|envio de email| smtp
    coletare -->|CRUD ecopontos| ecotools
```

- 🟢 **CONFIRMADO** Integrações externas principais: Firebase, Google Maps, Expo Push, SMTP e API de ecopontos.
- 🟢 **CONFIRMADO** O sistema central é uma aplicação web Next.js com rotas de UI e APIs internas.
