# DOCUMENTACIÓN TÉCNICA - SPOTMAP
## Plataforma de Geolocalización de Spots Fotográficos

---

# 5. MODELO ENTIDAD-RELACIÓN

## 5.1 Justificación del Modelo E/R

El modelo entidad-relación de **SpotMap** surge del análisis de los requisitos funcionales del sistema. A continuación se explica el origen de cada entidad y relación del modelo.

### 5.1.1 Origen de las Entidades

**USERS (Usuarios)**
- **Origen**: Requisito RF1, RF2, RF3 - Sistema de autenticación
- **Justificación**: Es necesaria para identificar usuarios, establecer autoría de contenido y gestionar permisos según roles (usuario, moderador, administrador)

**SPOTS (Puntos Fotográficos)**
- **Origen**: Requisito RF4, RF5, RF6, RF7 - Funcionalidad principal
- **Justificación**: Entidad central del sistema. Representa localizaciones fotográficas con información geoespacial, descriptiva y multimedia

**CATEGORIES (Categorías)**
- **Origen**: Requisito RF7, RF8 - Clasificación de contenido
- **Justificación**: Organiza spots por tipo (mirador, playa, urbano, montaña) facilitando navegación y filtrado

**COMMENTS (Comentarios)**
- **Origen**: Requisito RF10 - Interacción social
- **Justificación**: Permite a usuarios compartir experiencias y consejos sobre cada spot. Incluye soporte para respuestas anidadas (hilos de conversación)

**RATINGS (Valoraciones)**
- **Origen**: Requisito RF7 - Sistema de calidad
- **Justificación**: Sistema de valoración 1-5 estrellas para medir satisfacción y generar ranking de popularidad

**FAVORITES (Favoritos)**
- **Origen**: Requisito RF9 - Colecciones personales
- **Justificación**: Permite a usuarios guardar spots de interés para planificar rutas fotográficas

**REPORTS (Reportes)**
- **Origen**: Requisito RF11, RF12 - Moderación de contenido
- **Justificación**: Sistema de control de calidad para gestionar contenido inapropiado o duplicado

**TAGS (Etiquetas)**
- **Origen**: Requisito RF8 - Búsqueda avanzada
- **Justificación**: Sistema flexible de palabras clave (hashtags) para mejorar descubrimiento de spots

**IMAGES (Imágenes)**
- **Origen**: Requisito RF4 - Contenido multimedia
- **Justificación**: Gestiona múltiples imágenes por spot con metadatos y orden de visualización

**NOTIFICATIONS (Notificaciones)**
- **Origen**: Requisito RF15 - Comunicación con usuarios
- **Justificación**: Sistema de alertas para mantener usuarios informados de actividad relevante (comentarios, likes, reportes)

### 5.1.2 Origen de las Relaciones

**USER → SPOT (1:N - "crea")**
- Un usuario puede crear múltiples spots
- Cada spot pertenece a un único autor
- Necesaria para establecer autoría y permisos de edición

**SPOT → CATEGORY (N:1 - "pertenece a")**
- Cada spot tiene una categoría principal
- Una categoría agrupa múltiples spots
- Facilita filtrado eficiente en el mapa

**USER → COMMENT (1:N - "escribe")**
- Un usuario puede escribir múltiples comentarios
- Identifica al autor de cada comentario

**SPOT → COMMENT (1:N - "tiene")**
- Un spot puede tener múltiples comentarios
- Centraliza conversaciones sobre cada spot

**COMMENT → COMMENT (1:N - "responde a")**
- Auto-relación para respuestas anidadas
- Permite conversaciones estructuradas en hilos

**USER → RATING (1:N - "valora")**
- Un usuario puede valorar múltiples spots
- Restricción: Un usuario solo puede valorar cada spot una vez

**SPOT → RATING (1:N - "recibe")**
- Un spot puede recibir múltiples valoraciones
- Se calcula media automáticamente

**USER → FAVORITE (1:N - "guarda")**
- Un usuario puede tener múltiples favoritos
- Implementa colecciones personales

**SPOT → FAVORITE (1:N - "es favorito de")**
- Un spot puede ser favorito de múltiples usuarios
- Mide popularidad real

**USER → REPORT (1:N - "reporta")**
- Un usuario puede crear múltiples reportes
- Previene spam con validaciones

**SPOT → REPORT (1:N - "es reportado")**
- Un spot puede ser reportado múltiples veces
- Prioriza spots con más reportes

**COMMENT → REPORT (1:N - "es reportado")**
- Un comentario puede ser reportado múltiples veces
- Sistema de moderación de comentarios

**SPOT ↔ TAG (N:M - "está etiquetado con")**
- Un spot puede tener múltiples tags
- Un tag puede estar en múltiples spots
- Implementado mediante tabla intermedia SPOT_TAGS

