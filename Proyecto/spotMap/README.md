# spotMap - Mapa Colaborativo de Spots

Aplicación web para crear, compartir y gestionar "spots" (ubicaciones de interés) en un mapa interactivo, con sincronización en tiempo real si se usa BD remota.

## 📋 Descripción

**spotMap** permite a usuarios mapear lugares de interés, categorizarlos y compartirlos. Ideal para:
- Mapas comunitarios de graffiti, arte callejero.
- Recomendaciones locales (cafés, parks, eventos).
- Geolocalización educativa de POIs (Puntos de Interés).

## 🏗️ Arquitectura

```
spotMap/
├── backend/           # API PHP
│   ├── src/
│   │   ├── Config.php           # Gestión de configuración (env vars)
│   │   ├── Database.php         # Conexión y pool de BD
│   │   ├── Logger.php           # Logging centralizado
│   │   ├── RateLimiter.php      # Control de rate limiting
│   │   ├── Migration.php        # Sistema de migraciones
│   │   ├── Router.php           # Enrutador
│   │   ├── Validator.php        # Validación de datos
│   │   ├── Security.php         # Funciones de seguridad
│   │   ├── ApiResponse.php      # Formato de respuestas
│   │   └── Controllers/
│   │       └── SpotController.php   # Controlador de spots
│   ├── public/
│   │   ├── index.php            # Punto de entrada (API)
│   │   └── uploads/             # Almacenamiento de fotos
│   ├── init-db/
│   │   └── schema.sql           # Esquema de BD
│   ├── migrate.php              # CLI para migraciones
│   ├── .env.example             # Plantilla de configuración
│   ├── SETUP.md                 # Guía de instalación
│   └── PLANETSCALE.md           # Guía de PlanetScale
│
├── frontend/          # Interfaz web
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── img/
│   └── js/
│       ├── main.js              # Lógica principal
│       ├── map.js               # Integración con mapa
│       ├── spots.js             # Gestión de spots
│       ├── ui.js                # Componentes UI
│       └── api.js               # Cliente API
│
└── README.md          # Este archivo
```

## 🚀 Quick Start

### Opción 1: Desarrollo Local (XAMPP)

```powershell
# 1. Clonar repo
cd d:\Escritorio\xampp\htdocs
git clone <repo> spotMap && cd spotMap

# 2. Crear configuración
Copy-Item backend\.env.example backend\.env

# 3. Ejecutar migraciones
php backend\migrate.php up

# 4. Abrir en navegador
Start-Process "http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html"
```

### Opción 2: Desarrollo Remoto (PlanetScale)

Ver [`backend/SETUP.md`](./backend/SETUP.md) — Sección "Instalación Remota".

## 📊 Endpoints API

### Spots

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/spots` | Listar todos los spots |
| POST | `/spots` | Crear nuevo spot |
| GET | `/spots/:id` | Obtener spot por ID |
| DELETE | `/spots/:id` | Eliminar spot |
| POST | `/spots/:id/photo` | Subir foto a spot |

### Diagnóstico

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/ping-db` | Comprobar conexión BD |
| GET | `/db-info` | Info de tablas y recuentos |
| GET | `/api/status` | Estado de salud completo |

## ⚙️ Configuración

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

- [`backend/SETUP.md`](./backend/SETUP.md) — Instalación paso a paso
- [`backend/PLANETSCALE.md`](./backend/PLANETSCALE.md) — Guía PlanetScale
- [`backend/MONITORING.md`](./backend/MONITORING.md) — Sistema de Monitoreo y Alertas
- [`backend/CLI_TOOLS.md`](./backend/CLI_TOOLS.md) — Herramientas de CLI
- [`backend/init-db/schema.sql`](./backend/init-db/schema.sql) — Esquema de BD

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

Ver [`backend/MONITORING.md`](./backend/MONITORING.md) y [`backend/CLI_TOOLS.md`](./backend/CLI_TOOLS.md) para documentación completa.

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

Para producción, ver [`backend/SETUP.md`](./backend/SETUP.md) — Sección "Seguridad".

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

**Última actualización**: Noviembre 2025
