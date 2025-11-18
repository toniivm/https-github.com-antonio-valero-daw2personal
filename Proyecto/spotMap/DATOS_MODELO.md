# SpotMap - Modelo de Datos

## 1. Tabla `profiles`
| Campo       | Tipo        | Descripción                              |
|-------------|-------------|------------------------------------------|
| user_id (PK)| uuid        | Referencia al usuario de Auth            |
| role        | text        | `user`, `moderator`, `admin`             |
| created_at  | timestamptz | Fecha creación                           |

Índice sugerido: primary key en `user_id`.

Ejemplo registro:
```json
{
  "user_id": "c2e3...",
  "role": "user",
  "created_at": "2025-11-18T10:30:00Z"
}
```

## 2. Tabla `spots`
| Campo        | Tipo         | Descripción                                      |
|--------------|--------------|--------------------------------------------------|
| id (PK)      | bigint       | Identificador autoincremental                    |
| user_id      | uuid         | Autor (FK -> profiles.user_id)                   |
| title        | text         | Título corto                                     |
| description  | text         | Descripción ampliada                            |
| lat          | decimal(9,6) | Latitud                                          |
| lng          | decimal(9,6) | Longitud                                         |
| tags         | text[]       | Lista de etiquetas (o text si simplificas)       |
| category     | text         | Categoría (skate, view, art, etc.)               |
| image_path   | text         | Ruta/URL pública en Storage                      |
| status       | text         | `pending`, `approved`, `rejected`                |
| created_at   | timestamptz  | Fecha creación                                   |
| updated_at   | timestamptz  | Última actualización                             |

Índices sugeridos:
- `idx_spots_status` en (status)
- `idx_spots_category` en (category)
- Geo futuro: índice compuesto (lat,lng) o PostGIS

Ejemplo registro:
```json
{
  "id": 42,
  "user_id": "c2e3...",
  "title": "Skate Plaza",
  "description": "Plaza con suelo liso y barandillas.",
  "lat": 40.41678,
  "lng": -3.70379,
  "tags": ["skate","plaza"],
  "category": "skate",
  "image_path": "public/spot-images/42_main.jpg",
  "status": "approved",
  "created_at": "2025-11-18T10:40:00Z",
  "updated_at": "2025-11-18T10:45:00Z"
}
```

## 3. Tabla opcional `audit_logs`
| Campo        | Tipo         | Descripción                         |
|--------------|--------------|-------------------------------------|
| id (PK)      | bigint       | Identificador                       |
| user_id      | uuid         | Actor                               |
| action       | text         | Ej: `approve_spot`, `reject_spot`   |
| entity_type  | text         | `spot`                              |
| entity_id    | bigint       | Referencia al spot                  |
| created_at   | timestamptz  | Fecha acción                        |

## 4. Relaciones
- `profiles.user_id` ↔ Auth user.
- `spots.user_id` ↔ `profiles.user_id`.
- `audit_logs.user_id` ↔ `profiles.user_id`.

## 5. Migraciones (SQL base)
```sql
-- profiles
create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'user',
  created_at timestamptz default now()
);

-- spots
create table if not exists spots (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(user_id) on delete cascade,
  title text not null,
  description text,
  lat decimal(9,6) not null,
  lng decimal(9,6) not null,
  tags text[] default '{}',
  category text,
  image_path text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_spots_status on spots(status);
create index if not exists idx_spots_category on spots(category);

-- audit_logs (opcional)
create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(user_id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id bigint not null,
  created_at timestamptz default now()
);
```

## 6. Actualización automática de `updated_at`
```sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_spots_updated
before update on spots
for each row execute procedure set_updated_at();
```

## 7. Posibles Extensiones Futuras
- PostGIS para búsquedas por radio.
- Tabla `favorites` (user_id, spot_id).
- Tabla `comments` para interacción.
- Campos de rating promedio y contador.

## 8. Notas de Presentación
En la defensa destaca: simplicidad, escalabilidad, claridad de roles, y cómo RLS protege filas sin código adicional en backend.
