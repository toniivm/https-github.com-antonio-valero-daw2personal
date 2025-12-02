# 1. MODELO ENTIDAD-RELACIÓN

## 1.1 Justificación del Modelo E/R

### Origen de las Entidades

El modelo entidad-relación de **SpotMap** surge del análisis exhaustivo de los requisitos funcionales y del dominio del problema. Las entidades identificadas responden directamente a los conceptos fundamentales del negocio:

#### **USERS (Usuarios)**
**Origen:** Requisito RF1, RF2, RF3 - Necesidad de autenticación y gestión de identidades.
- Representa a todos los actores del sistema que requieren identificación única
- Fundamental para establecer autoría, responsabilidad y control de acceso
- Base del sistema de permisos y roles (usuario, moderador, administrador)

#### **SPOTS (Puntos fotográficos)**
**Origen:** Requisito RF4, RF5, RF6, RF7 - Core del negocio.
- Entidad central del sistema que representa cada localización fotográfica
- Almacena información geoespacial, descriptiva y multimedia
- Permite la construcción del mapa interactivo y la búsqueda geolocalizada

#### **CATEGORIES (Categorías)**
**Origen:** Requisito RF7, RF8 - Necesidad de clasificación y filtrado.
- Organiza spots según su naturaleza (mirador, playa, urbano, montaña, etc.)
- Facilita la navegación y búsqueda temática
- Permite análisis estadísticos por tipo de localización

#### **COMMENTS (Comentarios)**
**Origen:** Requisito RF10 - Interacción social y retroalimentación.
- Fomenta la colaboración comunitaria
- Proporciona información adicional sobre cada spot
- Permite conversaciones estructuradas (con soporte para respuestas anidadas)

#### **RATINGS (Valoraciones)**
**Origen:** Requisito RF7 - Sistema de popularidad y calidad.
- Mide la satisfacción de los usuarios con cada spot
- Genera ranking de popularidad para recomendaciones
- Sistema de 1 a 5 estrellas con media calculada

#### **FAVORITES (Favoritos)**
**Origen:** Requisito RF9 - Colecciones personales.
- Permite a usuarios guardar spots de interés
- Facilita planificación de rutas fotográficas
- Genera datos de preferencias para recomendaciones futuras

#### **REPORTS (Reportes)**
**Origen:** Requisito RF12, RF11 - Moderación y calidad del contenido.
- Control de calidad del contenido comunitario
- Gestión de contenido inapropiado o duplicado
- Seguimiento de incidencias por los moderadores

#### **TAGS (Etiquetas)**
**Origen:** Requisito RF8 - Búsqueda avanzada y metadata.
- Sistema de palabras clave flexible
- Mejora la búsqueda y descubrimiento
- Permite clasificación multidimensional (hashtags)

#### **IMAGES (Imágenes)**
**Origen:** Requisito RF4 - Contenido multimedia.
- Gestión de múltiples imágenes por spot
- Separación de datos binarios de metadatos
- Control de versiones y optimizaciones

#### **NOTIFICATIONS (Notificaciones)**
**Origen:** Requisito RF15 - Comunicación con usuarios.
- Mantiene a los usuarios informados de actividad relevante
- Mejora engagement y retención
- Sistema de alertas personalizable

---

## 1.2 Origen de las Relaciones

### **USER → SPOT (1:N - "creates")**
**Justificación:** Un usuario puede crear múltiples spots, pero cada spot pertenece a un único autor.
- Necesaria para establecer autoría y responsabilidad
- Permite filtrar "Mis spots" por usuario
- Esencial para permisos de edición/eliminación

### **SPOT → CATEGORY (N:1 - "belongs_to")**
**Justificación:** Cada spot pertenece a una categoría principal, pero una categoría agrupa múltiples spots.
- Simplifica la navegación por tipo de localización
- Permite filtros eficientes en el mapa
- Facilita estadísticas por categoría

