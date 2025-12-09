# ⚡ GitHub Actions - Guía Rápida

## 🚀 Quick Start (5 minutos)

### 1️⃣ Configurar Secretos en GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions

**Secretos mínimos necesarios para empezar:**

```
SLACK_WEBHOOK    https://hooks.slack.com/services/YOUR/WEBHOOK
EMAIL_SERVER     smtp.gmail.com
EMAIL_PORT       587
EMAIL_USER       tu@gmail.com
EMAIL_PASSWORD   app-password
EMAIL_RECIPIENTS admin@example.com
```

Sin estos, los workflows corren pero las notificaciones fallan (no-critical).

### 2️⃣ Para Deployment (Opcional)

Si quieres deploys automáticos:

```
STAGING_SSH_KEY     (private key content)
STAGING_HOST        staging.example.com
STAGING_USER        ubuntu

PROD_SSH_KEY        (private key content)
PROD_HOST           example.com
PROD_USER           ubuntu
```

**Cómo obtener SSH keys:**
```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_actions
cat ~/.ssh/github_actions          # → PROD_SSH_KEY (secret)
cat ~/.ssh/github_actions.pub      # → Agregar a ~/.ssh/authorized_keys en server
```

---

## 📊 Ver Workflows en GitHub

1. Ve a tu repositorio
2. Click en **Actions** (pestaña superior)
3. Selecciona el workflow (CI, Deploy, Security)
4. Ves historial de ejecuciones

---

## 🎯 Qué Sucede Automáticamente

### ✅ En cada PUSH a `main`:
```
1. CI.yml inicia
   ├─ PHPUnit tests (backend)
   ├─ Jest tests (frontend)
   ├─ Code quality checks
   └─ Docker build

2. Si CI ✅ → Deploy.yml inicia
   ├─ Push image a registry
   ├─ Deploy a staging
   ├─ Deploy a producción
   └─ Notificaciones
```

### ✅ En cada PULL REQUEST:
```
1. CI.yml inicia
   ├─ Tests deben pasar
   ├─ No hay secretos
   └─ Reporte de coverage
```

### ✅ Diariamente a las 2 AM:
```
1. Security.yml inicia
   ├─ Scan vulnerabilidades
   ├─ Análisis de dependencias
   └─ Detección de secretos
```

---

## 🔍 Debugging

### Ver logs de un workflow
```bash
# En GitHub UI:
Actions → Click en workflow fallido → Expand logs

# Por terminal (si tienes gh CLI):
gh run list --workflow=ci.yml
gh run view <RUN_ID> --log
```

### El CI falla en tests
```bash
# Reproduce localmente
cd backend
php vendor/bin/phpunit

# Compara con logs de GitHub
```

### El deploy falla
```bash
# SSH al servidor
ssh user@server
cd ~/spotmap
docker-compose logs spotmap

# O ve los logs del workflow en GitHub
```

---

## 📝 Ejemplos de Uso

### Hacer un cambio y deployar
```bash
# Local
git checkout -b feature/new-feature
# ... haces cambios ...
git add .
git commit -m "feat: new feature"
git push origin feature/new-feature

# En GitHub: Abre PR
# CI corre automáticamente ✅

# Review y merge
git checkout main
git merge feature/new-feature
git push origin main

# 🚀 DEPLOY AUTOMÁTICO AL SERVER!
```

### Forzar run de un workflow
```bash
gh workflow run ci.yml --ref main
```

### Ver status de deployments
```bash
# En GitHub UI:
Settings → Deployments

# Ves historial de todos los deploys
```

---

## ⚙️ Customizar Workflows

Edita los archivos en `.github/workflows/`:

```yaml
# Cambiar triggers
on:
  push:
    branches: [ main, develop, staging ]

# Cambiar condiciones
if: github.event_name == 'push'

# Cambiar dependencias entre jobs
jobs:
  job-a:
    runs-on: ubuntu-latest
  job-b:
    needs: job-a  # job-b espera a job-a
```

---

## 🆘 Troubleshooting Común

| Problema | Solución |
|----------|----------|
| Tests fallan en CI pero pasan localmente | Diferencia de BD: asegúrate de usar MySQL test |
| Docker build es muy lento | Cache está activado, segunda vez más rápido |
| Deploy falla sin logs útiles | Revisa SSH keys en GitHub secrets |
| Secretos no se ven en logs | ✅ Correcto, GitHub los oculta automáticamente |
| Workflow no se ejecuta | Asegúrate que branch sea `main` para deploy |

---

## 📊 Estado de Workflows

Después de completar la configuración, verás:

```
✅ CI    - Tests & Build
✅ Deploy - Production (cuando haya secretos SSH)
✅ Security - Daily scans
```

En la pestaña **Actions** de GitHub.

---

## 🎓 Próximas Mejoras

- [ ] Agregar SonarQube para code quality
- [ ] Database migration testing
- [ ] Load testing en staging
- [ ] Rollback automático si falla health check
- [ ] Blue-green deployment

---

**💡 Tip:** Los workflows no requieren ninguna acción manual. 
Solo `git push` y se ejecutan automáticamente. ¡Magia! ✨

