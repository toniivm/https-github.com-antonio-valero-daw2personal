# Seguridad (Mejoras y Objetivos)

## Estado Actual
- Autenticación JWT mediante Supabase.
- Headers de seguridad (CSP con nonce, X-Frame-Options, RateLimit headers).
- Validación de input y sanitización básica.
- File uploads validados (tipo MIME y tamaño).
- Rate limiting IP simple.

## Pendientes y Recomendados
1. Cifrado en reposo: Usar KMS / cifrado de columnas sensibles (no aplica mucho salvo datos personales básicos).
2. HTTPS estricto: Forzar redirección HTTP->HTTPS en Nginx y HSTS (Strict-Transport-Security).
3. Auditoría: Tabla de auditoría para acciones críticas (moderación, borrado spots) con timestamp y user_id.
4. Protección CSRF: Para rutas mutables si se introduce auth vía cookies (actualmente Bearer tokens => menos crítico).
5. Escaneos SAST/DAST: Integrar herramientas (Semgrep, OWASP ZAP) en CI.
6. Política de contraseñas: Delegada a Supabase (configurar requisitos en panel).
7. Logs firmados: Firma hash de logs críticos para detectar manipulación.
8. Controles de subida: Integrar antivirus (ClamAV) para imágenes si escalado.
9. Alertas: Notificar a administrador en picos de reportes o errores 5xx.

## Endpoints a asegurar más adelante
- /api/admin/*: Requiere verificación de rol robusta.
- /api/account/delete: Futuro endpoint eliminación total.
- /api/export: Futuro export de datos personales.

## Buenas Prácticas Operativas
- Rotar claves (SERVICE_KEY) cada 90 días.
- Separar roles: Minimizar uso de SERVICE_KEY en frontend; usar ANON_KEY.
- Monitorear tokens abusivos y revocar manualmente en Supabase.

## Hardening Futuro
- Conteo de intentos de login (si no gestionado por Supabase).
- Limitar request body size en Nginx.
- Implementar content sniffing headers (X-Content-Type-Options: nosniff).
- Añadir Referrer-Policy y Permissions-Policy más restrictivo.

Última actualización: 2025-11-18.
