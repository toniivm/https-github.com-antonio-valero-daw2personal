# SpotMap - Monitoring & Alertas Avanzadas

## 🔍 Sistema de Monitoreo en Tiempo Real

Este documento describe el sistema completo de monitoring, logging y alertas implementado en SpotMap para producción.

---

## 📊 Componentes del Sistema

### 1. **AdvancedLogger** (`backend/src/AdvancedLogger.php`)
Sistema centralizado de logging con múltiples niveles y destinos.

#### Niveles de Log
```
DEBUG    → Información detallada para debugging
INFO     → Eventos informativos generales
WARNING  → Advertencias que requieren atención
ERROR    → Errores que necesitan acción
CRITICAL → Errores críticos del sistema
SECURITY → Eventos de seguridad
```

#### Características
- ✅ Múltiples destinos (archivo, BD, webhook)
- ✅ Rotación automática de logs (10MB)
- ✅ Sanitización de datos sensibles
- ✅ Request ID para trazabilidad
- ✅ Backtrace automático
- ✅ Filtrado de patrones sensibles (passwords, tokens, etc.)

#### Uso
```php
use SpotMap\AdvancedLogger;

$logger = AdvancedLogger::getInstance();

// Log levels
$logger->debug('Debugging info', ['user_id' => 123]);
$logger->info('User logged in');
$logger->warning('High memory usage');
$logger->error('Database connection failed');
$logger->critical('System failure');
$logger->security('Suspicious login attempt', ['ip' => '192.168.1.1']);
```

### 2. **PerformanceMonitor** (`backend/src/PerformanceMonitor.php`)
Monitoreo de rendimiento y métricas de aplicación.

#### Métricas
- Tiempo total de ejecución
- Uso de memoria (actual, pico, incremento)
- Marcadores de tiempo personalizados
- Mediciones entre puntos

#### Uso
```php
use SpotMap\PerformanceMonitor;

PerformanceMonitor::mark('database_start');
// ... database operations
PerformanceMonitor::mark('database_end');

$measure = PerformanceMonitor::measure('database_start', 'database_end');
// ['time_ms' => 234.56, 'memory_kb' => 1024]
```

### 3. **ErrorTracker** (`backend/src/ErrorTracker.php`)
Captura y reporte automático de errores.

#### Manejo
- Errores de PHP
- Excepciones
- Errores fatales
- Integración con servicios externos

#### Ejemplo
```php
use SpotMap\ErrorTracker;

try {
    // Code that might fail
} catch (Exception $e) {
    ErrorTracker::reportError($e, ['context' => 'api_call']);
}
```

### 4. **MonitoringController** (`backend/src/Controllers/MonitoringController.php`)
API REST para acceder a datos de monitoreo.

#### Endpoints

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/monitoring/logs` | GET | Admin | Últimos logs |
| `/api/monitoring/metrics` | GET | Admin | Métricas de uso |
| `/api/monitoring/alerts` | GET | Admin | Alertas generadas |
| `/api/monitoring/health` | GET | Público | Estado de salud |

#### Parámetros
```
GET /api/monitoring/logs?limit=100&level=ERROR
GET /api/monitoring/metrics
GET /api/monitoring/alerts?limit=50
GET /api/monitoring/health
```

### 5. **Monitoring Dashboard** (`backend/public/monitoring.html`)
Interfaz web para visualizar monitoreo en tiempo real.

#### Características
- 📊 Métricas en vivo
- 📈 Estado de sistema
- 📋 Logs en tiempo real
- 🚨 Alertas automáticas
- 💾 Uso de memoria y BD

---

## ⚙️ Configuración

### Variables de Entorno (`.env.production`)

```ini
# Logging
LOG_LEVEL=INFO
LOG_TO_DATABASE=false
LOG_TO_WEBHOOK=false

# Alertas
ALERT_EMAIL=admin@spotmap.local
ALERT_WEBHOOK_URL=https://hooks.slack.com/...
ALERT_THRESHOLD_ERROR_RATE=0.05

# Monitoreo
ADMIN_API_TOKEN=your_secret_token_here
MONITORING_ENABLED=true

# Error Tracking (opcional)
ERROR_TRACKING_SERVICE=https://sentry.io/...
APP_DEBUG=false
```

### Permisos de Archivos

```bash
# Crear directorio de logs
mkdir -p /var/www/spotmap/backend/logs
chmod 775 /var/www/spotmap/backend/logs

# Asignar propietario
chown -R www-data:www-data /var/www/spotmap/backend/logs
```

---

## 📈 Estructura de Logs

### Archivo: `logs/application.log` (JSON)

```json
{
  "timestamp": "2025-12-09 14:23:45.1234",
  "level": "ERROR",
  "message": "Database connection failed",
  "context": {
    "errno": "ECONNREFUSED",
    "host": "localhost",
    "port": 5432
  },
  "file": "src/Database.php",
  "line": 42,
  "trace": [
    {
      "file": "src/Database.php",
      "line": 42,
      "function": "connect"
    }
  ],
  "request_id": "req_6758a1b3c2f34.12345",
  "ip": "127.0.0.1",
  "user_id": null
}
```

### Archivo: `logs/metrics.json`

```json
[
  {
    "timestamp": 1733766225.4567,
    "endpoint": "/api/spots",
    "method": "GET",
    "status": 200,
    "response_time_ms": 45.23,
    "memory_mb": 12.5,
    "ip": "127.0.0.1"
  }
]
```

### Archivo: `logs/alerts.log`

```json
{
  "timestamp": "2025-12-09 14:23:45",
  "level": "CRITICAL",
  "message": "Database connection failed",
  "context": {
    "errno": "ECONNREFUSED"
  }
}
```

---

## 🚨 Sistema de Alertas

### Criterios de Alerta

| Evento | Acción |
|--------|--------|
| **Error crítico** | Email + Webhook |
| **Evento de seguridad** | Email + Webhook + Log |
| **Tasa de error > 5%** | Email + Dashboard |
| **Memoria > 80%** | Dashboard |
| **BD desconectada** | Email + Webhook |
| **Multiples fallos de autenticación** | Email + IP blocking |

### Configurar Alertas por Email

```ini
# .env.production
ALERT_EMAIL=your-email@example.com
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Configurar Alertas por Webhook (Slack)