### **USER → COMMENT (1:N - "writes")**
**Justificación:** Un usuario puede escribir múltiples comentarios.
- Identifica al autor de cada comentario
- Permite moderar por usuario
- Habilita funcionalidad de "Mis comentarios"

### **SPOT → COMMENT (1:N - "has")**
**Justificación:** Un spot puede tener múltiples comentarios.
- Centraliza toda la conversación sobre un spot
- Permite calcular nivel de actividad
- Facilita la carga paginada de comentarios

### **COMMENT → COMMENT (1:N - "replies_to")**
**Justificación:** Auto-relación para respuestas anidadas.
- Permite conversaciones estructuradas
- Mejora la calidad de las discusiones
- Implementa sistema de hilos (threads)

### **USER → RATING (1:N - "rates")**
**Justificación:** Un usuario puede valorar múltiples spots.
- Evita valoraciones duplicadas (constraint unique)
- Permite seguimiento de actividad del usuario
- Habilita funcionalidad de "Mis valoraciones"

### **SPOT → RATING (1:N - "receives")**
**Justificación:** Un spot puede recibir múltiples valoraciones.
- Calcula media de valoración del spot
- Determina popularidad para ranking
- Permite análisis de satisfacción

### **USER → FAVORITE (1:N - "saves")**
**Justificación:** Un usuario puede guardar múltiples spots como favoritos.
- Implementa colecciones personales
- Permite generar rutas personalizadas
- Habilita funcionalidad de "Mis favoritos"

### **SPOT → FAVORITE (1:N - "is_favorited_by")**
**Justificación:** Un spot puede ser favorito de múltiples usuarios.
- Mide popularidad real del spot
- Genera métricas de engagement
- Permite recomendaciones "spots más guardados"

### **USER → REPORT (1:N - "creates")**
**Justificación:** Un usuario puede reportar múltiples contenidos.
- Identifica al usuario reportante
- Previene spam de reportes
- Permite seguimiento de actividad de moderación

### **SPOT → REPORT (1:N - "is_reported")**
**Justificación:** Un spot puede ser reportado múltiples veces.
- Prioriza spots con más reportes
- Permite análisis de razones de reporte
- Habilita sistema de moderación por votos

### **COMMENT → REPORT (1:N - "is_reported")**
**Justificación:** Un comentario puede ser reportado múltiples veces.
- Igual que spots, permite moderación de comentarios
- Identifica usuarios problemáticos
- Protege la calidad del contenido

### **SPOT → TAG (N:M - "is_tagged_with")**
**Justificación:** Un spot puede tener múltiples tags y un tag puede estar en múltiples spots.
- Relación muchos a muchos natural
- Permite búsqueda por múltiples palabras clave
- Facilita clasificación flexible

### **SPOT → IMAGE (1:N - "has")**
**Justificación:** Un spot puede tener múltiples imágenes.
- Permite galerías fotográficas por spot
- Separación de datos multimedia de metadatos
- Facilita gestión de almacenamiento

### **USER → NOTIFICATION (1:N - "receives")**
**Justificación:** Un usuario puede recibir múltiples notificaciones.
- Sistema de alertas personalizado
- Mejora engagement
- Permite configuración de preferencias

---

## 1.3 Diagrama Entidad-Relación

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK id           │
│    email        │◄────────┐
│    password     │         │
│    full_name    │         │
│    role         │         │
│    avatar_url   │         │
│    created_at   │         │
│    updated_at   │         │
└────────┬────────┘         │
         │                  │
         │ 1:N (creates)    │
         │                  │
         ▼                  │
┌─────────────────┐         │
│     SPOTS       │         │
├─────────────────┤         │
│ PK id           │         │
│ FK user_id      │─────────┘
│ FK category_id  │───────┐
│    title        │       │
│    description  │       │
│    latitude     │       │ N:1
│    longitude    │       │ (belongs_to)
│    image_url    │       │
│    address      │       │
│    rating_avg   │       ▼
│    rating_count │  ┌──────────────┐
│    views        │  │  CATEGORIES  │
│    created_at   │  ├──────────────┤
│    updated_at   │  │ PK id        │
└────┬────────────┘  │    name      │
     │               │    icon      │
     │               │    color     │
     │               └──────────────┘
     │
     ├──────────────────────────────────────┐
     │                                      │
     │ 1:N (has)                           │ 1:N (has)
     │                                      │
     ▼                                      ▼
