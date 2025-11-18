# 🚀 SpotMap - Setup Completo

## 📋 Resumen de lo que he hecho

He migrado **SpotMap** a una arquitectura moderna con:
- ✅ **Supabase** como base de datos en la nube (PostgreSQL + Auth + Storage + Realtime)
- ✅ **Sistema de roles** (user, moderator, admin) con RLS (Row Level Security)
- ✅ **Panel de moderación** para aprobar spots pendientes
- ✅ **PWA básico** (manifest + service worker para instalación móvil)
- ✅ **Autenticación completa** (login, registro, sesiones persistentes)
- ✅ **Subida de imágenes** directa a Supabase Storage

---

## 🎯 Arquitectura Actual

```
Usuario → Frontend (JS ES6 modules)
            ↓
         Supabase Client (SDK v2)
            ↓
         Supabase (PostgreSQL)
            ├─ Auth (usuarios)
            ├─ Postgres (tablas: profiles, spots)
            ├─ Storage (imágenes: bucket public)
            ├─ Realtime (cambios en vivo - pendiente)
            └─ RLS Policies (seguridad)

Backend PHP (legacy/fallback opcional)
```

---

## 📂 Archivos Clave Creados/Modificados

### Frontend
- `frontend/js/supabaseClient.js` - Cliente Supabase + helpers (auth, spots, profiles, upload)
- `frontend/js/supabaseSpots.js` - Capa de acceso a spots (approved, pending, CRUD)
- `frontend/js/auth.js` - Refactorizado para SDK Supabase v2 + roles dinámicos
- `frontend/js/spots.js` - `createSpot` ahora usa Supabase + estado `pending`
- `frontend/js/main.js` - Añadido panel de moderación (listar pending, aprobar/rechazar)
- `frontend/js/ui.js` - Mensaje si spot queda pending tras creación
- `frontend/index.html` - Panel de moderación + registro service worker
- `frontend/manifest.json` - PWA config (instalable)
- `frontend/service-worker.js` - Cache básico de assets

### Config & SQL
- `SQL_RLS_BASE.sql` - Tablas (`profiles`, `spots`) + policies RLS completas
- `frontend/js/supabaseConfig.js` - ⚠️ Credenciales Supabase (NO GIT)
- `config/` - Directorio seguro para credenciales (ya en `.gitignore`)
- `.gitignore` - Actualizado para ignorar configs sensibles

### Documentación
- `ARQUITECTURA.md` - Diagrama y justificación técnica
- `DATOS_MODELO.md` - Tablas, campos, migraciones SQL
- `ROLES_Y_RLS.md` - Explicación de roles y policies de seguridad
- `ROADMAP.md` - Plan evolutivo por fases (hasta fase 15)

---

## 🔧 Pasos para Usar en Tu Máquina

### 1. Ejecutar SQL en Supabase
Ve a tu proyecto Supabase → SQL Editor → Ejecuta:
```bash
SQL_RLS_BASE.sql
```
Esto crea:
- Tabla `profiles` (user_id, role)
- Tabla `spots` (id, user_id, title, lat, lng, status, etc.)
- Policies RLS (visibilidad según rol)
- Funciones helpers (`is_admin()`, `is_moderator()`)

### 2. Crear Bucket de Imágenes
Supabase → Storage → Create bucket:
- Nombre: `public`
- Public: ✅ Sí

### 3. Configurar Credenciales (Ya hecho)
El archivo `frontend/js/supabaseConfig.js` ya tiene tus credenciales.
Si cambias de proyecto Supabase, edita:
```javascript
export const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

### 4. Arrancar XAMPP
- Apache encendido
- Abre: `http://localhost/.../spotMap/frontend/index.html`

### 5. Probar Flujo Completo
1. **Registrarte** (modal Register)
2. **Crear spot** (botón "+ Añadir Spot")
   - Se crea con `status = pending`
   - Si tienes imagen, se sube a Storage
3. **Ver pending** (solo si eres moderator/admin)
   - Necesitas cambiar tu rol manualmente en Supabase:
   ```sql
   UPDATE profiles SET role='moderator' WHERE user_id='TU_UUID';
   ```
4. **Aprobar spot** (desde panel moderación)
   - Spot pasa a `approved` → visible público

---

## 🛡️ Sistema de Roles

| Rol | Permisos |
|-----|----------|
| **guest** (anónimo) | Ver spots aprobados |
| **user** | Crear spots (pending), ver propios pending + aprobados |
| **moderator** | Aprobar/rechazar spots, ver todos pending |
| **admin** | Todo lo anterior + cambiar roles de usuarios |

### Cómo cambiar rol manualmente
Supabase → Table Editor → profiles:
```sql
UPDATE profiles SET role='moderator' WHERE user_id='UUID_DEL_USUARIO';
```

