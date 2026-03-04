# SpotMap — Baseline del Anteproyecto y Roadmap de Cumplimiento

## 1) Baseline funcional (fuente de verdad)

Este documento fija los requisitos base del anteproyecto para todo trabajo futuro en `spotMap/`.

### Contexto y propuesta de valor
- Plataforma especializada en descubrimiento y compartición de spots fotográficos.
- Diferencial frente a alternativas generales (mapas, inspiración visual, apps turísticas locales).

### Fortalezas esperadas
1. Producto enfocado 100% a spots fotográficos.
2. Crecimiento colaborativo por comunidad.
3. Base técnica escalable y mobile-first.
4. Preparación para integraciones de IA.

### Vulnerabilidades a gestionar
1. Moderación de contenido inapropiado o mal categorizado.
2. Problema de masa crítica inicial.
3. Riesgos legales (privacidad/derechos de imagen).
4. Saturación de spots populares.

## 2) Objetivo del producto

### Objetivo general
Desarrollar una aplicación web colaborativa para descubrir, compartir y valorar spots fotográficos, con UX simple y arquitectura escalable.

### Objetivos específicos (MVP+)
- Autenticación segura con roles: usuario, moderador, administrador.
- Mapa interactivo con búsqueda por cercanía, categoría y popularidad.
- Alta de spots con fotos, descripción, etiquetas y ubicación precisa.
- Filtros fotográficos útiles (mejor hora, dificultad, temporada).
- Gamificación (puntuaciones/logros).
- Panel de administración/moderación y estadísticas básicas.
- Base técnica preparada para IA.

### Innovaciones objetivo
- Metadatos fotográficos (orientación solar, altitud, luz).
- Clasificación semántica de spots.
- Compartición de spots/rutas en redes.
- Reportes por masificación o deterioro ambiental.

## 3) Restricciones de implementación actuales del repositorio

Para evitar reescrituras innecesarias, se aplican estas decisiones tácticas:

- Frontend de evolución: `frontend-vue/` (Vue 3) como objetivo de migración.
- Backend actual: API PHP enrutada manualmente desde `backend/public/index.php`.
- Capa de datos actual: `DatabaseAdapter` con MySQL local y/o Supabase.

Nota: El anteproyecto menciona Laravel/Symfony y MongoDB; hoy el código productivo está en PHP custom + MySQL/Supabase. Cualquier cambio de stack se tratará como migración mayor planificada, no como cambio oportunista.

## 4) Gap analysis (estado actual vs anteproyecto)

### Ya cubierto o parcialmente cubierto
- Roles y auth base (usuario/moderador/admin) en backend actual.
- CRUD de spots + mapa + componentes sociales base (comentarios/ratings/favoritos).
- Moderación y reporting base.
- Dashboard/monitoring y utilidades CLI.
- Frontend Vue funcional en migración incremental.

### Pendiente clave (alto impacto)
1. Filtros fotográficos avanzados (hora ideal, temporada, dificultad).
2. Metadatos de fotografía (orientación solar, altitud, luz).
3. Gamificación estructurada (logros, reputación, hitos).
4. Estrategia de crecimiento (seed de comunidad + SEO + compartición).
5. Capa legal/privacidad formalizada (consentimiento, imágenes, reportes).
6. Endurecimiento de pruebas E2E y cobertura de flujos críticos en Vue.

### Pendiente de arquitectura (fase posterior)
1. Búsqueda avanzada tipo ElasticSearch/OpenSearch.
2. Colas de trabajo para procesos en segundo plano.
3. Pipeline de imágenes (miniaturas/EXIF).
4. Diseño de IA (asistente de clasificación/recomendación).

## 5) Backlog priorizado (P0/P1/P2)

### P0 — Cerrar MVP funcional robusto
1. Completar paridad funcional en `frontend-vue` (explorar, crear, comentar, valorar, moderar básico).
2. Asegurar contract testing API ↔ frontend.
3. Definir esquema mínimo de metadatos fotográficos en Spot y exponerlo en API.
4. Añadir filtros MVP: cercanía, categoría, popularidad, temporada, dificultad.
5. Endurecer moderación: reglas, estados, auditoría y reportes de incidencias.

#### Estado P0 (actualizado 2026-03-03)
- ✅ Filtros fotográficos MVP en backend + frontend-vue (best_time/schedule, difficulty, season) con paginación consistente y tests.
- ✅ Contract tests de `GET /spots` añadidos en backend (`SpotControllerContractTest`).
- ✅ Esquema mínimo de metadatos fotográficos formalizado en `backend/init-db/schema.sql`.
- ✅ Auth local compatible con fallback JWT y roles válidos para flujos de moderación en entorno de desarrollo.
- ✅ `frontend-vue` cubre ya: explorar/listar/filtrar, autenticación básica, moderación mínima (pending/approve/reject), creación y edición básica de spots.
- ✅ Bloque social básico en `frontend-vue` para spot seleccionado: favoritos, rating y comentarios.
- ✅ Validación técnica actual: lint/test/build Vue y PHPUnit backend en verde.

### P1 — Escalabilidad y calidad operativa
1. Pipeline de calidad único (lint/test/build/e2e/backend) mantenido en `scripts/quality-gate.ps1`.
2. Observabilidad: métricas de producto (spots creados, aprobaciones, tiempos de moderación).
3. Rendimiento: caché selectiva y optimización de consultas críticas.
4. Seguridad: revisión de permisos por rol + sanitización end-to-end.
5. Política de datos legales: privacidad, derechos de imagen y retención.

### P2 — Diferenciación e innovación
1. Gamificación (reputación, badges, retos locales).
2. Compartición avanzada de spots/rutas en redes.
3. Sistema anti-masificación y alertas de impacto ambiental.
4. Integración de servicios externos (search engine, colas, procesamiento multimedia).
5. Preparación de IA: etiquetado semántico asistido y recomendaciones contextuales.

## 6) Criterios de “done” por fase

### Done MVP
- Flujos E2E verdes en desktop/móvil para buscar/publicar/valorar/moderar.
- Panel de moderación operativo con auditoría.
- API estable y documentada para ambos frontends durante migración.

### Done Escalabilidad
- Calidad automatizada reproducible en local/CI.
- Métricas y alertas básicas activas.
- Riesgos legales y de seguridad cubiertos con checklist verificable.

### Done Innovación
- Metadatos fotográficos + filtros diferenciadores en producción.
- Módulos de gamificación y reportes ambientales en uso.
- Base técnica lista para IA sin romper contratos existentes.

## 7) Decisión de stack (importante)

Actualmente no se recomienda migrar de inmediato a Laravel/MongoDB mientras se cierra MVP y migración Vue.

Regla práctica:
- Primero: cerrar paridad funcional y calidad operacional.
- Después: evaluar migración de stack con RFC técnico (coste/beneficio, riesgos, downtime, plan de datos).