┌─────────────────┐                 ┌─────────────────┐
│   COMMENTS      │                 │    RATINGS      │
├─────────────────┤                 ├─────────────────┤
│ PK id           │                 │ PK id           │
│ FK user_id      │─────┐           │ FK user_id      │─────┐
│ FK spot_id      │     │           │ FK spot_id      │     │
│ FK parent_id    │─┐   │           │    rating       │     │
│    text         │ │   │           │    created_at   │     │
│    likes        │ │   │           └─────────────────┘     │
│    created_at   │ │   │                                   │
└─────────────────┘ │   │                                   │
        │           │   │                                   │
        │           │   └───────────────────────────────────┤
        │           │                                       │
        │           └───────────1:N (writes)────────────────┤
        │                                                   │
        │                                                   │
        └────1:N (replies_to - self-referencing)           │
                                                            │
┌─────────────────┐                                        │
│   FAVORITES     │                                        │
├─────────────────┤                                        │
│ PK id           │                                        │
│ FK user_id      │────────────────────────────────────────┘
│ FK spot_id      │─────────┐
│    created_at   │         │
└─────────────────┘         │
                            │
┌─────────────────┐         │
│    REPORTS      │         │
├─────────────────┤         │
│ PK id           │         │
│ FK user_id      │─────────┤
│ FK spot_id      │─────────┤
│ FK comment_id   │         │
│    reason       │         │
│    status       │         │
│    created_at   │         │
│    resolved_at  │         │
└─────────────────┘         │
                            │
┌─────────────────┐         │
│      TAGS       │         │
├─────────────────┤         │
│ PK id           │         │
│    name         │         │
│    usage_count  │         │
└────────┬────────┘         │
         │                  │
         │                  │
         │ N:M              │
         ▼                  │
┌─────────────────┐         │
│   SPOT_TAGS     │         │
├─────────────────┤         │
│ PK id           │         │
│ FK spot_id      │◄────────┘
│ FK tag_id       │
└─────────────────┘

