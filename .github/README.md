# 🚀 GitHub Actions CI/CD Workflows

Configuración completa de Integración Continua y Despliegue automático para SpotMap.

---

## 📋 Workflows Disponibles

### 1. 🧪 **CI (ci.yml)** - Testing & Build
**Triggered:** En cada push a `main` o `develop`, y PRs

**Qué hace:**
- ✅ **PHPUnit Tests**: Ejecuta 86+ tests del backend
- ✅ **Code Coverage**: Genera reporte de cobertura (Codecov)
- ✅ **PHP CodeSniffer**: Valida estilo de código (PSR-12)
- ✅ **Docker Build**: Construye imagen multi-stage
- ✅ **Frontend Tests**: Jest tests si existen
- ✅ **Lint**: Valida sintaxis PHP

**Servicios de prueba:**
- MySQL 8.0 (autom config)
- Base de datos de test

---

### 2. 🚀 **Deploy (deploy.yml)** - Production Deployment
**Triggered:** En cada push a `main`

**Qué hace:**
- ✅ **Build & Push**: Construye imagen Docker y la sube a GitHub Container Registry
- ✅ **Deploy Staging**: Despliega a servidor staging (si está configurado)
- ✅ **Deploy Production**: Despliega a producción con:
  - 🔄 Backup automático de BD
  - 📦 Docker compose pull & up
  - 🗄️ Migraciones automáticas
- ✅ **Health Checks**: Verifica que todo funcione
- ✅ **Notificaciones**: Slack + Email

**Secretos necesarios:**
```
STAGING_SSH_KEY          SSH key para servidor staging
STAGING_HOST             Host/IP servidor staging
STAGING_USER             Usuario SSH staging
PROD_SSH_KEY             SSH key para producción
PROD_HOST                Host/IP producción
PROD_USER                Usuario SSH producción
SLACK_WEBHOOK            Webhook URL de Slack
EMAIL_SERVER             SMTP server
EMAIL_PORT               Puerto SMTP
EMAIL_USER               Usuario email
EMAIL_PASSWORD           Contraseña email
EMAIL_RECIPIENTS         Emails destinatarios
```

---

### 3. 🔒 **Security (security.yml)** - Análisis de Seguridad
**Triggered:** En cada push, PRs, y diariamente a las 2 AM

**Qué hace:**
- ✅ **Container Scan (Trivy)**: Vulnerabilidades en imagen Docker
- ✅ **Dependency Check**: Análisis de dependencias vulnerables
- ✅ **CodeQL**: SAST avanzado (análisis estático)
- ✅ **PHP Security**: `composer audit` + PHPStan security rules
- ✅ **Secrets Detection (TruffleHog)**: Detecta secretos commiteados
- ✅ **Dockerfile Scan (Hadolint)**: Valida mejores prácticas Dockerfile
- ✅ **License Check**: Verifica licencias de dependencias

**Resultados:**
- 📤 Sube a GitHub Security → Code scanning alerts
- 📊 Genera SARIF reports

---

## 🔧 Configuración

### 1. Crear secrets en GitHub

Ve a: `Settings → Secrets and variables → Actions`

Agrega estos secretos:

```bash
STAGING_SSH_KEY          # cat ~/.ssh/id_ed25519 (private key)
STAGING_HOST             # staging.example.com
STAGING_USER             # ubuntu o tu usuario
PROD_SSH_KEY             # cat ~/.ssh/id_ed25519 (private key)
PROD_HOST                # example.com
PROD_USER                # ubuntu o tu usuario
SLACK_WEBHOOK            # https://hooks.slack.com/services/...
EMAIL_SERVER             # smtp.example.com
EMAIL_PORT               # 587 o 465
EMAIL_USER               # tu@email.com
EMAIL_PASSWORD           # password
EMAIL_RECIPIENTS         # admin@example.com,team@example.com
```

### 2. Configurar acceso a servidores

En tu servidor staging/producción:

```bash
# 1. Generar SSH key (si no tienes)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519

# 2. Copiar public key a servidor
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server

# 3. En GitHub Actions, agregar private key como secret
cat ~/.ssh/id_ed25519  # Copiar contenido completo

# 4. Verificar acceso
ssh -i ~/.ssh/id_ed25519 user@server "echo 'SSH works!'"
```

### 3. Estructura del servidor

En tu servidor, asegúrate de que existe:

```bash
~/spotmap/
  ├── docker-compose.yml
  ├── .env.docker
  ├── Dockerfile
  ├── backend/
  ├── frontend/
  └── backups/  # Para los backups de BD
```

