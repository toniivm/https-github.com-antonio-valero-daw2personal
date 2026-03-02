# E2E (Playwright)

## Requisitos para flujo autenticado

Configura estas variables de entorno para ejecutar el flujo completo de moderación:

- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`
- `E2E_MODERATOR_EMAIL`
- `E2E_MODERATOR_PASSWORD`
- `E2E_SUPABASE_URL` (o `SUPABASE_URL`)
- `E2E_SUPABASE_SERVICE_KEY` (o `SUPABASE_SERVICE_KEY`)

## Seed automático de usuarios E2E

El proyecto incluye seeder idempotente para crear/actualizar las cuentas E2E y asignar rol en `profiles`.

- `npm run e2e:seed`

## Limpieza automática de datos E2E

El proyecto incluye limpieza idempotente para borrar datos de prueba tras ejecutar E2E.

- `npm run e2e:cleanup`

Limpia:
- Spots de prueba con prefijo `E2E Spot`
- Notificaciones de usuarios E2E
- Filas relacionadas en `comments`, `ratings`, `favorites`, `reports`

## Comandos

- `npm run e2e` → todos los tests E2E
- `npm run e2e:mobile` → smoke móvil
- `npm run e2e:desktop` → smoke desktop
- `npm run e2e:seed` → crea/actualiza cuentas E2E en Supabase
- `npm run e2e:flow` → flujo autenticado completo (si hay credenciales)
- `npm run e2e:cleanup` → limpia datos de prueba E2E en Supabase

Si faltan variables del flujo autenticado, el test se marca como `skipped` y no rompe el pipeline.
