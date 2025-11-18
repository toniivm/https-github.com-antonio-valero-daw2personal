# Autenticación Supabase en SpotMap

## Flujo
- Frontend obtiene JWT tras login con Supabase Auth (client JS).
- Envía `Authorization: Bearer <jwt>` en peticiones mutadoras (crear, eliminar, subir foto).
- Backend valida token llamando a `https://<PROJECT>.supabase.co/auth/v1/user`.

## Variables .env requeridas
```
SUPABASE_URL=https://<PROJECT>.supabase.co
SUPABASE_ANON_KEY=PUBLIC_ANON_KEY
SUPABASE_SERVICE_KEY=SERVICE_ROLE_KEY   # con más privilegios (no exponer en frontend)
```
Si defines SERVICE_KEY se usará para las operaciones backend; evita exponerla en el frontend.

## Endpoints protegidos
- POST /spots (crear)
- DELETE /spots?id=ID (eliminar)
- POST /spots?id=ID&sub=photo (subir foto)

## Ejemplo Fetch (frontend)
```js
const token = sessionStorage.getItem('supabase_jwt'); // o supabase.auth.getSession()
fetch('/backend/public/api.php?action=spots', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Nuevo spot',
    lat: 40.4,
    lng: -3.7
  })
});
```

## Manejo de errores
- 401 si token ausente o inválido.
- 422 validación de campos.
- 429 rate limit excedido.

## Extender
- Cachear respuesta del usuario (sub/jti) por 60s para evitar llamada repetida.
- Verificar roles reclamados en JWT (`app_metadata` / `role`).
- Añadir tabla `user_spots` si necesitas ownership.

## Nota Seguridad
- No procesar tokens si `USE_SUPABASE=false` (entorno local sin auth).
- Evitar registrar el token completo en logs.
