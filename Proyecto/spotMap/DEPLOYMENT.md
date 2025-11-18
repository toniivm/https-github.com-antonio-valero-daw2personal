# SpotMap - Deployment Guide

## Requisitos
- Docker y Docker Compose instalados
- PowerShell 5.1+ (Windows) o bash (Linux/Mac)
- Git (opcional, para CI/CD)

## Configuración Inicial

### 1. Configurar variables de entorno
```powershell
# Copiar ejemplo de .env
Copy-Item .env.example backend/.env

# Editar backend/.env con tus credenciales
notepad backend/.env
```

### 2. Configurar Supabase
```powershell
# Copiar ejemplo de supabaseConfig
Copy-Item config/supabaseConfig.example.js frontend/js/supabaseConfig.js

# Editar con tus credenciales de Supabase
notepad frontend/js/supabaseConfig.js
```

### 3. Ejecutar SQL en Supabase
1. Ir a Supabase Dashboard → SQL Editor
2. Ejecutar el contenido de `SQL_RLS_BASE.sql`
3. Crear bucket 'public' en Storage

## Despliegue Local (Desarrollo)

### Opción 1: Script automatizado
```powershell
# Despliegue en entorno dev
.\deploy.ps1 -Environment dev

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Opción 2: Manual
```powershell
# Build
docker-compose build

# Iniciar
docker-compose up -d spotmap-web

# Health check
Invoke-WebRequest http://localhost:8080/backend/public/api.php?health

# Acceder
Start-Process http://localhost:8080
```

## Despliegue Producción

### Con Nginx (recomendado)
```powershell
# Configurar certificados SSL
New-Item -ItemType Directory -Path nginx/ssl
# Copiar tus certificados a nginx/ssl/

# Editar nginx.conf para configurar dominio
notepad nginx.conf

# Desplegar con Nginx
.\deploy.ps1 -Environment production
```

Acceso: https://tudominio.com

### Sin Nginx
```powershell
# Solo contenedor web
docker-compose up -d spotmap-web
```

Acceso: http://servidor:8080

## Rollback
```powershell
# Restaurar versión anterior
.\deploy.ps1 -Rollback
```

## Comandos Útiles

### Ver estado
```powershell
docker-compose ps
```

### Ver logs
```powershell
# Todos los servicios
docker-compose logs -f

# Solo web
docker-compose logs -f spotmap-web

# Solo nginx
docker-compose logs -f spotmap-nginx
```

### Reiniciar servicio
```powershell
docker-compose restart spotmap-web
```

### Limpiar y reconstruir
```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Ejecutar comandos en el contenedor
```powershell
# Shell interactivo
docker-compose exec spotmap-web bash

# Instalar dependencias PHP
docker-compose exec spotmap-web composer install

# Ver logs de PHP
docker-compose exec spotmap-web tail -f /var/log/apache2/error.log
```

## Health Checks

### API Health
```powershell
Invoke-WebRequest http://localhost:8080/backend/public/api.php?health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "service": "spotmap-api",
  "version": "1.2"
}
```

### Docker Health
```powershell
docker inspect --format='{{.State.Health.Status}}' spotmap-spotmap-web-1
```

## Troubleshooting

### Puerto 8080 ya en uso
```powershell
# Editar docker-compose.yml, cambiar puerto
# ports: - "8081:80"
```

### Permisos de uploads
```powershell
docker-compose exec spotmap-web chown -R www-data:www-data /var/www/html/backend/public/uploads
docker-compose exec spotmap-web chmod -R 755 /var/www/html/backend/public/uploads
```

### .env no se carga
```powershell
# Verificar que existe
Test-Path backend/.env

# Verificar montaje en contenedor
docker-compose exec spotmap-web cat /var/www/html/backend/.env
```

### Error de Supabase
```powershell
# Verificar supabaseConfig.js
Test-Path frontend/js/supabaseConfig.js

# Ver en navegador: Console → Network → filtrar "supabase"
```

### Reiniciar desde cero
```powershell
docker-compose down -v
Remove-Item -Recurse -Force backend/vendor
.\deploy.ps1 -Environment dev
```

## CI/CD (GitHub Actions)

Ejemplo de workflow:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create .env
        run: |
          echo "SUPABASE_URL=${{ secrets.SUPABASE_URL }}" > backend/.env
          echo "SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}" >> backend/.env
      
      - name: Build and deploy
        run: |
          docker-compose build
          docker-compose up -d
      
      - name: Health check
        run: |
          sleep 10
          curl -f http://localhost:8080/backend/public/api.php?health
```

## Seguridad

### Producción checklist
- [ ] SSL/TLS configurado (certificados válidos)
- [ ] `APP_DEBUG=false` en .env
- [ ] Credenciales en secrets, no en código
- [ ] RLS policies habilitadas en Supabase
- [ ] Rate limiting activo (Nginx)
- [ ] Headers de seguridad configurados
- [ ] Logs monitoreados
- [ ] Backups automáticos configurados

### Actualizar dependencias
```powershell
# PHP
docker-compose exec spotmap-web composer update

# JavaScript (si usas npm)
npm update
```

## Monitorización

### Logs en tiempo real
```powershell
# Aplicación
docker-compose logs -f --tail=100 spotmap-web

# Nginx
docker-compose logs -f --tail=100 spotmap-nginx
```

### Métricas
- Health endpoint: `/backend/public/api.php?health`
- Docker stats: `docker stats spotmap-spotmap-web-1`
- Supabase Dashboard: métricas de DB y Storage

## Backup

### Manual
```powershell
# Backup de uploads
Compress-Archive -Path backend/public/uploads -DestinationPath "backup-uploads-$(Get-Date -Format 'yyyyMMdd').zip"

# Backup de config
Copy-Item backend/.env "backup-env-$(Get-Date -Format 'yyyyMMdd').txt"
```

### Automatizado (ejemplo)
```powershell
# Script de backup diario (Windows Task Scheduler)
$date = Get-Date -Format 'yyyyMMdd'
docker-compose exec -T spotmap-web tar czf - /var/www/html/backend/public/uploads > "backup-$date.tar.gz"
```

## Escalado

### Múltiples instancias
```yaml
# docker-compose.yml
services:
  spotmap-web:
    deploy:
      replicas: 3
```

### Load balancer
Usar Nginx como LB delante de múltiples contenedores web.

## Soporte
- Documentación: Ver archivos `*.md` en el proyecto
- Logs: `docker-compose logs -f`
- Issues: Crear issue en el repositorio
