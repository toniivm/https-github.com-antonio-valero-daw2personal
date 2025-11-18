# Privacidad y Cumplimiento (RGPD / LOPDGDD)

## Datos Personales Recogidos
- Correo electrónico (identificación y recuperación de cuenta)
- Nombre de usuario (pseudónimo público)
- Metadatos de interacción (favoritos, comentarios, valoraciones)
- Información de spots creada por el usuario (contenido público)

## Principios
1. Minimización: Solo datos estrictamente necesarios para la funcionalidad.
2. Transparencia: Políticas claras accesibles desde la interfaz.
3. Seguridad: Transmisión cifrada (HTTPS), claves protegidas.
4. Control del usuario: Posibilidad de eliminar su cuenta y datos asociados.

## Derechos del Usuario
- Acceso: Solicitar copia de sus datos almacenados.
- Rectificación: Modificar datos incorrectos (perfil, spots propios).
- Supresión: Eliminar cuenta y datos asociados (favoritos, comentarios, valoraciones).
- Portabilidad: Exportación JSON de interacciones bajo petición.
- Oposición / Limitación: Solicitar suspensión temporal de tratamiento.

## Retención
- Datos de cuenta: Hasta solicitud de eliminación.
- Contenido generado (spots, comentarios): Persisten salvo borrado por usuario o moderación.
- Logs técnicos: Rotación cada 30 días (configurable) para análisis de seguridad.

## Seguridad
- Claves y tokens almacenados en variables de entorno.
- Tokens JWT verificados contra Supabase; no se guardan en la base propia.
- Rate limiting para mitigar abuso.

## Eliminación de Cuenta (Flujo)
1. Usuario confirma en interfaz.
2. Se invoca endpoint /api/account/delete (pendiente de implementación). 
3. Se borran registros asociados en tablas de interacción (favoritos, comentarios, ratings, reports del usuario).
4. Se anonimizan spots si aún deben permanecer (opcional, si son útiles a la comunidad) o se eliminan si OWNERSHIP_ENABLED exige borrado completo.

## Cookies y Almacenamiento Local
- Preferencias (tema, idioma) en localStorage.
- No se usan cookies para tracking de terceros.

## Terceros
- Supabase como proveedor de autenticación y base de datos.
- No se comparten datos con terceros adicionales.

## Brechas de Seguridad
- Registrar incidente y evaluar alcance.
- Notificar a usuarios afectados en <72h si implica datos personales.

## Próximos Pasos
- Implementar endpoint de exportación de datos personales.
- Añadir banner de consentimiento si se introducen analíticas adicionales.
- Automatizar borrado cascada en cuenta eliminada.

Última actualización: 2025-11-18.
