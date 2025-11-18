# SpotMap Performance & Optimización

## Cache capa aplicación
- Archivo: `backend/src/Cache.php` (cache file-based en `sys_temp_dir`).
- Controlador `SpotController` usa cache para:
  - Listado `/spots` (clave `spots_{page}_{limit}` TTL 60s)
  - Detalle `/spots/{id}` (clave `spot_{id}` TTL 120s)
- Invalidación: creación, eliminación y upload de foto.
- Warm cache en `bootstrap.php` precarga `spots_1_50` (TTL 120s) cuando `ENV=production`.

## Mejoras propuestas futuras
- Sustituir file cache por Redis/Memcached.
- Prefetch incremental de páginas más solicitadas según métricas.
- TTL adaptativo: aumentar para páginas con poca rotación de datos.
- Diferenciar cache para usuarios autenticados si cambia contenido.

## Content Security Policy (CSP)
- Dinámica vía configuración (`CSP_*` variables en `Config.php`).
- Nonce por petición (`X-CSP-Nonce`) para permitir scripts inline seguros.
- Eliminado `unsafe-inline` de `script-src`.

## Rate Limiting
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- Migrar a almacenamiento centralizado (Redis) para escalado horizontal futuro.

## Docker optimizado
- Multi-stage build reduce tamaño final.
- Composer y herramientas quedan fuera de runtime.

## Frontend (pendiente)
- Sugerencias: preconnect a Supabase, lazy load imágenes, usar `IntersectionObserver` para spots.
- Agregar compresión Brotli (si Nginx proxy en producción).

## Próximos pasos
1. Métricas de cache (hits/miss) con contador en memoria.
2. Añadir ETag / Last-Modified en respuestas estáticas.
3. Integrar Service Worker para cache persistente extendido.
4. Test de carga con k6 / Artillery para ajustar límites.