**SPOT → IMAGE (1:N - "contiene")**
- Un spot puede tener múltiples imágenes
- Permite galerías fotográficas

**USER → NOTIFICATION (1:N - "recibe")**
- Un usuario puede recibir múltiples notificaciones
- Sistema de alertas personalizado

---

## 5.2 Diagrama Entidad-Relación

> **NOTA PARA WORD**: Insertar aquí el diagrama E/R como imagen.
> 
> **Instrucciones para crear el diagrama**:
> - Usar herramienta: Draw.io (https://app.diagrams.net/), Lucidchart, o ERDPlus
> - Crear las siguientes entidades como rectángulos:
>   * USERS (id PK, email, password, full_name, role, avatar_url, created_at, updated_at)
>   * SPOTS (id PK, user_id FK, category_id FK, title, description, latitude, longitude, image_url, rating_avg, rating_count, views, status, created_at, updated_at)
>   * CATEGORIES (id PK, name, slug, icon, color, description)
>   * COMMENTS (id PK, user_id FK, spot_id FK, parent_id FK, text, likes, created_at, updated_at)
>   * RATINGS (id PK, user_id FK, spot_id FK, rating, created_at)
>   * FAVORITES (id PK, user_id FK, spot_id FK, created_at)
>   * REPORTS (id PK, user_id FK, spot_id FK, comment_id FK, reason, status, created_at, resolved_at, resolved_by FK)
>   * TAGS (id PK, name, slug, usage_count)
>   * SPOT_TAGS (id PK, spot_id FK, tag_id FK)
>   * IMAGES (id PK, spot_id FK, url, caption, order, created_at)
>   * NOTIFICATIONS (id PK, user_id FK, type, title, message, link, read, created_at)
> 
> - Conectar con líneas según las relaciones descritas en sección 5.1.2
> - Indicar cardinalidades (1:N, N:M) en cada relación
> - Exportar como imagen PNG o JPG en alta resolución

**Descripción textual del diagrama**:
- Entidad central: SPOTS (conecta con la mayoría de entidades)
- USERS conecta con: SPOTS (crea), COMMENTS (escribe), RATINGS (valora), FAVORITES (guarda), REPORTS (reporta), NOTIFICATIONS (recibe)
- SPOTS conecta con: CATEGORIES (pertenece), COMMENTS (tiene), RATINGS (recibe), FAVORITES (es favorito), REPORTS (es reportado), IMAGES (contiene), TAGS (vía SPOT_TAGS)
- COMMENTS tiene auto-relación (parent_id) para respuestas anidadas

---

## 5.3 Explicación del Origen de los Atributos

### Tabla USERS

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | UUID | Identificador único | Clave primaria. Se usa UUID por seguridad (no secuencial) y compatibilidad con Supabase |
| email | VARCHAR(255) UNIQUE | RF1 - Registro | Identificador único del usuario para login. Debe ser único y válido |
| password | VARCHAR(255) | RF1 - Registro | Hash de la contraseña (bcrypt/argon2). Nunca se almacena en texto plano |
| full_name | VARCHAR(100) | RF1 - Registro | Nombre completo del usuario para personalización de la interfaz |
| role | ENUM | Gestión de permisos | Valores: 'user', 'moderator', 'admin'. Control de acceso basado en roles (RBAC) |
| avatar_url | VARCHAR(500) | Personalización | URL de la imagen de perfil. Puede ser externa (Dicebear, Gravatar) o de Supabase Storage |
| email_verified | BOOLEAN | Seguridad | Indica si el email ha sido verificado. Previene cuentas falsas |
| created_at | TIMESTAMP | Auditoría | Fecha de creación de la cuenta. Generado automáticamente |
| updated_at | TIMESTAMP | Auditoría | Última actualización del perfil. Se actualiza automáticamente |

### Tabla SPOTS

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | UUID | Identificador único | Clave primaria autogenerada |
| user_id | UUID (FK) | RF4 - Crear spot | Relación con el usuario creador. ON DELETE CASCADE |
| category_id | INT (FK) | RF7 - Clasificación | Categoría del spot (mirador, playa, etc.). ON DELETE SET NULL |
| title | VARCHAR(200) | RF4 - Crear spot | Nombre descriptivo del lugar fotográfico. Campo obligatorio |
| description | TEXT | RF4 - Crear spot | Descripción detallada, consejos, horarios. Campo opcional |
| latitude | DECIMAL(10,8) | RF4 - Geolocalización | Coordenada norte-sur. Rango: -90 a 90. Precisión ~1cm |
| longitude | DECIMAL(11,8) | RF4 - Geolocalización | Coordenada este-oeste. Rango: -180 a 180. Precisión ~1cm |
| image_url | VARCHAR(500) | RF4 - Multimedia | URL de la imagen principal del spot |
| address | VARCHAR(500) | RF7 - Búsqueda | Dirección legible obtenida por geocoding inverso (ej: "Calle Mayor, Madrid") |
| rating_avg | DECIMAL(2,1) | Calculado | Media de valoraciones (1.0 - 5.0). Campo desnormalizado para rendimiento |
| rating_count | INT | Contador | Número total de valoraciones. Campo desnormalizado |
| views | INT | Métricas | Contador de visualizaciones del spot |
| status | ENUM | Moderación | Valores: 'active', 'pending', 'deleted'. Control del estado del contenido |
| created_at | TIMESTAMP | Auditoría | Fecha de creación del spot |
| updated_at | TIMESTAMP | Auditoría | Última modificación del spot |

### Tabla CATEGORIES

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | INT | Identificador único | Clave primaria secuencial. Se usa INT por ser catálogo pequeño |
| name | VARCHAR(50) UNIQUE | RF7 - Clasificación | Nombre de la categoría. Ej: "Mirador", "Playa", "Urbano" |
| slug | VARCHAR(50) UNIQUE | SEO | Versión URL-friendly. Ej: "mirador-natural" |
| icon | VARCHAR(50) | UI/UX | Nombre del icono de Bootstrap Icons. Ej: "bi-mountain" |
| color | VARCHAR(7) | UI/UX | Color hex para identificación visual. Ej: "#10b981" |
| description | TEXT | Información | Descripción del tipo de spots que incluye la categoría |

### Tabla COMMENTS

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | UUID | Identificador único | Clave primaria autogenerada |
| user_id | UUID (FK) | RF10 - Comentar | Usuario autor del comentario. ON DELETE CASCADE |
| spot_id | UUID (FK) | RF10 - Comentar | Spot al que pertenece. ON DELETE CASCADE |
| parent_id | UUID (FK) nullable | Conversaciones | ID del comentario padre. NULL si es comentario raíz. Auto-relación |
| text | TEXT | RF10 - Contenido | Texto del comentario. Campo obligatorio |
| likes | INT | Interacción | Número de likes recibidos. Default: 0 |
| created_at | TIMESTAMP | Auditoría | Fecha de creación del comentario |
| updated_at | TIMESTAMP | Auditoría | Fecha de última edición |

### Tabla RATINGS

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | INT | Identificador único | Clave primaria secuencial |
| user_id | UUID (FK) | Valoración | Usuario que valoró. ON DELETE CASCADE |
| spot_id | UUID (FK) | Valoración | Spot valorado. ON DELETE CASCADE |
| rating | TINYINT | RF7 - Sistema valoración | Puntuación 1-5 estrellas. CHECK (rating >= 1 AND rating <= 5) |
| created_at | TIMESTAMP | Auditoría | Fecha de la valoración |

**Restricción**: UNIQUE(user_id, spot_id) - Un usuario solo puede valorar cada spot una vez

### Tabla FAVORITES

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | INT | Identificador único | Clave primaria secuencial |
| user_id | UUID (FK) | RF9 - Favoritos | Usuario que guardó el favorito. ON DELETE CASCADE |
| spot_id | UUID (FK) | RF9 - Favoritos | Spot guardado. ON DELETE CASCADE |
| created_at | TIMESTAMP | Auditoría | Fecha en que se marcó como favorito |

**Restricción**: UNIQUE(user_id, spot_id) - Un usuario no puede guardar el mismo spot dos veces

### Tabla REPORTS

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | UUID | Identificador único | Clave primaria autogenerada |
| user_id | UUID (FK) | RF12 - Reportar | Usuario que realizó el reporte. ON DELETE CASCADE |
| spot_id | UUID (FK) nullable | RF12 - Contenido | Spot reportado. NULL si se reporta un comentario |
| comment_id | UUID (FK) nullable | RF12 - Contenido | Comentario reportado. NULL si se reporta un spot |
| reason | ENUM | RF12 - Moderación | Valores: 'spam', 'inappropriate', 'duplicate', 'fake', 'other' |
| description | TEXT | RF12 - Detalles | Descripción detallada del problema |
| status | ENUM | RF11 - Moderación | Valores: 'pending', 'reviewed', 'resolved', 'dismissed' |
| created_at | TIMESTAMP | Auditoría | Fecha del reporte |
| resolved_at | TIMESTAMP nullable | Auditoría | Fecha de resolución |
| resolved_by | UUID (FK) nullable | Auditoría | Moderador que resolvió el reporte |

### Tabla TAGS

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | INT | Identificador único | Clave primaria secuencial |
| name | VARCHAR(50) UNIQUE | RF8 - Búsqueda | Nombre del tag (hashtag sin #). Ej: "atardecer" |
| slug | VARCHAR(50) UNIQUE | SEO | Versión URL-friendly del nombre |
| usage_count | INT | Métricas | Contador de cuántos spots tienen este tag |

### Tabla SPOT_TAGS (Tabla intermedia N:M)

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | INT | Identificador único | Clave primaria secuencial |
| spot_id | UUID (FK) | Relación N:M | Spot etiquetado. ON DELETE CASCADE |
| tag_id | INT (FK) | Relación N:M | Tag asociado. ON DELETE CASCADE |

**Restricción**: UNIQUE(spot_id, tag_id) - Un spot no puede tener el mismo tag duplicado

### Tabla IMAGES

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | UUID | Identificador único | Clave primaria autogenerada |
| spot_id | UUID (FK) | RF4 - Multimedia | Spot al que pertenece. ON DELETE CASCADE |
| url | VARCHAR(500) | Almacenamiento | URL de la imagen en Supabase Storage o CDN |
| caption | VARCHAR(200) | Accesibilidad | Descripción alternativa de la imagen |
| order | INT | UI/UX | Orden de visualización en galería (1, 2, 3...) |
| created_at | TIMESTAMP | Auditoría | Fecha de subida de la imagen |

### Tabla NOTIFICATIONS

| Atributo | Tipo de Dato | Origen | Justificación |
|----------|-------------|--------|---------------|
| id | UUID | Identificador único | Clave primaria autogenerada |
| user_id | UUID (FK) | RF15 - Notificaciones | Usuario destinatario. ON DELETE CASCADE |
| type | ENUM | RF15 - Tipos | Valores: 'comment', 'like', 'favorite', 'report', 'system' |
| title | VARCHAR(100) | UI/UX | Título corto de la notificación |
| message | TEXT | RF15 - Contenido | Mensaje completo de la notificación |
| link | VARCHAR(500) | Navegación | URL de destino al hacer click |
| read | BOOLEAN | Estado | Indica si la notificación ha sido leída. Default: false |
| created_at | TIMESTAMP | Auditoría | Fecha de creación de la notificación |

---

## 5.4 Elección de Claves Primarias

Para el diseño de SpotMap se ha optado por una **estrategia híbrida** que combina UUID e INT según las necesidades de cada tabla.

### UUID (Universally Unique Identifier)

**Se utiliza en**:
- users.id
- spots.id
- comments.id
- images.id
- notifications.id
- reports.id

**Justificación**:

1. **Escalabilidad distribuida**: Los UUID se pueden generar en el cliente sin necesidad de consultar la base de datos, evitando colisiones incluso en sistemas distribuidos

2. **Seguridad**: Al no ser secuenciales, no exponen información sobre el número total de registros en la tabla (no se puede saber cuántos usuarios hay contando IDs)

3. **Compatibilidad con Supabase**: Supabase utiliza UUID como tipo de dato por defecto para claves primarias en su sistema de autenticación

4. **Sincronización offline**: Facilita la implementación de funcionalidades offline ya que los IDs se pueden generar localmente sin conflictos

5. **No predecibilidad**: Los IDs no son adivinables, lo que aumenta la seguridad (un usuario no puede "adivinar" el ID de otro usuario o spot)

**Ejemplo de UUID**: `550e8400-e29b-41d4-a716-446655440000`

### INT Autoincremental

**Se utiliza en**:
- categories.id
- tags.id
- ratings.id
- favorites.id
- spot_tags.id

**Justificación**:

1. **Catálogos pequeños**: Categorías y tags son conjuntos limitados y relativamente estáticos

2. **Eficiencia de indexación**: Los enteros son más rápidos en operaciones de JOIN que los UUID, especialmente con grandes volúmenes de datos

3. **Menor consumo de espacio**: INT(11) ocupa 4 bytes mientras que UUID ocupa 16 bytes (reducción del 75% de espacio)

4. **Legibilidad**: Es más fácil referenciar "categoría 3" que un UUID largo en logs y debugging

5. **Orden natural**: El autoincremento proporciona un orden cronológico natural útil para ordenar por antigüedad

**Tabla comparativa**:

| Aspecto | UUID | INT Autoincremental |
|---------|------|---------------------|
| Tamaño | 16 bytes | 4 bytes |
| Generación | Cliente/Servidor | Solo servidor |
| Orden | Aleatorio | Secuencial |
| Seguridad | Alta (no predecible) | Baja (predecible) |
| Rendimiento JOIN | Menor | Mayor |
| Uso recomendado | Entidades principales | Catálogos y relaciones |

---

# 5.5 MODELO RELACIONAL

## 5.5.1 Paso del Modelo E/R al Modelo Relacional

El proceso de transformación del modelo Entidad-Relación al Modelo Relacional sigue las siguientes reglas:

### Regla 1: Transformación de Entidades

**Cada entidad del modelo E/R se convierte en una tabla** con las siguientes características:
- El nombre de la entidad se convierte en el nombre de la tabla
- Cada atributo de la entidad se convierte en una columna
- La clave primaria de la entidad se convierte en PRIMARY KEY de la tabla
- Los atributos obligatorios se marcan como NOT NULL

**Ejemplo**: La entidad USERS se transforma en:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Regla 2: Transformación de Relaciones 1:N

**Las relaciones uno a muchos (1:N) se implementan mediante claves foráneas**:
- Se añade una columna en la tabla del lado "N" que referencia la PRIMARY KEY de la tabla del lado "1"
- Esta columna se marca como FOREIGN KEY
- Se definen las acciones ON DELETE y ON UPDATE según las reglas de negocio

**Ejemplo**: La relación USER → SPOT (1:N) se transforma en:

```sql
CREATE TABLE spots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    -- otros atributos...
    
    CONSTRAINT fk_spot_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);
```

**Significado de ON DELETE CASCADE**: Cuando se elimina un usuario, todos sus spots se eliminan automáticamente (borrado en cascada).

### Regla 3: Transformación de Relaciones N:M

**Las relaciones muchos a muchos (N:M) requieren una tabla intermedia**:
- Se crea una nueva tabla con el nombre de ambas entidades (ej: spot_tags)
- Esta tabla contiene dos claves foráneas que referencian las tablas relacionadas
- La clave primaria puede ser compuesta (ambas FKs) o un ID independiente
- Se añade constraint UNIQUE para evitar duplicados

**Ejemplo**: La relación SPOT ↔ TAG (N:M) se transforma en:

```sql
CREATE TABLE spot_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    spot_id UUID NOT NULL,
    tag_id INT NOT NULL,
    
    CONSTRAINT fk_spot_tags_spot 
        FOREIGN KEY (spot_id) 
        REFERENCES spots(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_spot_tags_tag 
        FOREIGN KEY (tag_id) 
        REFERENCES tags(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_spot_tag 
        UNIQUE (spot_id, tag_id)
);
```

### Regla 4: Transformación de Relaciones 1:1

**Las relaciones uno a uno (1:1) se implementan como 1:N con UNIQUE**:
- Se añade una FOREIGN KEY en una de las tablas
- Se añade constraint UNIQUE a la FOREIGN KEY para garantizar que solo haya una relación

**Nota**: En SpotMap no hay relaciones 1:1 puras, pero se podría aplicar por ejemplo si cada usuario tuviera un único perfil extendido.

### Regla 5: Auto-relaciones

**Las auto-relaciones (una entidad relacionada consigo misma) se implementan con FK a la misma tabla**:

**Ejemplo**: COMMENT → COMMENT (respuestas anidadas):

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    spot_id UUID NOT NULL,
    parent_id UUID NULL,  -- Auto-relación
    text TEXT NOT NULL,
    
    CONSTRAINT fk_comment_parent 
        FOREIGN KEY (parent_id) 
        REFERENCES comments(id) 
        ON DELETE CASCADE
);
```

**Explicación**: `parent_id` puede ser NULL (comentario raíz) o referenciar a otro comentario de la misma tabla (respuesta).

### Regla 6: Atributos calculados

**Los atributos derivados/calculados se pueden**:
- Calcular en tiempo real con SELECT (más preciso, más lento)
- Almacenar de forma desnormalizada (más rápido, requiere mantenimiento)

**Ejemplo**: `spots.rating_avg` y `spots.rating_count` son campos calculados que se almacenan por rendimiento:

```sql
-- Trigger que actualiza automáticamente rating_avg
CREATE TRIGGER update_spot_rating_avg
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
BEGIN
    UPDATE spots
    SET rating_avg = (
        SELECT AVG(rating) FROM ratings WHERE spot_id = NEW.spot_id
    ),
    rating_count = (
        SELECT COUNT(*) FROM ratings WHERE spot_id = NEW.spot_id
    )
    WHERE id = NEW.spot_id;
END;
```

---

## 5.5.2 Esquema Relacional Completo

A continuación se presenta el esquema relacional completo con todas las tablas, atributos, claves primarias, claves foráneas y restricciones:

### Tabla: USERS
```
users (
    id: UUID [PK],
    email: VARCHAR(255) [UNIQUE, NOT NULL],
    password: VARCHAR(255) [NOT NULL],
    full_name: VARCHAR(100) [NOT NULL],
    role: VARCHAR(20) [DEFAULT 'user'],
    avatar_url: VARCHAR(500),
    email_verified: BOOLEAN [DEFAULT false],
    created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP],
    updated_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
)
```

### Tabla: CATEGORIES
```
categories (
    id: INT [PK, AUTO_INCREMENT],
    name: VARCHAR(50) [UNIQUE, NOT NULL],
    slug: VARCHAR(50) [UNIQUE, NOT NULL],
    icon: VARCHAR(50),
    color: VARCHAR(7),
    description: TEXT
)
```

### Tabla: SPOTS
```
spots (
    id: UUID [PK],
    user_id: UUID [FK → users.id, NOT NULL, ON DELETE CASCADE],
    category_id: INT [FK → categories.id, ON DELETE SET NULL],
    title: VARCHAR(200) [NOT NULL],
    description: TEXT,
    latitude: DECIMAL(10,8) [NOT NULL, CHECK >= -90 AND <= 90],
    longitude: DECIMAL(11,8) [NOT NULL, CHECK >= -180 AND <= 180],
    image_url: VARCHAR(500),
    address: VARCHAR(500),
    rating_avg: DECIMAL(2,1) [DEFAULT 0, CHECK >= 0 AND <= 5],
    rating_count: INT [DEFAULT 0],
    views: INT [DEFAULT 0],
    status: VARCHAR(20) [DEFAULT 'active'],
    created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP],
    updated_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
)
```

### Tabla: COMMENTS
```
comments (
    id: UUID [PK],
    user_id: UUID [FK → users.id, NOT NULL, ON DELETE CASCADE],
    spot_id: UUID [FK → spots.id, NOT NULL, ON DELETE CASCADE],
    parent_id: UUID [FK → comments.id, ON DELETE CASCADE],
    text: TEXT [NOT NULL],
    likes: INT [DEFAULT 0],
    created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP],
    updated_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
)
```

### Tabla: RATINGS
```
ratings (
    id: INT [PK, AUTO_INCREMENT],
    user_id: UUID [FK → users.id, NOT NULL, ON DELETE CASCADE],
    spot_id: UUID [FK → spots.id, NOT NULL, ON DELETE CASCADE],
    rating: TINYINT [NOT NULL, CHECK >= 1 AND <= 5],
    created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP],
    
    UNIQUE (user_id, spot_id)
)
```

### Tabla: FAVORITES
```
favorites (
    id: INT [PK, AUTO_INCREMENT],
    user_id: UUID [FK → users.id, NOT NULL, ON DELETE CASCADE],
    spot_id: UUID [FK → spots.id, NOT NULL, ON DELETE CASCADE],
    created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP],
    
    UNIQUE (user_id, spot_id)
)
```

### Tabla: REPORTS
```
reports (
    id: UUID [PK],
    user_id: UUID [FK → users.id, NOT NULL, ON DELETE CASCADE],
    spot_id: UUID [FK → spots.id, ON DELETE CASCADE],
    comment_id: UUID [FK → comments.id, ON DELETE CASCADE],
    reason: VARCHAR(20) [NOT NULL],
    description: TEXT,
    status: VARCHAR(20) [DEFAULT 'pending'],
    created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP],
    resolved_at: TIMESTAMP,
    resolved_by: UUID [FK → users.id, ON DELETE SET NULL]
)
```

### Tabla: TAGS
```
tags (
    id: INT [PK, AUTO_INCREMENT],
    name: VARCHAR(50) [UNIQUE, NOT NULL],
    slug: VARCHAR(50) [UNIQUE, NOT NULL],
    usage_count: INT [DEFAULT 0]
)
```

### Tabla: SPOT_TAGS (tabla intermedia)
```
spot_tags (
    id: INT [PK, AUTO_INCREMENT],
    spot_id: UUID [FK → spots.id, NOT NULL, ON DELETE CASCADE],
    tag_id: INT [FK → tags.id, NOT NULL, ON DELETE CASCADE],
    
    UNIQUE (spot_id, tag_id)
)
```

### Tabla: IMAGES
```
images (
    id: UUID [PK],
    spot_id: UUID [FK → spots.id, NOT NULL, ON DELETE CASCADE],
    url: VARCHAR(500) [NOT NULL],
    caption: VARCHAR(200),
    order: INT [DEFAULT 1],
    created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
)
```

### Tabla: NOTIFICATIONS
```
notifications (
    id: UUID [PK],
    user_id: UUID [FK → users.id, NOT NULL, ON DELETE CASCADE],
    type: VARCHAR(20) [NOT NULL],
    title: VARCHAR(100) [NOT NULL],
    message: TEXT,
    link: VARCHAR(500),
    read: BOOLEAN [DEFAULT false],
    created_at: TIMESTAMP [DEFAULT CURRENT_TIMESTAMP]
)
```

---

## 5.5.3 Diagrama Relacional

> **NOTA PARA WORD**: Insertar aquí el diagrama relacional como imagen.
> 
> **Instrucciones para crear el diagrama**:
> - Usar la misma herramienta que para el E/R (Draw.io, Lucidchart, ERDPlus)
> - Crear tablas con formato relacional:
>   * Nombre de tabla en encabezado
>   * Listar todos los atributos
>   * Marcar PRIMARY KEY con (PK)
>   * Marcar FOREIGN KEY con (FK)
>   * Marcar UNIQUE con (U)
> - Conectar con flechas las FOREIGN KEY a sus PRIMARY KEY de referencia
> - Indicar ON DELETE CASCADE / SET NULL en las líneas
> - Agrupar tablas relacionadas visualmente cerca
> - Exportar como PNG o JPG en alta resolución

**Descripción del diagrama**:
- USERS en el centro superior
- SPOTS como tabla central
- Tablas relacionadas (COMMENTS, RATINGS, FAVORITES, IMAGES) alrededor de SPOTS
- CATEGORIES a la izquierda de SPOTS
- TAGS y SPOT_TAGS a la derecha
- REPORTS y NOTIFICATIONS abajo
- Todas las FK dibujadas con flechas desde la tabla que contiene la FK hacia la tabla referenciada

---

## 5.5.4 Explicación de ON DELETE y ON UPDATE

Las cláusulas ON DELETE y ON UPDATE definen el comportamiento automático cuando se elimina o actualiza un registro referenciado:

### ON DELETE CASCADE

**Uso**: `ON DELETE CASCADE`

**Significado**: Cuando se elimina un registro padre, se eliminan automáticamente todos los registros hijos relacionados (borrado en cascada).

**Ejemplos en SpotMap**:

```sql
-- Si se elimina un usuario, se eliminan todos sus spots
spots.user_id → users.id ON DELETE CASCADE

