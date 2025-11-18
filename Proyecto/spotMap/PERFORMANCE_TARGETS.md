# Objetivos de Rendimiento

## Metas
- Búsqueda y listado de spots: < 3s en condiciones normales (<1s objetivo).
- Tiempo de primera carga mapa: < 2s (cached assets + API request).
- P99 latencia endpoints críticos (GET /spots): < 800ms.

## Estrategias
1. Cache HTTP: ETag + 304 ya implementado, aumentar TTL y CDN.
2. Cache interna: Warm cache en arranque para spots populares (TODO: ranking favoritos/ratings).
3. Reducción de payload: Paginar (limit por defecto 50) y permitir campos selectivos (futuro `fields=lat,lng,title`).
4. Índices Supabase (Postgres): Crear índices por `category`, `created_at`, y compuestos `(spot_id,user_id)` en tablas de interacción.
5. Pre-agregación: Vista `spot_popularity` utilizada para métricas rápidas.
6. Compresión: Activar gzip/brotli en Nginx/CDN.
7. CDN estático: Frontend en Vercel + edge caching.
8. Evitar N+1: Agrupar agregados en una sola vista en lugar de múltiples requests.

## Monitoreo
- /api/metrics ampliado para latencia (futuro: capturar tiempo inicio-fin por request).
- Alertas cuando P99 > umbral.

## Próximos Pasos
- Implementar parámetros de filtro en DatabaseAdapter para reducir dataset.
- Añadir `popular=true` que use vista `spot_popularity` ordenada por favoritos + rating.
- Medir carga con herramienta (k6 / autocannon) y ajustar TTLs.

Última actualización: 2025-11-18.