1. Crear Incoming Webhook en Slack
2. Copiar URL
3. Agregar a `.env.production`:
```ini
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_TEAM_ID/YOUR_BOT_ID/YOUR_SECRET_TOKEN
```

---

## 🔐 Dashboard de Monitoreo

### Acceso

```
URL: https://spotmap.local/monitoring.html
Token: Variable ADMIN_API_TOKEN
```

### Autenticación

```javascript
// En monitoring.html
const API_TOKEN = 'your_admin_api_token';

// O en header HTTP
Authorization: Bearer your_admin_api_token
```

### Métricas Mostradas

- **Status**: Estado del sistema
- **Total Requests**: Peticiones totales
- **Avg Response Time**: Tiempo promedio de respuesta
- **Error Rate**: Porcentaje de errores
- **Memory Usage**: Uso de memoria
- **Database Health**: Estado de la BD

---

## 📊 Análisis de Logs

### Ver logs en vivo

```bash
# Ver últimos 100 logs
tail -100 /var/www/spotmap/backend/logs/application.log | jq '.'

# Buscar errores
grep '"level":"ERROR"' /var/www/spotmap/backend/logs/application.log | jq '.message'

# Filtrar por usuario
grep '"user_id":123' /var/www/spotmap/backend/logs/application.log

# Filtrar por IP
grep '"ip":"192.168.1.1"' /var/www/spotmap/backend/logs/application.log
```

### Analizar métricas

```bash
# Ver métricas guardadas
jq '.[].response_time_ms | add / length' /var/www/spotmap/backend/logs/metrics.json

# Contar por status
jq 'group_by(.status) | map({status: .[0].status, count: length})' /var/www/spotmap/backend/logs/metrics.json
```

---

## 🛡️ Seguridad del Logging

### Datos Sanitizados Automáticamente

- ✅ Contraseñas
- ✅ Tokens API
- ✅ Números de tarjeta de crédito
- ✅ SSN (Números de seguro social)
- ✅ Claves privadas
- ✅ Headers de Authorization

### Protección de Archivos

```bash
# Establecer permisos
chmod 640 /var/www/spotmap/backend/logs/*.log
chmod 640 /var/www/spotmap/backend/logs/*.json

# Limitar acceso
chown root:www-data /var/www/spotmap/backend/logs
```

---

## 📱 Notificaciones

### Email Alert Ejemplo

```
To: admin@spotmap.local
Subject: 🚨 SpotMap Alert: CRITICAL

Critical Alert!

Message: Database connection failed
Time: 2025-12-09 14:23:45
Context: {
  "errno": "ECONNREFUSED",
  "host": "localhost"
}
```

### Slack Alert Ejemplo

```
Channel: #alerts
Message: 
🚨 SpotMap CRITICAL Alert
Database connection failed
Time: 2025-12-09 14:23:45
Details: ECONNREFUSED on localhost
```

---

## 🔧 Troubleshooting

### No se crean logs

```bash
# Verificar permisos
ls -la /var/www/spotmap/backend/logs

# Crear directorio si no existe
mkdir -p /var/www/spotmap/backend/logs
chmod 755 /var/www/spotmap/backend/logs

# Verificar en php.ini
php -i | grep error_log
```

### Alertas no se envían

1. Verificar `.env.production`:
```bash
cat .env.production | grep ALERT_
```

2. Probar email:
```bash
php -r "mail('test@example.com', 'Test', 'Test message');"
```

3. Verificar webhook:
```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"text":"Test"}' \
  https://hooks.slack.com/...
```

---

## 📈 Rotación de Logs

Logs se rotan automáticamente cuando alcanzan 10MB:
- `application.log` → `application.log.1`
- `application.log.1` → `application.log.2`
- Se guardan máximo 10 archivos rotados

Para rotación manual en cron:

```bash
# /etc/cron.daily/spotmap-logs
#!/bin/bash
find /var/www/spotmap/backend/logs -name "*.log.*" -mtime +7 -delete
find /var/www/spotmap/backend/logs -name "*.json" -mtime +7 -delete
```

---

## ✅ Checklist de Monitoring

- [ ] `.env.production` configurado
- [ ] Directorio `/logs` creado con permisos 755
- [ ] ADMIN_API_TOKEN definido
- [ ] ALERT_EMAIL configurado
- [ ] Webhook Slack configurado (opcional)
- [ ] Dashboard accesible en `/monitoring.html`
- [ ] Logs escribiéndose correctamente
- [ ] Alertas enviándose
- [ ] Métricas recolectándose

---

**⚠️ CONFIDENCIAL - NO COMPARTIR**

Copyright (c) 2025 Antonio Valero. Todos los derechos reservados.
