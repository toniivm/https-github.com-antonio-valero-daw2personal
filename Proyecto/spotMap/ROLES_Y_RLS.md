# SpotMap - Roles y Seguridad (RLS)

## 1. Roles
Definidos en `profiles.role`:
- `user`: crea y edita sus spots, ve aprobados + sus pending.
- `moderator`: gestiona estado (`status`) de cualquier spot.
- `admin`: todo lo anterior + cambia roles de otros usuarios.

## 2. Estados de Spot
- `pending`: en revisión.
- `approved`: público.
- `rejected`: oculto, editable por autor para reenviar.

## 3. Objetivo de las Policies
Restringir lectura y escritura según contexto sin implementar lógica manual en backend. RLS se ejecuta dentro de Postgres (Supabase) y aplica siempre.

## 4. Policies Ejemplo (SQL)
Activar RLS:
```sql
alter table profiles enable row level security;
alter table spots enable row level security;
```

### Lectura de perfiles (sólo el propio):
```sql
create policy select_own_profile on profiles
for select using (auth.uid() = user_id);
```
Admin puede listar todos (se puede usar una policy adicional que verifique rol vía función):
```sql
-- Función helper
create or replace function is_admin() returns boolean as $$
  select exists(select 1 from profiles where user_id = auth.uid() and role = 'admin');
$$ language sql stable;

create policy select_all_profiles_admin on profiles
for select using (is_admin());
```

### Insert de perfiles (auto-provision):
```sql
create policy insert_own_profile on profiles
for insert with check (auth.uid() = user_id);
```

### Lectura de spots públicos + propios pending:
```sql
create policy select_public_spots on spots
for select using (
  status = 'approved' OR user_id = auth.uid()
);
```

### Insert de spots (autor = uid):
```sql
create policy insert_spot on spots
for insert with check (auth.uid() = user_id);
```

### Update de spot (autor o moderador/admin):
```sql
create or replace function is_moderator() returns boolean as $$
  select exists(select 1 from profiles where user_id = auth.uid() and role in ('moderator','admin'));
$$ language sql stable;

create policy update_spot on spots
for update using (
  auth.uid() = user_id OR is_moderator()
)
with check (
  -- Evita que un user cambie su propio spot a approved
  (auth.uid() = user_id AND status in ('pending','rejected')) OR is_moderator()
);
```

### Delete de spot (autor o admin):
```sql
create policy delete_spot on spots
for delete using (
  auth.uid() = user_id OR is_admin()
);
```

## 5. Prevención de Escalada de Roles
Cambios de `profiles.role` sólo por admin:
```sql
create policy update_role_admin_only on profiles
for update using (is_admin())
with check (is_admin());
```

## 6. Reglas de Moderación
Moderador cambia `status` de pending→approved o pending/rejected→approved/rejected. Los usuarios normales no pueden poner approved.

## 7. Funciones Adicionales Sugeridas
- `is_admin()`, `is_moderator()` ya definidas.
- `can_approve_spot(spot_id)` si futura lógica compleja (ej: reputación).

## 8. Realtime Filtrado
En frontend, al recibir evento de cambio:
- Ignorar si `status != approved` y no es tuyo.
- Si tuyo y `status` cambió a approved → mostrar público.

## 9. Auditoría
Al aprobar/rechazar spot, insertar en `audit_logs` (Edge Function o trigger futuro) para demostrar trazabilidad.

## 10. Presentación (Puntos Clave)
- RLS = seguridad declarativa.
- Menos código backend, más verificación automática.
- Policies legibles y mantenibles.