┌─────────────────┐
│     IMAGES      │
├─────────────────┤
│ PK id           │
│ FK spot_id      │──────┐
│    url          │      │
│    caption      │      │ 1:N (has)
│    order        │      │
│    created_at   │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│  NOTIFICATIONS  │      │
├─────────────────┤      │
│ PK id           │      │
│ FK user_id      │◄─────┘
│    type         │
│    title        │
│    message      │
│    read         │
│    created_at   │
└─────────────────┘
```

---

## 1.4 Explicación de Atributos

### **USERS**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | UUID/INT | Identificador único | Clave primaria autogenerada para garantizar unicidad |
| `email` | VARCHAR(255) UNIQUE | RF1 - Registro | Email como identificador único de usuario (login) |
| `password` | VARCHAR(255) | RF1 - Registro | Hash bcrypt/argon2 de la contraseña (nunca en texto plano) |
| `full_name` | VARCHAR(100) | RF1 - Registro | Nombre completo del usuario para personalización |
| `role` | ENUM(user, moderator, admin) | Perfiles de usuario | Control de acceso basado en roles (RBAC) |
| `avatar_url` | VARCHAR(500) | Personalización | URL de la imagen de perfil (puede ser externa: Dicebear, Gravatar) |
| `email_verified` | BOOLEAN | Seguridad | Verificación de email para prevenir cuentas falsas |
| `created_at` | TIMESTAMP | Auditoría | Registro de fecha de creación (automático) |
| `updated_at` | TIMESTAMP | Auditoría | Última actualización del perfil (automático) |

### **SPOTS**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | UUID/INT | Identificador único | Clave primaria autogenerada |
| `user_id` | FK → users.id | RF4 - Crear spot | Relación con el autor/creador del spot |
| `category_id` | FK → categories.id | RF7 - Clasificación | Categoría principal del spot (mirador, playa, etc.) |
| `title` | VARCHAR(200) | RF4 - Crear spot | Nombre descriptivo del lugar fotográfico |
| `description` | TEXT | RF4 - Crear spot | Descripción detallada, consejos, horarios recomendados |
| `latitude` | DECIMAL(10,8) | RF4 - Geolocalización | Coordenada geográfica norte-sur (precisión ~1cm) |
| `longitude` | DECIMAL(11,8) | RF4 - Geolocalización | Coordenada geográfica este-oeste (precisión ~1cm) |
| `image_url` | VARCHAR(500) | RF4 - Contenido multimedia | URL de la imagen principal (puede ser Supabase Storage) |
| `address` | VARCHAR(500) | RF7 - Búsqueda | Dirección legible obtenida por geocoding inverso |
| `rating_avg` | DECIMAL(2,1) | Calculado | Media de valoraciones (1.0 - 5.0, calculado) |
| `rating_count` | INT | Contador | Número total de valoraciones recibidas |
| `views` | INT | Métricas | Contador de visualizaciones del spot |
| `status` | ENUM(active, pending, deleted) | Moderación | Estado del spot (activo, pendiente revisión, eliminado) |
| `created_at` | TIMESTAMP | Auditoría | Fecha de creación del spot |
| `updated_at` | TIMESTAMP | Auditoría | Última modificación del spot |

### **CATEGORIES**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | INT | Identificador único | Clave primaria secuencial |
| `name` | VARCHAR(50) UNIQUE | RF7 - Clasificación | Nombre de la categoría (Mirador, Playa, Urbano, Montaña) |
| `slug` | VARCHAR(50) UNIQUE | SEO | Versión URL-friendly del nombre (ej: "mirador-natural") |
| `icon` | VARCHAR(50) | UI/UX | Nombre del icono de Bootstrap Icons (ej: "bi-mountain") |
| `color` | VARCHAR(7) | UI/UX | Color hex para identificación visual (ej: "#10b981") |
| `description` | TEXT | Información | Descripción de qué tipo de spots incluye |

### **COMMENTS**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | UUID/INT | Identificador único | Clave primaria autogenerada |
| `user_id` | FK → users.id | RF10 - Comentar | Usuario que escribió el comentario |
| `spot_id` | FK → spots.id | RF10 - Comentar | Spot al que pertenece el comentario |
| `parent_id` | FK → comments.id (nullable) | Conversaciones | ID del comentario padre (null si es comentario raíz) |
| `text` | TEXT | RF10 - Contenido | Texto del comentario (con límite de caracteres) |
| `likes` | INT | Interacción | Número de likes recibidos (implementación futura) |
| `created_at` | TIMESTAMP | Auditoría | Fecha de creación del comentario |
| `updated_at` | TIMESTAMP | Auditoría | Fecha de última edición |

### **RATINGS**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | UUID/INT | Identificador único | Clave primaria autogenerada |
| `user_id` | FK → users.id | Valoración | Usuario que realizó la valoración |
| `spot_id` | FK → spots.id | Valoración | Spot valorado |
| `rating` | TINYINT(1-5) | RF7 - Sistema de valoración | Puntuación de 1 a 5 estrellas |
| `created_at` | TIMESTAMP | Auditoría | Fecha de la valoración |
| **CONSTRAINT** | UNIQUE(user_id, spot_id) | Integridad | Un usuario solo puede valorar un spot una vez |

### **FAVORITES**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | UUID/INT | Identificador único | Clave primaria autogenerada |
| `user_id` | FK → users.id | RF9 - Favoritos | Usuario que guardó el favorito |
| `spot_id` | FK → spots.id | RF9 - Favoritos | Spot guardado como favorito |
| `created_at` | TIMESTAMP | Auditoría | Fecha en que se marcó como favorito |
| **CONSTRAINT** | UNIQUE(user_id, spot_id) | Integridad | Un usuario no puede guardar el mismo spot dos veces |

### **REPORTS**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | UUID/INT | Identificador único | Clave primaria autogenerada |
| `user_id` | FK → users.id | RF12 - Reportar | Usuario que realizó el reporte |
| `spot_id` | FK → spots.id (nullable) | RF12 - Contenido | Spot reportado (null si se reporta un comentario) |
| `comment_id` | FK → comments.id (nullable) | RF12 - Contenido | Comentario reportado (null si se reporta un spot) |
| `reason` | ENUM(spam, inappropriate, duplicate, fake, other) | RF12 - Moderación | Motivo del reporte |
| `description` | TEXT | RF12 - Detalles | Descripción detallada del problema |
| `status` | ENUM(pending, reviewed, resolved, dismissed) | RF11 - Moderación | Estado del reporte |
| `created_at` | TIMESTAMP | Auditoría | Fecha del reporte |
| `resolved_at` | TIMESTAMP (nullable) | Auditoría | Fecha de resolución del reporte |
| `resolved_by` | FK → users.id (nullable) | Auditoría | Moderador que resolvió el reporte |

### **TAGS**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | INT | Identificador único | Clave primaria secuencial |
| `name` | VARCHAR(50) UNIQUE | RF8 - Búsqueda | Nombre del tag (hashtag sin #) |
| `slug` | VARCHAR(50) UNIQUE | SEO | Versión URL-friendly |
| `usage_count` | INT | Métricas | Contador de cuántos spots tienen este tag |

### **SPOT_TAGS** (Tabla intermedia N:M)

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | INT | Identificador único | Clave primaria secuencial |
| `spot_id` | FK → spots.id | Relación N:M | Spot etiquetado |
| `tag_id` | FK → tags.id | Relación N:M | Tag asociado |
| **CONSTRAINT** | UNIQUE(spot_id, tag_id) | Integridad | Un spot no puede tener el mismo tag duplicado |

### **IMAGES**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | UUID/INT | Identificador único | Clave primaria autogenerada |
| `spot_id` | FK → spots.id | RF4 - Multimedia | Spot al que pertenece la imagen |
| `url` | VARCHAR(500) | Almacenamiento | URL de la imagen en Supabase Storage o CDN |
| `caption` | VARCHAR(200) | Accesibilidad | Descripción alternativa de la imagen |
| `order` | INT | UI/UX | Orden de visualización en galería (1, 2, 3...) |
| `created_at` | TIMESTAMP | Auditoría | Fecha de subida |

### **NOTIFICATIONS**

| Atributo | Tipo | Origen | Justificación |
|----------|------|--------|---------------|
| `id` | UUID/INT | Identificador único | Clave primaria autogenerada |
| `user_id` | FK → users.id | RF15 - Notificaciones | Usuario destinatario |
| `type` | ENUM(comment, like, favorite, report, system) | RF15 - Tipos | Tipo de notificación |
| `title` | VARCHAR(100) | UI/UX | Título corto de la notificación |
| `message` | TEXT | RF15 - Contenido | Mensaje completo de la notificación |
| `link` | VARCHAR(500) | Navegación | URL de destino al hacer click |
| `read` | BOOLEAN | Estado | Si la notificación ha sido leída |
| `created_at` | TIMESTAMP | Auditoría | Fecha de creación |

---

## 1.5 Elección de Claves Primarias

### **Estrategia General: UUID vs INT Autoincremental**

Para SpotMap se ha optado por una **estrategia híbrida**:

#### **UUID (Universally Unique Identifier)** para:
- **users.id**
- **spots.id**
- **comments.id**
- **images.id**
- **notifications.id**

**Justificación:**
1. **Escalabilidad distribuida**: Permite generar IDs en el cliente sin colisiones
2. **Seguridad**: No expone el número total de registros (no es secuencial)
3. **Compatibilidad con Supabase**: Supabase utiliza UUID por defecto
4. **Sincronización offline**: Facilita sincronización sin conflictos
5. **No predecible**: IDs no adivinables para mayor seguridad

**Ejemplo:** `550e8400-e29b-41d4-a716-446655440000`

#### **INT Autoincremental** para:
- **categories.id**
- **tags.id**
- **ratings.id**
- **favorites.id**
- **reports.id**
- **spot_tags.id**

**Justificación:**
1. **Catálogos pequeños**: Categorías y tags son conjuntos limitados
2. **Eficiencia de indexación**: INT es más rápido en joins que UUID
3. **Menor consumo de espacio**: INT(11) = 4 bytes vs UUID = 16 bytes
4. **Legibilidad**: Más fácil de referenciar en logs y debugging
5. **Orden natural**: Útil para ordenar por antigüedad

---

## 1.6 Restricciones de Integridad

### **Restricciones de Clave Externa (Foreign Keys)**

```sql
-- SPOTS
ALTER TABLE spots
  ADD CONSTRAINT fk_spot_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE spots
  ADD CONSTRAINT fk_spot_category 
    FOREIGN KEY (category_id) REFERENCES categories(id) 
    ON DELETE SET NULL;