-- Si se elimina un spot, se eliminan todos sus comentarios
comments.spot_id → spots.id ON DELETE CASCADE

-- Si se elimina un spot, se eliminan todas sus valoraciones
ratings.spot_id → spots.id ON DELETE CASCADE
```

**Justificación**: Mantiene la integridad referencial automáticamente. Si un usuario se da de baja, todo su contenido debe eliminarse.

### ON DELETE SET NULL

**Uso**: `ON DELETE SET NULL`

**Significado**: Cuando se elimina un registro padre, las claves foráneas de los registros hijos se establecen a NULL (en lugar de eliminarlos).

**Ejemplo en SpotMap**:

```sql
-- Si se elimina una categoría, los spots mantienen pero sin categoría
spots.category_id → categories.id ON DELETE SET NULL
```

**Justificación**: Se prefiere mantener los spots aunque su categoría desaparezca. La categoría puede asignarse posteriormente.

### ON DELETE RESTRICT (por defecto)

**Uso**: `ON DELETE RESTRICT` o sin especificar

**Significado**: Impide eliminar un registro padre si existen registros hijos relacionados.

**Ejemplo hipotético**:
```sql
-- No permitir eliminar una categoría si tiene spots asociados
spots.category_id → categories.id ON DELETE RESTRICT
```

**Justificación**: Fuerza a resolver manualmente las dependencias antes de eliminar.

### Tabla resumen de decisiones en SpotMap

| Relación | ON DELETE | Justificación |
|----------|-----------|---------------|
| spots.user_id → users | CASCADE | El contenido de un usuario se elimina con él |
| spots.category_id → categories | SET NULL | Los spots se mantienen sin categoría |
| comments.user_id → users | CASCADE | Los comentarios se eliminan con el usuario |
| comments.spot_id → spots | CASCADE | Los comentarios se eliminan con el spot |
| comments.parent_id → comments | CASCADE | Las respuestas se eliminan con el comentario padre |
| ratings.user_id → users | CASCADE | Las valoraciones se eliminan con el usuario |
| ratings.spot_id → spots | CASCADE | Las valoraciones se eliminan con el spot |
| favorites.user_id → users | CASCADE | Los favoritos se eliminan con el usuario |
| favorites.spot_id → spots | CASCADE | Los favoritos se eliminan con el spot |
| spot_tags.spot_id → spots | CASCADE | Las etiquetas se eliminan con el spot |
| images.spot_id → spots | CASCADE | Las imágenes se eliminan con el spot |
| notifications.user_id → users | CASCADE | Las notificaciones se eliminan con el usuario |
| reports.resolved_by → users | SET NULL | Se mantiene el reporte aunque el moderador se elimine |

---

## 5.5.5 Normalización del Modelo

El modelo relacional de SpotMap se encuentra en **Tercera Forma Normal (3NF)**, cumpliendo todos los requisitos de calidad de diseño de bases de datos relacionales.

### Primera Forma Normal (1FN)

**Requisito**: Todos los atributos deben contener valores atómicos (indivisibles).

**Cumplimiento en SpotMap**:
✅ Ninguna columna contiene valores múltiples o listas
✅ Cada celda contiene un único valor
✅ No existen grupos repetitivos

**Ejemplo correcto**:
```
spots.title = "Mirador del Alcázar"  ✅ Valor atómico
```

**Ejemplo incorrecto (violación 1FN)**:
```
spots.tags = "atardecer, montaña, vista"  ❌ Lista de valores
```

**Solución aplicada**: La relación N:M entre spots y tags usa tabla intermedia `spot_tags`, donde cada fila contiene una única asociación spot-tag.

### Segunda Forma Normal (2FN)

**Requisito**: Estar en 1FN + Todos los atributos no clave deben depender completamente de la clave primaria (no dependencias parciales).

**Cumplimiento en SpotMap**:
✅ Todas las tablas tienen claves primarias simples (UUID o INT), no compuestas
✅ No existen dependencias parciales porque no hay claves compuestas
✅ Única tabla con clave compuesta lógica es `spot_tags`, pero usa ID independiente

**Ejemplo de violación hipotética (NO presente en SpotMap)**:
```
ratings (
    user_id, spot_id [PK compuesta],
    rating,
    user_name  ❌ Depende solo de user_id, no de la PK completa
)
```

**Solución aplicada**: `user_name` está en la tabla `users`, no en `ratings`.

### Tercera Forma Normal (3FN)

**Requisito**: Estar en 2FN + No deben existir dependencias transitivas (atributos que dependan de otros atributos no clave).

**Cumplimiento en SpotMap**:
✅ Todos los atributos no clave dependen únicamente de la clave primaria
✅ No existen dependencias transitivas

**Ejemplo de violación hipotética (NO presente en SpotMap)**:
```
spots (
    id [PK],
    category_id,
    category_name  ❌ Depende de category_id (transitiva)
)
```

**Solución aplicada**: `category_name` está en la tabla `categories`, no en `spots`. En `spots` solo existe la FK `category_id`.

### Desnormalización Controlada

**Campos desnormalizados intencionalmente**:

```
spots.rating_avg    -- Media calculada de ratings
spots.rating_count  -- Contador de ratings
tags.usage_count    -- Contador de spots con este tag
comments.likes      -- Contador de likes
```

**Justificación**: Estos campos calculados se almacenan por razones de **rendimiento**:

1. **Evitar JOIN costosos**: Calcular `rating_avg` requeriría un JOIN con `ratings` en cada consulta
2. **Consultas frecuentes**: La media de valoraciones se muestra en listados de spots
3. **Mantenimiento automático**: Se actualizan mediante triggers, manteniendo consistencia
4. **Trade-off aceptable**: El beneficio en rendimiento supera el costo de almacenamiento extra

**Ejemplo de trigger para mantener consistencia**:
```sql
CREATE TRIGGER update_spot_rating_avg
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
BEGIN
    UPDATE spots
    SET rating_avg = (SELECT AVG(rating) FROM ratings WHERE spot_id = NEW.spot_id),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE spot_id = NEW.spot_id)
    WHERE id = NEW.spot_id;
END;
```

---

**FIN DE LA SECCIÓN 5: MODELO ENTIDAD-RELACIÓN Y MODELO RELACIONAL**

# 6. DIAGRAMAS DE PROCESOS

Los diagramas de procesos nos ayudan a entender cómo funciona el sistema desde diferentes perspectivas. Hemos desarrollado diagramas de clases para mostrar la estructura del código, y casos de uso para representar las interacciones entre usuarios y la aplicación.

## 6.1 Diagramas de Clase

Resumen rápido y visual del modelo de clases.

Clases principales (qué hace cada una):
- User: usuarios, roles y perfil.
- Spot: puntos fotográficos, geolocalización e imagen principal.
- Comment: comentarios e hilos.
- Rating: valoraciones 1–5.
- Category: clasificación por tipo.
- Favorite: guardados del usuario.
- Otras de soporte: Tag, Report, Image, Notification.

Relaciones clave:
- User 1:N Spot; Spot N:1 Category
- Spot 1:N Comment (y Comment 1:N Comment)
- Spot 1:N Rating; User 1:N Rating
- User 1:N Favorite; Favorite N:1 Spot

[Inserta aquí el diagrama UML de clases (imagen). Sugerencia: Draw.io → plantilla "UML Class Diagram"].

---

---
