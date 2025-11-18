# Docker en Windows (WSL2 + Optimización)

## 1. Instalar Docker Desktop
1. Descargar: https://www.docker.com/products/docker-desktop/
2. Activar WSL2: Ejecutar en PowerShell como administrador:
```powershell
wsl --install
```
3. Reiniciar y abrir Docker Desktop. Confirmar que el motor arranca.

## 2. Verificación rápida
```powershell
docker version
docker compose version
```
Si falla: Ajustar Settings → Resources → WSL Integration (activar para la distro). 

## 3. Clonar/Ubicar proyecto en disco accesible por WSL
Recomendado mover el proyecto dentro de: `\\wsl$\Ubuntu\home\<usuario>\spotMap` para evitar overhead de I/O en \Users.

docker compose build
docker compose up -d spotmap-web
docker compose ps
docker compose logs -f --tail=100 spotmap-web
## 4. Variables de entorno
Crear `.env` desde `.env.example` y completar claves:
```powershell
Copy-Item .env.example .env
notepad .env
```

Claves mínimas producción:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (service-role)
- `SUPABASE_ANON_KEY`
- `CORS_ORIGINS` (dominio frontend)
- `METRICS_ENABLED=true`
- `OWNERSHIP_ENABLED=true`

## 5. Levantar servicios
```powershell
cd spotMap
# Build multi-stage
docker compose build
# Arrancar API (perfil base)
docker compose up -d spotmap-web
# Estado
docker compose ps
# Logs seguimiento
docker compose logs -f --tail=100 spotmap-web
```

## 6. Health & Métricas
```powershell
Invoke-RestMethod http://localhost:8080/api/status
Invoke-RestMethod http://localhost:8080/api/metrics
Invoke-WebRequest http://localhost:8080/api/metrics/prometheus | Select-Object StatusCode
```

## 7. Reconstruir limpio
```powershell
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## 8. Permisos uploads (solo si errores 403/500)
```powershell
docker compose exec spotmap-web bash -c "chown -R www-data:www-data /var/www/html/backend/public/uploads && chmod -R 755 /var/www/html/backend/public/uploads"
```

## 9. Entrar al contenedor
```powershell
docker compose exec spotmap-web bash
ls -lah backend/vendor | head
exit
```

## 10. Limpieza imágenes y caché
```powershell
docker image prune -f
docker builder prune -f
docker system df
```

## 11. Problemas comunes
- Error de puertos: Cambiar `8080:80` en `docker-compose.yml` a `8081:80`.
- Falta vendor: Borrar imagen y reconstruir (`docker compose build --no-cache`).
- Variables .env no cargan: Confirmar montaje `backend/.env` en compose.

## 12. Producción (perfil con Nginx reverse proxy)
```powershell
docker compose --profile production up -d
```
Verificar nuevamente:
```powershell
Invoke-RestMethod http://localhost:8080/api/status
```

## 13. Seguridad rápida
- Mantener `APP_DEBUG=false`.
- No almacenar keys privadas en imágenes.
- Rotar tokens Supabase si se sospecha exposición.

## 14. Performance tips
- Usar WSL2 path para proyecto.
- Evitar montar muchas carpetas dinámicas (solo `uploads` y configs).
- Multi-stage Dockerfile (ya aplicado) reduce tamaño y superficie de ataque.
- Activar caché warm al inicio (ya en bootstrap) y CDN frontal.

## 15. Próximos pasos
- Escaneo básico: `docker scan spotmap-api`.
- Añadir integración CI para `docker build` + `docker push`.
- Añadir endpoint export cuenta (ya implementado) a flujos privacidad.
- Configurar Prometheus scrape de `/api/metrics/prometheus`.