-- COMMENTS
ALTER TABLE comments
  ADD CONSTRAINT fk_comment_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE comments
  ADD CONSTRAINT fk_comment_spot 
    FOREIGN KEY (spot_id) REFERENCES spots(id) 
    ON DELETE CASCADE;

ALTER TABLE comments
  ADD CONSTRAINT fk_comment_parent 
    FOREIGN KEY (parent_id) REFERENCES comments(id) 
    ON DELETE CASCADE;

-- RATINGS
ALTER TABLE ratings
  ADD CONSTRAINT fk_rating_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE ratings
  ADD CONSTRAINT fk_rating_spot 
    FOREIGN KEY (spot_id) REFERENCES spots(id) 
    ON DELETE CASCADE;

-- FAVORITES
ALTER TABLE favorites
  ADD CONSTRAINT fk_favorite_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE favorites
  ADD CONSTRAINT fk_favorite_spot 
    FOREIGN KEY (spot_id) REFERENCES spots(id) 
    ON DELETE CASCADE;

-- Etc...
```

### **Restricciones de Unicidad**

```sql
-- Un usuario solo puede valorar un spot una vez
ALTER TABLE ratings
  ADD CONSTRAINT unique_user_spot_rating 
    UNIQUE (user_id, spot_id);

-- Un usuario no puede guardar el mismo spot dos veces
ALTER TABLE favorites
  ADD CONSTRAINT unique_user_spot_favorite 
    UNIQUE (user_id, spot_id);

