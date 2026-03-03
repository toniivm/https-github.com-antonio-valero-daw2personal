# frontend-vue (SpotMap Migration)

Base de migración incremental a Vue 3 + Pinia + Leaflet.

## Requisitos
- Node 20.x (probado en 20.17)
- npm 10+

## Comandos
```powershell
cd frontend-vue
npm install
npm run dev
npm run build
```

## Estado actual
- Layout responsive (sidebar + mapa)
- Carga spots desde backend (`backend/public/index.php/spots`)
- Selección de spot en lista centra el mapa

## Nota de estrategia
Este frontend convive temporalmente con `frontend/` (legado). No sustituye producción todavía.
