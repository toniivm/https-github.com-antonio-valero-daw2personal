# SpotMap en XAMPP (sin Docker)

## 1. Estructura recomendada
El proyecto ya está dentro de `xampp/htdocs/spotMap/`.

- Frontend: `htdocs/spotMap/frontend/` (acceder: http://localhost/spotMap/frontend/)
- Backend API: `htdocs/spotMap/backend/public/` (acceder: http://localhost/spotMap/backend/public/api.php?health)

Para servir el frontend directamente en raíz (`/spotMap/`), puedes crear un `index.php` simple en la carpeta raíz que haga redirect a `frontend/index.html`.

## 2. Configuración .env
Editar `backend/.env`:
```
USE_SUPABASE=true
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=TU_SERVICE_KEY_O_ANON_KEY
APP_ENV=development
APP_DEBUG=true
```
IMPORTANTE: La clase `SupabaseClient` espera `SUPABASE_KEY` (no ANON KEY variable separada). Puedes reutilizar la service key (segura) sólo en backend privado.

Si usas únicamente Supabase, los valores MySQL pueden quedar sin uso.

## 3. Extensiones PHP necesarias
- cURL (incluida en XAMPP normalmente) → requerida por `SupabaseClient`.
- JSON (incluida).
- Si decides usar MySQL local: habilitar `pdo_mysql` en `php.ini`.
- No necesitas PostgreSQL porque el acceso a Supabase es vía REST (HTTP), no driver nativo.

Verificar en `phpinfo()` que están activas.

## 4. VirtualHost opcional (más limpio)
En `apache/conf/extra/httpd-vhosts.conf` añadir:
```
<VirtualHost *:80>
  ServerName spotmap.local
  DocumentRoot "C:/xampp/htdocs/spotMap/frontend"
  <Directory "C:/xampp/htdocs/spotMap/frontend">
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
```
Luego añadir al hosts de Windows:
```
C:\Windows\System32\drivers\etc\hosts
127.0.0.1 spotmap.local
```
Acceso: http://spotmap.local/

Para API mantener rutas: http://spotmap.local/../backend/public/api.php?action=spots
(Alternativamente montar un alias Apache para `/api`).

## 5. Alias Apache para API (más limpio)
En `httpd.conf` añadir (o en VirtualHost):
```
Alias /api "C:/xampp/htdocs/spotMap/backend/public"
<Directory "C:/xampp/htdocs/spotMap/backend/public">
  AllowOverride All
  Require all granted
</Directory>
```
Acceso health: http://spotmap.local/api/api.php?health
Acceso listado spots: http://spotmap.local/api/api.php?action=spots

## 6. .htaccess para SPA (frontend)
Crear `frontend/.htaccess` si no existe:
```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . index.html [L]
</IfModule>
```
Asegúrate de activar `mod_rewrite` (en XAMPP suele venir activo). Si no: en `httpd.conf` descomenta `LoadModule rewrite_module modules/mod_rewrite.so`.

## 7. Health Checks manuales
```
# API básica
http://localhost/spotMap/backend/public/api.php?health

# Estado extendido
http://localhost/spotMap/backend/public/index.php/api/status (también soportado)
```
Respuestas esperadas JSON con status ok / healthy.

## 8. Permisos uploads (Windows)
Asegúrate de que existe: `backend/public/uploads/spots/`
Si no:
```
mkdir backend\public\uploads\spots
```

## 9. Depuración rápida
Coloca temporalmente:
```
var_dump($_SERVER);
```
en `backend/public/api.php` para revisar ruta / headers (quitar en producción).

## 10. Evitar problemas CORS
Si frontend y backend comparten origen (`localhost` mismo puerto), CORS no será un problema. Si usas distinto puerto (ej: frontend por Vite):
- Ajustar `Security::setCORSHeaders()` o `ALLOWED_ORIGINS` en `.env`.

## 11. Logs sencillos
Se generan en `backend/logs/` (si la clase `Security::logAccess` se usa). Asegúrate de que Apache puede escribir (Windows normalmente sí).

## 12. Tests backend con XAMPP
Abrir terminal y:
```
cd C:\xampp\htdocs\spotMap\backend
composer install
vendor\bin\phpunit
```
(Instala Composer global si no lo tienes: https://getcomposer.org/)

## 13. Uso con Supabase
RLS Policies ya deben estar en tu proyecto. Asegúrate de que la tabla `spots` existe y coincide con los campos usados (tags, image_path, etc). Para crear desde SQL Editor:
```
create table if not exists spots (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  lat double precision not null,
  lng double precision not null,
  category text,
  tags jsonb,
  image_path text,
  created_at timestamptz default now()
);
```

## 14. Producción alternativa
Si tu hosting sólo ofrece Apache + PHP (sin Docker): sube carpetas `frontend/` y `backend/`, asegura `.env` configurado con service key y aplica `.htaccess` indicado. Considera ofuscar claves sensibles y usar solo anon key si los endpoints no requieren privilegios elevados.

## 15. Checklist final
- [ ] `backend/.env` con `SUPABASE_URL` y `SUPABASE_KEY`.
- [ ] Acceso a http://localhost/spotMap/frontend/index.html funciona.
- [ ] Health endpoint responde 200.
- [ ] Tabla `spots` creada en Supabase.
- [ ] mod_rewrite activo.
- [ ] CORS sin errores en consola.

## 16. Próximas mejoras (sin Docker)
- Añadir ETag headers a respuestas de spots para cache navegador.
- Implementar minificación CSS/JS (puede hacerse con un build tool externo).
- Añadir nonce script a index.html (leer `X-CSP-Nonce` mediante fetch inicial si integras backend en mismo dominio).
