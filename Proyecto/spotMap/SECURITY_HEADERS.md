# Seguridad: Headers y Políticas

## CORS
- Controlado por `Security::setCORSHeaders()`.
- Por defecto permite origen enviado en `Origin` o `*` en desarrollo.
- Ajustar variable `ALLOWED_ORIGINS` en `.env` si se implementa validación estricta.

## Seguridad HTTP
- `X-Frame-Options: DENY` evita clickjacking.
- `X-Content-Type-Options: nosniff` bloquea sniffing MIME.
- `X-XSS-Protection: 1; mode=block` para navegadores antiguos.
- `Referrer-Policy: strict-origin-when-cross-origin` limita datos de referencia.
- `Permissions-Policy` limita acceso a geolocalización y cámara.

## Content Security Policy (CSP) Dinámica
Valores configurables vía `.env` / entorno (ver claves en `Config.php`):
```
CSP_DEFAULT
CSP_SCRIPT
CSP_STYLE
CSP_IMG
CSP_FONT
CSP_CONNECT
CSP_OBJECT
CSP_BASE
CSP_FRAME_ANCESTORS
```
Ejemplo para permitir Supabase y mapas:
```
CSP_CONNECT="'self' https://ptjkepxsjqyejkynjewc.supabase.co"
CSP_IMG="'self' data: https://unpkg.com https://raw.githubusercontent.com https://maps.gstatic.com"
```

## Rate Limiting
- Implementado en `Security::checkRateLimit()` y `RateLimiter` (config avanzado).
- Headers añadidos:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset` (timestamp UNIX)
- Activar modo avanzado con variables:
```
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=200
RATE_LIMIT_WINDOW=300
```

## Próximos pasos sugeridos
- Añadir nonce CSP para scripts críticos.
- Integrar protección CSRF real (almacenar nonce en sesión).
- Registrar intentos fallidos de autenticación.
- Implementar verificación de firma para uploads.

## Auditoría rápida
Para revisar headers activos:
```bash
curl -I https://tu-dominio.com | grep -E 'Content-Security-Policy|X-Frame-Options|Permissions-Policy'
```

## Notas
- Ajustar CSP al mínimo necesario para reducir superficie de ataque.
- Evitar `unsafe-inline` una vez se externalicen estilos/scripts.
