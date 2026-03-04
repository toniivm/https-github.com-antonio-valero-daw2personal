# 📸 SpotMap - Descubre y comparte lugares increíbles

> Aplicación web moderna para crear, compartir y descubrir ubicaciones (spots) en un mapa interactivo, con autenticación Supabase y sincronización en tiempo real.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue.svg)]()
[![License](https://img.shields.io/badge/license-Propietario-red.svg)]()

---

## 🚀 Quick Start (5 minutos)

### 1. Requisitos Previos
- **XAMPP** (PHP 8.0+, MySQL/MariaDB)
- **Cuenta Supabase** (gratuita): https://supabase.com
- **Git**

### 2. Instalación

```powershell
# Clonar repositorio
cd C:\xampp\htdocs
git clone <repo-url> spotMap
cd spotMap

# Configurar backend
Copy-Item backend\.env.example backend\.env
# EDITAR backend\.env con tus credenciales MySQL y Supabase

# Crear base de datos
php backend\init-database.php

# Configurar frontend
Copy-Item frontend\js\supabaseConfig.example.js frontend\js\supabaseConfig.js
# EDITAR frontend\js\supabaseConfig.js con tus keys de Supabase

# Abrir en navegador
Start-Process "http://localhost/spotMap/frontend/index.html"
```

### 3. Obtener Credenciales Supabase

1. Ve a https://app.supabase.com
2. Crea un proyecto nuevo (o usa existente)
3. Ve a **Settings → API**
4. Copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_KEY`

---

## 📋 Características

✅ **Autenticación**
- Login/Registro con email/password
- OAuth con Google, Facebook, Twitter, Instagram
- Sesiones persistentes con JWT

✅ **Gestión de Spots**
- Crear spots con foto, título, descripción
- Geolocalización automática
- Categorías y tags
- Búsqueda y filtros

✅ **Mapa Interactivo**
- Leaflet.js con OpenStreetMap
- Marcadores personalizados
- Popups con información

✅ **Social**
- Likes y favoritos
- Comentarios y ratings
- Compartir en redes sociales

✅ **Seguridad**
- Rate limiting
- CORS configurado
- CSP headers
- Sanitización de inputs
- Validación de archivos

---

## 🏗️ Arquitectura

```
spotMap/
├── backend/              # API REST en PHP
│   ├── src/
│   │   ├── Controllers/  # SpotController, AdminController, etc.
│   │   ├── Auth.php      # Validación JWT Supabase
│   │   ├── Database.php  # Conexión MySQL
│   │   ├── Security.php  # CORS, headers, sanitización
│   │   └── ...
│   ├── public/
│   │   └── index.php     # Entry point API
│   └── .env             # Configuración (NO en git)
│
├── frontend/             # SPA con ES6 Modules
│   ├── js/
│   │   ├── auth.js       # Sistema autenticación
│   │   ├── spots.js      # CRUD spots
│   │   ├── map.js        # Leaflet integration
│   │   ├── ui.js         # Interfaz de usuario
│   │   ├── supabaseClient.js  # Cliente Supabase
│   │   └── supabaseConfig.js  # Keys (NO en git)
│   ├── css/
│   │   └── styles.css    # Estilos personalizados
│   └── index.html        # SPA entry point
│
└── docs/                 # Documentación

Edita `backend\.env`:

```env
# Base de Datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spotmap
DB_USERNAME=root
DB_PASSWORD=

# Entorno
ENV=development         # development, production, staging
DEBUG=true              # Logs detallados
LOG_LEVEL=DEBUG         # DEBUG, INFO, WARN, ERROR

# Seguridad
RATE_LIMIT_ENABLED=false
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# API
API_VERSION=1.0.0
```

**Nota**: `backend\.env` está en `.gitignore` — no se commitea. Cada máquina puede tener sus propias credenciales.

## 🛠️ Desarrollo

### Quality Gate (recomendado antes de PR)

Desde la raíz `spotMap/`:

```powershell
./scripts/quality-gate.ps1
```

Opciones útiles:

```powershell
# Saltar e2e (rápido)
./scripts/quality-gate.ps1 -SkipE2E

# Saltar backend phpunit
./scripts/quality-gate.ps1 -SkipBackend
```

### Smoke de integración (API)

```powershell
# Base por defecto: http://localhost/spotMap/backend/public/index.php
./scripts/integration-smoke.ps1

# Si tu ruta local es distinta
$env:SMOKE_BASE_URL = 'http://localhost/tu-ruta/spotMap/backend/public/index.php'
./scripts/integration-smoke.ps1
```

### Migraciones

```powershell
# Ejecutar migraciones pendientes
php backend\migrate.php up

# Ver estado
php backend\migrate.php status

# Rollback (borra tablas)
php backend\migrate.php down
```

### Estructura de Datos

**Tabla: `spots`**
```sql
id              INT PRIMARY KEY AUTO_INCREMENT
title           VARCHAR(255)
description     TEXT
lat             DOUBLE (latitud)
lng             DOUBLE (longitud)
tags            JSON (array de tags)
category        VARCHAR(100)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

## 🔒 Seguridad

- **Validación de entrada**: `backend/src/Validator.php`
- **Rate limiting**: Configurable en `.env`
- **CORS**: Configurable en `.env`
- **Logging**: Todas las peticiones se registran
- **Sensibilidad de datos**: Contraseñas enmascaradas en logs

## 📝 Ejemplos de Uso

### Crear un Spot

```bash
curl -X POST http://localhost/.../backend/public/index.php/spots \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Graffiti Wall",
    "description": "Famous street art location",
    "lat": 40.7128,
    "lng": -74.0060,
    "category": "art",
    "tags": ["street-art", "famous"]
  }'
```

### Listar Spots

```bash
curl http://localhost/.../backend/public/index.php/spots
```

### Comprobar Salud de API

```bash
curl http://localhost/.../backend/public/index.php/api/status | jq
```

## 🤝 Compartir Entre Ubicaciones (Casa/Clase)

1. Configura BD remota en PlanetScale.
2. Cada ubicación clona el repo y configura su `backend\.env` con las **mismas** credenciales remotas.
3. Los cambios se sincronizan automáticamente.

## 📚 Documentación

- [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) — Referencia de la API
- [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) — Estado y arquitectura
- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) — Despliegue seguro
- [`DOCKER.md`](./DOCKER.md) — Docker y orquestación
- [`SECURITY.md`](./SECURITY.md) — Seguridad
- [`backend/CLI_TOOLS.md`](./backend/CLI_TOOLS.md) — Herramientas de CLI
- [`backend/init-db/schema.sql`](./backend/init-db/schema.sql) — Esquema de BD
- [`docs/SPOTMAP_DOCUMENTO_FINAL_PROYECTO.md`](./docs/SPOTMAP_DOCUMENTO_FINAL_PROYECTO.md) — Documento final

## 📊 Monitoreo en Tiempo Real

SpotMap incluye un **sistema empresarial de monitoring** con:

### Dashboard en Vivo
```
URL: https://spotmap.local/monitoring.html
```
Ver métricas, logs y alertas en tiempo real.

### CLI Tools
```bash
# Ver últimos logs
php backend/cli-logs.php tail 50

# Filtrar errores
php backend/cli-logs.php filter error 100

# Ver alertas
php backend/cli-logs.php alerts 20

# Estadísticas del sistema
php backend/cli-logs.php stats

# Health check automático
php backend/health-check.php
```

### Componentes Incluidos
- **AdvancedLogger** — Logging centralizado con sanitización y rotación
- **PerformanceMonitor** — Tracking de performance y memoria
- **ErrorTracker** — Captura automática de errores y excepciones
- **MonitoringController** — API REST para datos de monitoreo
- **monitoring.html** — Dashboard visual profesional

Ver [`backend/CLI_TOOLS.md`](./backend/CLI_TOOLS.md) para documentación completa.

## 🐛 Troubleshooting

### La API no responde

1. Verifica que Apache está corriendo: XAMPP Control Panel.
2. Comprueba `backend\.env` tiene credenciales correctas.
3. Revisa logs: `D:\Escritorio\xampp\apache\logs\error.log`
4. Prueba endpoint de diagnóstico: `/ping-db` o `/api/status`

### "Database connection failed"

- ¿MySQL está corriendo?
- ¿Las credenciales en `.env` son correctas?
- Si usas PlanetScale con `pscale connect`, ¿sigue abierto el túnel?

### Las tablas no existen

```powershell
php backend\migrate.php up
```

## 📦 Dependencias

- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.3+
- navegador moderno (Chrome, Firefox, Edge, Safari)

## 🚢 Deploy

Para producción, ver [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) — Sección "Security Headers".

Recomendaciones:
- Usar BD gestionada (PlanetScale, Cloud SQL, RDS).
- Configurar CI/CD con GitHub Actions.
- Habilitar HTTPS.
- Usar variables de entorno securas (no archivos `.env`).

## 📄 Licencia

(Especificar licencia aquí)

## 👨‍💻 Autores

- Antonio Valero (DAW2)

## 📞 Contacto

(Contacto o issue tracker)

---

**Última actualización**: Enero 2026