---

## 📱 PWA (Instalable)

La app ya tiene:
- ✅ `manifest.json` (nombre, iconos, theme)
- ✅ `service-worker.js` (cache de assets)

Para instalar:
1. Chrome/Edge → Visita la app
2. Botón "Instalar" en barra de direcciones
3. Funciona offline (básico)

---

## 🔐 Seguridad (Archivos NO Git)

He configurado `.gitignore` para NO subir:
- `frontend/js/supabaseConfig.js` ⚠️
- `backend/.env` ⚠️
- `config/*` (credenciales)
- uploads, logs, cache

**Para otro PC:**
Copia manualmente:
- `frontend/js/supabaseConfig.js`
- `backend/.env`
- `config/` (si tienes archivos ahí)

---

## 🚀 Roadmap Implementado vs. Pendiente

### ✅ Completado
- Fase 1: Lectura spots aprobados
- Fase 2: Auth + Roles
- Fase 3: Moderación (pending/approved/rejected)
- Fase 6: PWA básico (manifest + SW)
- SQL RLS policies activas
- Subida de imágenes a Storage

### 🔜 Pendiente (Opcional)
- Fase 4: Realtime (actualización automática sin recargar)
- Fase 5: Dashboard admin (métricas, gráficos)
- Fase 7: Optimización frontend (React/Vue si quieres)
- Fase 8: Accesibilidad (ARIA, navegación teclado)
- Fase 9: i18n (multi-idioma)

---

## 🐛 Troubleshooting

### Problema: "No veo spots"
- ✅ Ejecutaste `SQL_RLS_BASE.sql`?
- ✅ Hay spots con `status='approved'` en la tabla?
- ✅ `supabaseConfig.js` tiene las credenciales correctas?

### Problema: "No puedo crear spot"
- ✅ Estás autenticado (login)?
- ✅ Tu `user_id` existe en tabla `profiles`?
- ✅ Revisa consola del navegador (F12) para errores

### Problema: "No veo panel de moderación"
- ✅ Tu rol es `moderator` o `admin`?
```sql
SELECT role FROM profiles WHERE user_id = auth.uid();
```

### Problema: "Error subiendo imagen"
- ✅ Bucket `public` existe en Storage?
- ✅ Es público (settings del bucket)?
- ✅ Tamaño < 5MB y formato válido (jpg/png/webp/gif)?

---

## 📊 Base de Datos (Resumen)

### Tabla `profiles`
```sql
user_id (uuid PK) | role (text) | created_at
```

### Tabla `spots`
```sql
id | user_id | title | description | lat | lng | 
tags[] | category | image_path | status | created_at | updated_at
```

**Estados (status):**
- `pending` - Recién creado, solo visible al autor y moderadores
- `approved` - Público, visible a todos
- `rejected` - Oculto, puede re-editarse

---

## 🎓 Para la Presentación (TFG)

### Narrativa Técnica
1. **Problema**: Compartir spots sin BD central, solo local
2. **Solución**: Migración a Supabase (cloud, roles, moderación)
3. **Arquitectura**: Frontend ligero + Supabase (Auth + DB + Storage + RLS)
4. **Seguridad**: Policies RLS declarativas (no código backend)
5. **Escalabilidad**: Realtime, PWA, caché, paginación
6. **Impacto social**: Transparencia, moderación comunitaria, acceso abierto

### Documentos para Tribunal
- `ARQUITECTURA.md` - Diagrama + justificación
- `DATOS_MODELO.md` - Modelo ER + SQL
- `ROLES_Y_RLS.md` - Seguridad
- `ROADMAP.md` - Plan de crecimiento

### Demo en Vivo
1. Mostrar spots públicos (anónimo)
2. Login → crear spot → queda pending
3. Login como moderador → aprobar → spot público
4. Instalar PWA (móvil)

---

## 📞 Próximos Pasos (Cuando Quieras)

1. **Realtime**: Spots se actualizan sin recargar (suscripción Supabase)
2. **Dashboard**: Gráficos de spots por categoría/tiempo (Chart.js)
3. **i18n**: Multi-idioma (ES/EN)
4. **Tests**: Pruebas unitarias (Jest/Vitest)

---

## ✅ Estado Final

**SpotMap está lista para:**
- ✅ Uso multi-PC (misma BD Supabase)
- ✅ Roles y moderación funcional
- ✅ Subida de imágenes
- ✅ PWA instalable
- ✅ Presentación en clase (TFG)

**Archivos sensibles protegidos:**
- ✅ `.gitignore` actualizado
- ✅ `config/` para credenciales locales
- ✅ `supabaseConfig.js` generado (NO en git)

---

🎉 **¡Proyecto migrado exitosamente!**

Cualquier duda, revisa los `.md` en la raíz o pregúntame.