-- Un spot no puede tener el mismo tag duplicado
ALTER TABLE spot_tags
  ADD CONSTRAINT unique_spot_tag 
    UNIQUE (spot_id, tag_id);

-- Email único por usuario
ALTER TABLE users
  ADD CONSTRAINT unique_email 
    UNIQUE (email);
```

### **Restricciones de Dominio (Check Constraints)**

```sql
-- Valoración entre 1 y 5
ALTER TABLE ratings
  ADD CONSTRAINT check_rating_value 
    CHECK (rating >= 1 AND rating <= 5);

-- Coordenadas geográficas válidas
ALTER TABLE spots
  ADD CONSTRAINT check_latitude 
    CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE spots
  ADD CONSTRAINT check_longitude 
    CHECK (longitude >= -180 AND longitude <= 180);

-- Rating promedio entre 0 y 5
ALTER TABLE spots
  ADD CONSTRAINT check_rating_avg 
    CHECK (rating_avg >= 0 AND rating_avg <= 5);
```

---

## 1.7 Índices para Optimización

```sql
-- Índices geoespaciales para búsqueda por ubicación
CREATE INDEX idx_spots_location 
  ON spots(latitude, longitude);

-- Índices para búsqueda de texto
CREATE INDEX idx_spots_title 
  ON spots(title);