---

## 📊 Matrices de Estado

### CI Workflow
```
┌─────────────────────────────────────────┐
│  Evento (push/PR)                       │
├─────────────────────────────────────────┤
│ ├─ Test (PHPUnit, Jest)                 │
│ ├─ Build (Docker image)                 │
│ ├─ Lint (Code quality)                  │
│ └─ Frontend Tests                       │
└─────────────────────────────────────────┘
```

### Deploy Workflow
```
┌─────────────────────────────────────────┐
│  Push a main (main branch only)        │
├─────────────────────────────────────────┤
│ ├─ Build & Push image                   │
│ ├─ Deploy Staging                       │
│ ├─ Health check Staging                 │
│ ├─ Deploy Production                    │
│ │  ├─ Backup BD                        │
│ │  ├─ Pull image                       │
│ │  ├─ up -d                            │
│ │  └─ Migrations                       │
│ ├─ Health check Production               │
│ └─ Notifications (Slack + Email)        │
└─────────────────────────────────────────┘
```

### Security Workflow
```
┌─────────────────────────────────────────┐
│  Triggers: push/PR/daily 2AM            │
├─────────────────────────────────────────┤
│ ├─ Trivy (Container)                    │
│ ├─ PHP Security (composer audit)        │
│ ├─ Dependency Check                     │
│ ├─ CodeQL (SAST)                        │
│ ├─ TruffleHog (Secrets)                 │
│ ├─ Hadolint (Dockerfile)                │
│ └─ License Check                        │
└─────────────────────────────────────────┘
```

---

## 🎯 Flujo Típico de Deployment

1. **Local Development**
   ```bash
   git commit -m "feat: new feature"
   git push origin feature-branch
   ```

2. **PR Created**
   - ✅ CI runs (tests pass)
   - ✅ Security scan (no vulnerabilities)
   - ✅ Code review

3. **Merge to main**
   ```bash
   git merge feature-branch
   git push origin main
   ```

4. **Automatic Deployment**
   - ✅ Build image
   - ✅ Push to registry
   - ✅ Deploy staging
   - ✅ Deploy production
   - ✅ Send notifications

---

## 📊 Monitoreo

### Ver ejecuciones de workflows
1. Ve a `Actions` en tu repositorio GitHub
2. Selecciona el workflow (CI, Deploy, Security)
3. Click en la ejecución más reciente
4. Expande cada job para ver detalles

### Alertas de seguridad
1. Ve a `Security → Code scanning alerts`
2. Filtra por severity
3. Click en cada alerta para remediar

---

## 🔒 Variables de Entorno

### En `.env.docker` (Development)
```ini
APP_ENV=development
DEBUG=true
LOG_LEVEL=debug
DB_HOST=mysql
DB_NAME=spotmap
```

### En deployment (Production)
Los secrets se pasan vía SSH:
```bash
ssh user@server << 'EOF'
cd ~/spotmap
export PROD_ENV=true
docker-compose up -d
EOF
```

---

## 🚨 Troubleshooting

### CI Tests fallan
```bash
# Ejecutar localmente
cd backend
php vendor/bin/phpunit

# Check logs en GitHub Actions
# Actions → Click en failed job → Expand logs
```

### Deploy falla
```bash
# SSH al servidor y debug
ssh user@server
cd ~/spotmap
docker-compose logs spotmap
docker-compose ps
```

### Docker build muy lento
```yaml
# El workflow usa cache de GHA automáticamente
# Pero puedes mejorar con .dockerignore
# Ver: .dockerignore (ya incluido)
```

### Secretos no funcionan
1. Verifica nombre exacto en GitHub (case-sensitive)
2. Usa `${{ secrets.SECRET_NAME }}` en workflows
3. Los secretos NO se muestran en logs

---

## 📈 Mejoras Futuras

- [ ] Agregar SonarQube para análisis de código
- [ ] Slack notifications con detalles de tests
- [ ] Database migrations automáticas con rollback
- [ ] Performance benchmarking
- [ ] Load testing en staging antes de prod
- [ ] Blue-green deployment
- [ ] Rollback automático si health check falla

---

## 📝 Comandos Útiles

Ver logs localmente:
```bash
# Ejecutar un workflow manualmente
gh workflow run deploy.yml --ref main

# Ver última ejecución
gh run list --workflow=ci.yml --limit=1

# Ver detalles de una ejecución
gh run view <run-id> --log
```

---

**⚠️ CONFIDENCIAL - NO DISTRIBUIR**

Copyright (c) 2025 Antonio Valero. Todos los derechos reservados.
