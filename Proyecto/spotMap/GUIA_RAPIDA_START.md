# 🚀 spotMap - Guía Rápida de Inicio

## Estado Actual

✅ **La aplicación está completamente configurada y lista para usar.**

### Lo que se ha hecho (profesionalmente):

1. ✅ Backend con arquitectura modular (Config, Logger, Database, RateLimiter, Migrations)
2. ✅ Sistema de migraciones automáticas
3. ✅ Base de datos MySQL con esquema inicializado
4. ✅ Endpoints profesionales (API status, ping-db, db-info)
5. ✅ Validación y seguridad implementadas
6. ✅ Frontend funcional
7. ✅ Documentación completa

---

## 🎯 Próximos Pasos (para Ti)

### Opción A: Usar XAMPP Local (Recomendado para Empezar)

✅ **Ya está hecho.** Solo abre el navegador:

```
Frontend: http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html

API Status: http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php/api/status
```

Para crear spots:
- Ve al frontend
- Haz clic en el mapa para añadir un spot
- Comprueba en la base de datos con phpMyAdmin

### Opción B: Usar PlanetScale (Para Compartir Entre Casa/Clase)

Si quieres sincronizar la BD entre tu casa y clase:

1. **Crea una cuenta en PlanetScale** (https://planetscale.com) — es gratis.

2. **Crea una base de datos** llamada `spotmap`:
   - Ve a PlanetScale.
   - "Create a new database".
   - Nombre: `spotmap`.

3. **Genera credenciales** (en "Connect" → "Password"):
   - Anota: `host`, `port`, `username`, `password`.

4. **Abre túnel local** (recomendado, más seguro):
   ```powershell
   # Si tienes pscale instalado:
   pscale connect spotmap main --port 3306
   ```
   
   Si no tienes `pscale`, usa acceso directo (menos recomendado pero funciona).

5. **Importa el esquema** (en otra terminal):
   ```powershell
   d:\Escritorio\xampp\mysql\bin\mysql.exe -h 127.0.0.1 -P 3306 -u <USERNAME> -p < backend\init-db\schema.sql
   ```

6. **Edita `backend\.env`** con tus credenciales:
   ```
   DB_HOST=127.0.0.1      # si usas túnel
   DB_PORT=3306           # si usas túnel
   DB_USERNAME=<tu-usuario>
   DB_PASSWORD=<tu-contraseña>
   ```

7. **Ejecuta migraciones**:
   ```powershell
   d:\Escritorio\xampp\php\php.exe backend\migrate.php up
   ```

8. **Ahora en clase**, en otra máquina:
   - Clona el repo.
   - Copia `backend\.env.example` → `backend\.env`.
   - Rellena con las mismas credenciales.
   - Los cambios hechos en casa aparecerán automáticamente en clase.

---

## 📚 Documentación

Lee estos archivos si necesitas más detalles:

- **`README.md`** — Descripción general y arquitectura.
- **`backend/SETUP.md`** — Guía profesional de instalación.
- **`backend/PLANETSCALE.md`** — Guía específica para PlanetScale.

---

## 🧪 Pruebas Rápidas

### Verificar que todo funciona

```powershell
# Verificar instalación
d:\Escritorio\xampp\php\php.exe backend\check.php

# Ver estado de BD
d:\Escritorio\xampp\php\php.exe backend\migrate.php status

# Si necesitas resetear la BD (borra todo):
d:\Escritorio\xampp\php\php.exe backend\migrate.php down
d:\Escritorio\xampp\php\php.exe backend\migrate.php up
```

### Probar endpoints desde PowerShell

```powershell
# Listar todos los spots
Invoke-RestMethod -Uri 'http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php/spots' -Method GET

# Comprobar salud de la API
Invoke-RestMethod -Uri 'http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php/api/status' -Method GET | ConvertTo-Json

# Crear un spot
Invoke-RestMethod -Uri 'http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php/spots' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body (ConvertTo-Json @{
    title = "Mi Primer Spot"
    description = "Un lugar genial"
    lat = 40.7128
    lng = -74.0060
    category = "test"
  })
```

---

## 🔐 Seguridad

**Importante**: 

- El archivo `backend\.env` contiene credenciales — **NO lo subas al repositorio** (ya está en `.gitignore`).
- Si trabajas con PlanetScale, usa contraseñas seguras.
- En producción, configura SSL/TLS (PlanetScale lo hace por defecto).

---

## 🎨 Estructura de Carpetas

```
spotMap/
├── backend/              # API REST (PHP)
│   ├── src/
│   │   ├── Config.php           # Configuración centralizada
│   │   ├── Database.php         # Pool de conexiones
│   │   ├── Logger.php           # Sistema de logs
│   │   ├── RateLimiter.php      # Control de rate limit
│   │   ├── Migration.php        # Sistema de migraciones
│   │   └── Controllers/
│   │       └── SpotController.php
│   ├── public/
│   │   └── index.php            # Punto de entrada
│   ├── migrate.php              # CLI para migraciones
│   ├── check.php                # Verificación de instalación
│   └── .env.example             # Plantilla de config
│
├── frontend/             # Interfaz web
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── main.js, api.js, map.js, etc.
│
├── README.md             # Descripción general
└── setup.ps1             # Script de setup (opcional)
```

---

## 🆘 Si Algo No Funciona

### "No puedo conectar a la BD"

1. Verifica que MySQL está corriendo:
   - Abre XAMPP Control Panel.
   - Arranca MySQL (Action → Start).

2. Comprueba que `backend\.env` existe:
   ```powershell
   Test-Path backend\.env
   ```

3. Ejecuta el check:
   ```powershell
   d:\Escritorio\xampp\php\php.exe backend\check.php
   ```

### "El frontend no carga"

1. Asegúrate que Apache está arrancado.
2. Intenta abrir:
   ```
   http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html
   ```

3. Abre la consola del navegador (F12) para ver errores.

### "Las migraciones fallan"

```powershell
# Ver logs detallados
d:\Escritorio\xampp\php\php.exe backend\migrate.php up 2>&1

# Si todo falla, resetea la BD:
d:\Escritorio\xampp\php\php.exe backend\migrate.php down
d:\Escritorio\xampp\php\php.exe backend\migrate.php up
```

---

## 💡 Tips Profesionales

1. **Usar CLI para todo**: Hay scripts para migraciones, validación, etc. Úsalos desde PowerShell.

2. **Logs**: Comprueba los logs en `D:\Escritorio\xampp\apache\logs\error.log` si algo falla.

3. **Desarrollo iterativo**: 
   - Crea un spot desde el frontend.
   - Verifica en phpMyAdmin.
   - Modifica desde otro dispositivo si usas PlanetScale.

4. **Variables de entorno**: Edita `backend\.env` para cambiar configuración (debug, rate limit, etc.).

---

## ✅ Checklist Final

- [ ] Frontend funciona: http://localhost/.../frontend/index.html
- [ ] API responde: http://localhost/.../backend/public/index.php/api/status
- [ ] Base de datos tiene tabla `spots` (vacía, 0 registros).
- [ ] Puedo crear un spot desde el frontend.
- [ ] (Opcional) Puedo ver los datos en phpMyAdmin.
- [ ] (Opcional) Configuré PlanetScale y puedo acceder desde clase/casa.

---

## 📞 Soporte

Si tienes dudas:

1. Lee `backend/SETUP.md` — tiene soluciones para los problemas más comunes.
2. Ejecuta `backend/check.php` para diagnosticar.
3. Revisa los logs en Apache (`D:\Escritorio\xampp\apache\logs\error.log`).

---

**¡Felicidades! Tu aplicación profesional spotMap está lista.** 🎉

Ahora puede usarla en casa, en clase, y compartir datos entre ubicaciones con PlanetScale.
