# SpotMap - Arquitectura

## 1. Visión
SpotMap permite descubrir y compartir "spots" (lugares) desde cualquier dispositivo. La meta: plataforma abierta, moderada y escalable con mínima complejidad técnica para poder explicarla claramente en tu presentación y extenderla a móvil (PWA / Capacitor) sin reescrituras.

## 2. Componentes Principales
- Frontend Web (HTML/CSS/JS modular): Mapa (Leaflet), UI de listado, creación y moderación.
- Supabase (PostgreSQL + Auth + Storage + Realtime + RLS): Fuente central de verdad.
- Backend PHP (actual mínimo): Capa legacy opcional; puede retirarse gradualmente si el frontend consume directamente Supabase.
- Service Worker (PWA futuro): Cache selectivo (assets + spots aprobados).
- Herramientas IA (apoyo): Asistir en generación de consultas SQL, validación de código, clasificación futura de imágenes.

## 3. Flujo Alto Nivel
```
Usuario -> Navegador -> (JS SDK Supabase / API PHP) -> Supabase (Auth / Postgres / Storage / Realtime)
                                        |-> Policies RLS (roles + permisos)
                                        |-> Eventos Realtime (actualizar mapa)
```

## 4. Justificación Tecnológica
- Supabase sustituye necesidad de: servidor propio de auth, sistema de archivos, websockets custom y migraciones manuales complejas.
- RLS (Row Level Security) evita desarrollar muchas rutas backend de control de acceso.
- PostgreSQL relacional facilita filtrado por categoría, estado y agregaciones para dashboards.
- Frontend ligero facilita explicación didáctica y transición progresiva a framework (React/Vue) si es necesario.

## 5. Modelo de Datos (Resumen)
- `profiles(user_id PK, role, created_at)`
- `spots(id PK, user_id FK, title, description, lat, lng, tags, category, image_path, status, created_at, updated_at)`
- Opcional: `audit_logs(id, user_id, action, entity_type, entity_id, created_at)`

## 6. Estados de un Spot
- `pending`: recién creado, visible sólo al autor y moderadores.
- `approved`: público (visible a visitantes anónimos).
- `rejected`: oculto al público; autor puede editar y reenviar.

## 7. Seguridad y Roles
Roles en `profiles.role`: `user | moderator | admin`.
Policies RLS ejecutan lógica de visibilidad y modificación directamente en la base.
Evita exponer la service role key (sólo usar anon key en frontend). Acciones administrativas se hacen con un token seguro (desde panel restringido) o funciones edge protegidas (fase avanzada).

## 8. Realtime
Suscripción a cambios en la tabla `spots` para:
- Añadir marcador nuevo en mapa si `status = approved`.
- Actualizar o retirar marcador si cambia su estado.

## 9. PWA (Fase futura)
- `manifest.json`: nombre, iconos, tema.
- Service Worker: precache assets + estrategia NetworkFirst para listados.
- Offline: mostrar últimos spots aprobados y un fallback para el mapa (mensaje de desconexión).

## 10. Escalabilidad / Evolución
- Cargas crecientes: usar paginación y filtros server-side (limit + range en Supabase).
- Geo-extensión: Indices por lat/lng (o extensión PostGIS más adelante).
- Edge Functions: validación adicional, procesado de imágenes (thumbnails). 
- CDN: las imágenes sirven desde Storage (ya optimizable via caching headers).

## 11. Integración IA (Oportunidades)
- Autocompletado de código (Copilot) para acelerar componentes y consultas.
- Generación de queries agregadas (explicar razonamientos en documentación).
- Etiquetado automático de categorías a partir de la descripción (modelo ligero fine-tuned; fase avanzada).
- Detección de contenido inapropiado en imágenes antes de aprobar (modelos de moderación open-source + edge function).

## 12. Diagrama Detallado (Texto)
```
[Frontend]
  - UI Spots (grid/map/list)
  - Auth (login/signup)
  - Panel Moderación
  - Panel Admin (Dashboard)
      |  JS SDK Supabase
      v
[Supabase]
  - Auth Users
  - Postgres
     * profiles (roles)
     * spots (data + estado)
  - Storage (imagenes)
  - Realtime (canales spots)
  - RLS Policies
```

## 13. Principios de Diseño
- Claridad antes que complejidad (mostrar diagrama simple primero).
- Separación progresiva (no sobre-ingeniería inicial).
- Transparencia (cada campo y policy documentados).
- Escalado horizontal opcional sin rehacer arquitectura (Supabase gestiona internamente).

## 14. Ventajas para la Presentación
- Muestra dominio de: auth, roles, seguridad, datos geoespaciales básicos, PWA, realtime.
- Narrativa social (ayuda a compartir lugares de interés) + robustez técnica.

## 15. Próximo Paso Inmediato
Implementar tablas y policies básicas; luego interfaz de moderación. Roadmap concreto en `ROADMAP.md`.
