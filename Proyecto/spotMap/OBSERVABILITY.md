# Observabilidad y Métricas

Este documento describe las métricas expuestas por la API y cómo utilizarlas para monitoreo básico.

## Endpoints

- `GET /api/metrics`: Devuelve métricas en formato JSON.
- `GET /api/status`: Estado de salud (con información de conexión y configuración cargada).

## Activación

Las métricas se exponen solo si `METRICS_ENABLED=true` en las variables de entorno o archivo de configuración.

## Métricas Disponibles

Respuesta típica de `/api/metrics`:
```json
{
  "generated_at": 1731900000,
  "env": "production",
  "hits": 120,
  "misses": 45,
  "requests_total": 300,
  "requests_spots_list": 140,
  "requests_spots_show": 90,
  "requests_spots_create": 20,
  "requests_spots_delete": 5,
  "requests_spots_upload": 4
}
```

Campos:
- `hits` / `misses`: Accesos y fallos de cache de respuestas (memoria del proceso).
- `requests_total`: Número total de peticiones atendidas desde el arranque.
- `requests_spots_*`: Contadores por tipo de operación sobre spots.
- `generated_at`: Timestamp de generación.
- `env`: Entorno (`ENV`).

## Persistencia y Limitaciones

Los contadores se almacenan en memoria (estáticas PHP). Si el proceso se reinicia (deploy, crash o escalado horizontal) los valores se reinician. Para métricas agregadas globales se recomienda:
- Integrar Prometheus (scrape periódico) transformando `/api/metrics` a formato de texto exposition.
- Exportarlas a logs estructurados y enviar a un collector (ELK / Loki / Datadog).
- Usar un almacén externo (Redis) para consolidar contadores entre workers.

## Extensión a Prometheus (Ejemplo Futuro)
Un posible formato sería:
```
# HELP spotmap_requests_total Total de peticiones
# TYPE spotmap_requests_total counter
spotmap_requests_total 300
spotmap_requests_spots_list 140
spotmap_requests_spots_show 90
spotmap_requests_spots_create 20
spotmap_requests_spots_delete 5
spotmap_requests_spots_upload 4
spotmap_cache_hits 120
spotmap_cache_misses 45
```

## Buenas Prácticas
1. Activar métricas solo en entornos donde no impacte performance excesivamente.
2. Scrape /api/metrics cada 15-60 segundos para monitoreo básico.
3. Correlacionar picos de `misses` con posible invalidez de cache o TTL demasiado corto.
4. Observar ratio hits/(hits+misses) > 0.6 para caché efectiva.
5. Añadir alertas cuando `requests_spots_create` se dispare (posible abuse) o `requests_spots_delete` exceda umbrales.

## Próximos Pasos Sugeridos
- Añadir tiempo de respuesta p95/p99 (requiere medición por solicitud).
- Incluir contador de errores (4xx/5xx) por categoría.
- Exponer métricas en texto Prometheus directamente.
- Añadir métricas por usuario (si OWNERSHIP_ENABLED) agregadas.

---
Última actualización: 2025-11-18.