CREATE INDEX idx_spots_address 
  ON spots(address);

-- Índices para ordenación y filtrado
CREATE INDEX idx_spots_rating 
  ON spots(rating_avg DESC);

CREATE INDEX idx_spots_views 
  ON spots(views DESC);

CREATE INDEX idx_spots_created 
  ON spots(created_at DESC);

-- Índices compuestos para queries comunes
CREATE INDEX idx_spots_category_rating 
  ON spots(category_id, rating_avg DESC);

CREATE INDEX idx_comments_spot_created 
  ON comments(spot_id, created_at DESC);

-- Índices para relaciones N:M
CREATE INDEX idx_spot_tags_tag 
  ON spot_tags(tag_id);

CREATE INDEX idx_spot_tags_spot 
  ON spot_tags(spot_id);
```

---

## 1.8 Normalización

El modelo se encuentra en **Tercera Forma Normal (3NF)**:

### ✅ **1FN (Primera Forma Normal)**
- Todos los atributos contienen valores atómicos
- No existen grupos repetitivos
- Cada columna tiene un único tipo de dato

### ✅ **2FN (Segunda Forma Normal)**
- Está en 1FN
- Todos los atributos no clave dependen completamente de la clave primaria
- No existen dependencias parciales

### ✅ **3FN (Tercera Forma Normal)**
- Está en 2FN
- No existen dependencias transitivas
- Todos los atributos no clave dependen únicamente de la clave primaria

**Excepción controlada:** `spots.rating_avg` y `spots.rating_count` son campos calculados (desnormalización intencional) para mejorar el rendimiento y evitar cálculos costosos en cada consulta.

---

## 1.9 Cardinalidades Completas

| Relación | Cardinalidad | Restricción |
|----------|-------------|-------------|
| USER → SPOT | 1:N | Un usuario puede crear 0 o muchos spots. Un spot pertenece a 1 usuario. |
| CATEGORY → SPOT | 1:N | Una categoría puede agrupar 0 o muchos spots. Un spot tiene 1 categoría. |
| USER → COMMENT | 1:N | Un usuario puede escribir 0 o muchos comentarios. Un comentario pertenece a 1 usuario. |
| SPOT → COMMENT | 1:N | Un spot puede tener 0 o muchos comentarios. Un comentario pertenece a 1 spot. |
| COMMENT → COMMENT | 1:N (auto) | Un comentario puede tener 0 o muchas respuestas. Una respuesta puede tener 1 comentario padre. |
| USER → RATING | 1:N | Un usuario puede hacer 0 o muchas valoraciones. Una valoración pertenece a 1 usuario. |
| SPOT → RATING | 1:N | Un spot puede tener 0 o muchas valoraciones. Una valoración pertenece a 1 spot. |
| USER → FAVORITE | 1:N | Un usuario puede guardar 0 o muchos favoritos. Un favorito pertenece a 1 usuario. |
| SPOT → FAVORITE | 1:N | Un spot puede ser favorito de 0 o muchos usuarios. Un favorito pertenece a 1 spot. |
| USER → REPORT | 1:N | Un usuario puede crear 0 o muchos reportes. Un reporte pertenece a 1 usuario. |
| SPOT → REPORT | 1:N | Un spot puede tener 0 o muchos reportes. Un reporte puede referenciar 1 spot. |
| COMMENT → REPORT | 1:N | Un comentario puede tener 0 o muchos reportes. Un reporte puede referenciar 1 comentario. |
| SPOT ↔ TAG | N:M | Un spot puede tener 0 o muchos tags. Un tag puede estar en 0 o muchos spots. |
| SPOT → IMAGE | 1:N | Un spot puede tener 0 o muchas imágenes. Una imagen pertenece a 1 spot. |
| USER → NOTIFICATION | 1:N | Un usuario puede recibir 0 o muchas notificaciones. Una notificación pertenece a 1 usuario. |

---

**Fin del Documento 1: Modelo Entidad-Relación**
