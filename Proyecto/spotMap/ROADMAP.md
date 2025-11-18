# SpotMap - Roadmap Evolutivo

## Fase 1 (Listo / Base)
- Lectura de spots aprobados.
- Mapa y listado responsive.
- Supabase como origen de datos.

## Fase 2 (Auth + Roles)
- Implementar registro/login (Supabase Auth).
- Tabla `profiles` y asignación rol `user` por defecto.
- Mostrar spots propios pending.

## Fase 3 (Moderación)
- Campo `status` en spots.
- Panel moderador: lista pending + acciones aprobar/rechazar.
- Policies RLS activas.

## Fase 4 (Realtime)
- Suscripción a cambios en spots.
- Actualización en vivo de mapa/lista.
- Indicador de nuevos spots.

## Fase 5 (Dashboard Admin)
- Agregaciones: total spots, por categoría, evolución semanal.
- Gráficos (Chart.js).
- Cambiar roles usuario.

## Fase 6 (PWA Básico)
- `manifest.json`.
- Service Worker: precache assets + offline fallback.
- Instalación en móvil.

## Fase 7 (Optimización Frontend)
- Refactor progresivo a componentes (opcional React/Vue).
- Lazy loading de imágenes.
- Mejora rendimiento (Lighthouse > 90).

## Fase 8 (Accesibilidad)
- Navegación teclado completa.
- Alt en imágenes + ARIA labels.
- Contraste verificado.

## Fase 9 (Internacionalización)
- Sistema de traducciones (JSON locale).
- Idioma auto detectado + selector.

## Fase 10 (API Pública Documentada)
- Endpoint lectura (solo approved).
- Rate limiting (Supabase + capa simple). 
- Documentación de parámetros (categoría, bounding box futuro).

## Fase 11 (IA Moderación Básica)
- Etiquetado automático sugerido según descripción.
- Detección contenido sensible imágenes (modelo externo / edge function).
- Registro en `audit_logs`.

## Fase 12 (Mobile Wrapper)
- Empaquetar PWA con Capacitor.
- Acceso a geolocalización avanzada y notificaciones push (si necesario).

## Fase 13 (Geo Avanzado)
- Evaluar PostGIS para búsquedas por radio.
- Clustering de marcadores.

## Fase 14 (Comunidad / Social)
- Favoritos, comentarios, rating.
- Moderación de comentarios.

## Fase 15 (Transparencia / Open Data)
- Export público JSON/CSV de spots approved.
- Página de estadísticas públicas.

## Métricas de Éxito (KPIs)
- Tiempo medio aprobación (<24h).
- % spots rechazados vs totales.
- Usuarios activos semanales.
- Latencia media carga de mapa.

## Prioridad Recomendada
Seguir orden hasta Fase 6 para presentación del proyecto final. Fases posteriores como plan de crecimiento.
