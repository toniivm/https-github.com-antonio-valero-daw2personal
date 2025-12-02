# 2. MODELO RELACIONAL

## 2.1 Introducción al Paso E/R → Relacional

El paso del **modelo Entidad-Relación** al **modelo Relacional** consiste en transformar entidades, atributos y relaciones en **tablas (relaciones)**, **columnas (atributos)** y **restricciones de integridad** siguiendo reglas normalizadas.

### Reglas de Transformación Aplicadas

#### **Regla 1: Entidades → Tablas**
Cada entidad se convierte en una tabla con el mismo nombre (en plural y snake_case).

#### **Regla 2: Atributos → Columnas**
Los atributos de cada entidad se convierten en columnas de la tabla.

#### **Regla 3: Claves Primarias**
La clave primaria de la entidad se convierte en PRIMARY KEY de la tabla.

#### **Regla 4: Relaciones 1:N**
La clave primaria del lado "1" se convierte en Foreign Key en el lado "N".

#### **Regla 5: Relaciones N:M**
Se crea una tabla intermedia con las claves primarias de ambas entidades como Foreign Keys.

#### **Regla 6: Relaciones 1:1**
Se implementan como 1:N donde el lado "1" obligatorio contiene la FK.

---

## 2.2 Esquema Relacional Completo

### **USERS** (Usuarios del sistema)

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password            VARCHAR(255) NOT NULL,
    full_name           VARCHAR(100) NOT NULL,
    role                VARCHAR(20) DEFAULT 'user' 
                        CHECK (role IN ('user', 'moderator', 'admin')),
    avatar_url          VARCHAR(500),
    email_verified      BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

**Transformación E/R:**
- Entidad `USER` → Tabla `users`
- Atributos directos → Columnas
- `id` como PK (UUID para seguridad y escalabilidad)
- `email` con constraint UNIQUE (login único)
- `role` con ENUM para control de valores

---

### **CATEGORIES** (Categorías de spots)

```sql
CREATE TABLE categories (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(50) UNIQUE NOT NULL,
    slug                VARCHAR(50) UNIQUE NOT NULL,
    icon                VARCHAR(50),
    color               VARCHAR(7) DEFAULT '#0ea5e9',
    description         TEXT,
    
    INDEX idx_slug (slug)
);
```

**Transformación E/R:**
- Entidad `CATEGORY` → Tabla `categories`
- `id` como PK (INT secuencial por ser catálogo pequeño)
- `slug` para URLs amigables (SEO)
- `icon` y `color` para representación visual

---

### **SPOTS** (Puntos fotográficos)

```sql
CREATE TABLE spots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    category_id         INT,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    latitude            DECIMAL(10, 8) NOT NULL,
    longitude           DECIMAL(11, 8) NOT NULL,
    image_url           VARCHAR(500),
    address             VARCHAR(500),
    rating_avg          DECIMAL(2, 1) DEFAULT 0.0,
    rating_count        INT DEFAULT 0,
    views               INT DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'active' 
                        CHECK (status IN ('active', 'pending', 'deleted')),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    INDEX idx_location (latitude, longitude),
    INDEX idx_rating (rating_avg DESC),
    INDEX idx_created (created_at DESC),
    INDEX idx_category_rating (category_id, rating_avg DESC),
    INDEX idx_status (status),
    
    CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT check_rating_avg CHECK (rating_avg >= 0 AND rating_avg <= 5)
);
```

**Transformación E/R:**
- Entidad `SPOT` → Tabla `spots`
- Relación `USER → SPOT (1:N)` → FK `user_id`
- Relación `CATEGORY → SPOT (1:N)` → FK `category_id`
- `latitude` y `longitude` con DECIMAL(precisión) para geolocalización exacta
- Índice compuesto `(latitude, longitude)` para búsquedas geoespaciales
- `rating_avg` y `rating_count` desnormalizados para rendimiento

---

### **COMMENTS** (Comentarios en spots)

```sql
CREATE TABLE comments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    spot_id             UUID NOT NULL,
    parent_id           UUID NULL,
    text                TEXT NOT NULL,
    likes               INT DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    
    INDEX idx_spot_created (spot_id, created_at DESC),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id)
);
```

**Transformación E/R:**
- Entidad `COMMENT` → Tabla `comments`
- Relación `USER → COMMENT (1:N)` → FK `user_id`
- Relación `SPOT → COMMENT (1:N)` → FK `spot_id`
- **Auto-relación** `COMMENT → COMMENT (1:N)` → FK `parent_id` (nullable)
  - `parent_id = NULL` → Comentario raíz
  - `parent_id = <uuid>` → Respuesta anidada

---

### **RATINGS** (Valoraciones de spots)

```sql
CREATE TABLE ratings (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             UUID NOT NULL,
    spot_id             UUID NOT NULL,
    rating              TINYINT NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_spot (user_id, spot_id),
    INDEX idx_spot (spot_id),
    
    CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5)
);
```

**Transformación E/R:**
- Entidad `RATING` → Tabla `ratings`
- Relación `USER → RATING (1:N)` → FK `user_id`
- Relación `SPOT → RATING (1:N)` → FK `spot_id`
- **UNIQUE(user_id, spot_id)** → Un usuario solo puede valorar un spot una vez

---

### **FAVORITES** (Spots favoritos de usuarios)

```sql
CREATE TABLE favorites (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             UUID NOT NULL,
    spot_id             UUID NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_spot (user_id, spot_id),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_spot (spot_id)
);
```

**Transformación E/R:**
- Entidad `FAVORITE` → Tabla `favorites`
- Relación `USER → FAVORITE (1:N)` → FK `user_id`
- Relación `SPOT → FAVORITE (1:N)` → FK `spot_id`
- **UNIQUE(user_id, spot_id)** → Un usuario no puede guardar el mismo spot dos veces

---

### **REPORTS** (Reportes de contenido inapropiado)

```sql
CREATE TABLE reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    spot_id             UUID NULL,
    comment_id          UUID NULL,
    reason              VARCHAR(50) NOT NULL 
                        CHECK (reason IN ('spam', 'inappropriate', 'duplicate', 'fake', 'other')),
    description         TEXT,
    status              VARCHAR(20) DEFAULT 'pending' 
                        CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at         TIMESTAMP NULL,
    resolved_by         UUID NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_created (created_at DESC),
    INDEX idx_spot (spot_id),
    INDEX idx_comment (comment_id),
    
    CONSTRAINT check_content CHECK (spot_id IS NOT NULL OR comment_id IS NOT NULL)
);
```

**Transformación E/R:**
- Entidad `REPORT` → Tabla `reports`
- Relación `USER → REPORT (1:N)` → FK `user_id`
- Relación `SPOT → REPORT (1:N)` → FK `spot_id` (nullable)
- Relación `COMMENT → REPORT (1:N)` → FK `comment_id` (nullable)
- **CHECK(spot_id OR comment_id NOT NULL)** → Al menos uno debe estar presente

---

### **TAGS** (Etiquetas de búsqueda)

```sql
CREATE TABLE tags (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(50) UNIQUE NOT NULL,
    slug                VARCHAR(50) UNIQUE NOT NULL,
    usage_count         INT DEFAULT 0,
    
    INDEX idx_name (name),
    INDEX idx_slug (slug),
    INDEX idx_usage (usage_count DESC)
);
```

**Transformación E/R:**
- Entidad `TAG` → Tabla `tags`
- `usage_count` para ordenar tags populares

---

### **SPOT_TAGS** (Relación N:M entre Spots y Tags)

```sql
CREATE TABLE spot_tags (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    spot_id             UUID NOT NULL,
    tag_id              INT NOT NULL,
    
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_spot_tag (spot_id, tag_id),
    INDEX idx_tag (tag_id),
    INDEX idx_spot (spot_id)
);
```

**Transformación E/R:**
- Relación `SPOT ↔ TAG (N:M)` → Tabla intermedia `spot_tags`
- FK `spot_id` + FK `tag_id`
- **UNIQUE(spot_id, tag_id)** → Un spot no puede tener el mismo tag duplicado

---

### **IMAGES** (Galería de imágenes por spot)

```sql
CREATE TABLE images (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id             UUID NOT NULL,
    url                 VARCHAR(500) NOT NULL,
    caption             VARCHAR(200),
    order_index         INT DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    
    INDEX idx_spot_order (spot_id, order_index ASC)
);
```

**Transformación E/R:**
- Entidad `IMAGE` → Tabla `images`
- Relación `SPOT → IMAGE (1:N)` → FK `spot_id`
- `order_index` para ordenar imágenes en galerías

---

### **NOTIFICATIONS** (Sistema de notificaciones)

```sql
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    type                VARCHAR(50) NOT NULL 
                        CHECK (type IN ('comment', 'like', 'favorite', 'report', 'system')),
    title               VARCHAR(100) NOT NULL,
    message             TEXT NOT NULL,
    link                VARCHAR(500),
    read_status         BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_read (user_id, read_status),
    INDEX idx_created (created_at DESC)
);
```

**Transformación E/R:**
- Entidad `NOTIFICATION` → Tabla `notifications`
- Relación `USER → NOTIFICATION (1:N)` → FK `user_id`
- Índice compuesto `(user_id, read_status)` para queries eficientes

---

## 2.3 Explicación del Proceso de Transformación

### **Ejemplo 1: Relación 1:N (USER → SPOT)**

**Modelo E/R:**
```
USER (1) ──── creates ──── (N) SPOT
```

**Transformación:**
1. Entidad `USER` → Tabla `users` con PK `id`
2. Entidad `SPOT` → Tabla `spots` con PK `id`
3. Relación `creates` → FK `user_id` en tabla `spots`
4. Restricción: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

**Resultado:**
```sql
spots (
    id UUID PK,
    user_id UUID FK → users(id),  -- ← Relación 1:N
    title VARCHAR(200),
    ...
)
```

---

### **Ejemplo 2: Relación N:M (SPOT ↔ TAG)**

**Modelo E/R:**
```
SPOT (N) ──── is_tagged_with ──── (M) TAG
```

**Transformación:**
1. Entidad `SPOT` → Tabla `spots` con PK `id`
2. Entidad `TAG` → Tabla `tags` con PK `id`
3. Relación N:M → **Tabla intermedia** `spot_tags`
4. `spot_tags` contiene:
   - `spot_id` FK → `spots(id)`
   - `tag_id` FK → `tags(id)`
   - UNIQUE(spot_id, tag_id)

**Resultado:**
```sql
spot_tags (
    id INT PK,
    spot_id UUID FK → spots(id),   -- ← Relación N:M
    tag_id INT FK → tags(id),      -- ← Relación N:M
    UNIQUE(spot_id, tag_id)
)
```

---

### **Ejemplo 3: Auto-Relación (COMMENT → COMMENT)**

**Modelo E/R:**
```
COMMENT (1) ──── replies_to ──── (N) COMMENT (self)
```

**Transformación:**
1. Entidad `COMMENT` → Tabla `comments` con PK `id`
2. Auto-relación → FK `parent_id` **dentro de la misma tabla**
3. `parent_id` es **nullable**:
   - `NULL` → Comentario raíz (sin padre)
   - `<uuid>` → Respuesta a otro comentario

**Resultado:**
```sql
comments (
    id UUID PK,
    parent_id UUID FK → comments(id) NULL,  -- ← Auto-relación
    user_id UUID FK → users(id),
    spot_id UUID FK → spots(id),
    text TEXT,
    ...
)
```

**Ejemplo de datos:**
```
| id  | parent_id | text                          |
|-----|-----------|-------------------------------|
| 001 | NULL      | "Amazing spot!"               | ← Comentario raíz
| 002 | 001       | "I agree!"                    | ← Respuesta a 001
| 003 | 001       | "Best place ever"             | ← Respuesta a 001
| 004 | 002       | "Me too"                      | ← Respuesta a 002 (anidado)
```

---

## 2.4 Integridad Referencial: ON DELETE

### **ON DELETE CASCADE**
Cuando se elimina el registro padre, se eliminan automáticamente los hijos.

**Aplicado en:**
- `spots.user_id` → Si se elimina un usuario, se eliminan sus spots
- `comments.user_id` → Si se elimina un usuario, se eliminan sus comentarios
- `ratings.user_id` → Si se elimina un usuario, se eliminan sus valoraciones
- `favorites.user_id` → Si se elimina un usuario, se eliminan sus favoritos

**Ejemplo:**
```sql
-- Usuario crea un spot
INSERT INTO users (id, email) VALUES ('user-123', 'john@example.com');
INSERT INTO spots (id, user_id, title) VALUES ('spot-456', 'user-123', 'Beach');

-- Se elimina el usuario
DELETE FROM users WHERE id = 'user-123';

-- Resultado: El spot 'spot-456' se elimina automáticamente (CASCADE)
```

---

### **ON DELETE SET NULL**
Cuando se elimina el registro padre, la FK en el hijo se pone en `NULL`.

**Aplicado en:**
- `spots.category_id` → Si se elimina una categoría, los spots quedan sin categoría (`category_id = NULL`)
- `reports.resolved_by` → Si se elimina el moderador, el reporte queda sin resolver pero se mantiene el historial

**Ejemplo:**
```sql
-- Spot con categoría "Playa"
INSERT INTO categories (id, name) VALUES (1, 'Playa');
INSERT INTO spots (id, category_id, title) VALUES ('spot-789', 1, 'Cala secreta');

-- Se elimina la categoría "Playa"
DELETE FROM categories WHERE id = 1;

-- Resultado: spot-789 sigue existiendo pero category_id = NULL
```

---

## 2.5 Normalización del Esquema Relacional

### **Primera Forma Normal (1FN)** ✅
- ✅ Todos los atributos son atómicos (no hay arrays ni listas)
- ✅ No hay grupos repetitivos
- ✅ Cada tabla tiene una clave primaria

**Ejemplo de violación (NO en SpotMap):**
```sql
-- ❌ INCORRECTO: Atributo no atómico
spots (id, title, tags VARCHAR) → "playa,atardecer,arena"

-- ✅ CORRECTO: Tabla intermedia
spots (id, title)
spot_tags (spot_id, tag_id)
tags (id, name)
```

---

### **Segunda Forma Normal (2FN)** ✅
- ✅ Está en 1FN
- ✅ Todos los atributos no clave dependen completamente de la PK
- ✅ No hay dependencias parciales

**Ejemplo de violación (NO en SpotMap):**
```sql
-- ❌ INCORRECTO: Dependencia parcial
spot_tags (spot_id, tag_id, tag_name, tag_usage)
-- tag_name depende solo de tag_id, no de (spot_id, tag_id)

-- ✅ CORRECTO: Separar en dos tablas
spot_tags (spot_id, tag_id)
tags (tag_id, name, usage_count)
```

---

### **Tercera Forma Normal (3FN)** ✅
- ✅ Está en 2FN
- ✅ No hay dependencias transitivas
- ✅ Todos los atributos no clave dependen **únicamente** de la PK

**Desnormalización controlada:**
- `spots.rating_avg` y `spots.rating_count` están desnormalizados intencionalmente
- **Justificación:** Calcular la media de ratings en cada query sería muy costoso
- **Solución:** Trigger que actualiza estos campos al insertar/actualizar/eliminar ratings

```sql
DELIMITER $$

CREATE TRIGGER update_spot_rating_after_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    UPDATE spots
    SET rating_count = (SELECT COUNT(*) FROM ratings WHERE spot_id = NEW.spot_id),
        rating_avg = (SELECT AVG(rating) FROM ratings WHERE spot_id = NEW.spot_id)
    WHERE id = NEW.spot_id;
END$$

CREATE TRIGGER update_spot_rating_after_delete
AFTER DELETE ON ratings
FOR EACH ROW
BEGIN
    UPDATE spots
    SET rating_count = (SELECT COUNT(*) FROM ratings WHERE spot_id = OLD.spot_id),
        rating_avg = COALESCE((SELECT AVG(rating) FROM ratings WHERE spot_id = OLD.spot_id), 0)
    WHERE id = OLD.spot_id;
END$$

DELIMITER ;
```

---

## 2.6 Diagrama Relacional Simplificado

```
┌─────────────────────────────────────────────────────────────┐
│                         users                                │
│  PK: id (UUID)                                              │
│  UK: email                                                   │
│  Attrs: password, full_name, role, avatar_url, ...         │
└───────────┬─────────────────────────────────────────────────┘
            │
            ├──────────────────────────────────────────────┐
            │                                              │
            │ 1:N (creates)                               │ 1:N (writes)
            │                                              │
            ▼                                              ▼
┌───────────────────────┐                      ┌──────────────────┐
│        spots          │                      │    comments      │
│  PK: id (UUID)        │◄─────────────────────│  PK: id (UUID)   │
│  FK: user_id          │ 1:N (has)            │  FK: user_id     │
│  FK: category_id      │                      │  FK: spot_id     │
│  Attrs: title, desc,  │                      │  FK: parent_id   │◄─┐
│  lat, lng, rating...  │                      │  Attrs: text...  │  │
└───────┬───────────────┘                      └──────────────────┘  │
        │                                                             │
        │ 1:N                                            1:N (replies)
        │                                                             │
        ├─────────────┬─────────────┬─────────────┐                  │
        │             │             │             │                  │
        ▼             ▼             ▼             ▼                  │
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│ ratings  │  │favorites │  │ reports  │  │  images  │            │
│ PK: id   │  │ PK: id   │  │ PK: id   │  │ PK: id   │            │
│ FK: user │  │ FK: user │  │ FK: user │  │ FK: spot │            │
│ FK: spot │  │ FK: spot │  │ FK: spot │  │ Attrs... │            │
│ UK: (u,s)│  │ UK: (u,s)│  │ Attrs... │  └──────────┘            │
└──────────┘  └──────────┘  └──────────┘                           │
                                                                    │
┌──────────────────────────────────────────────────────────────────┘
│
│ N:M (spot_tags)
│
▼
┌────────────────┐       ┌──────────────┐
│   spot_tags    │       │     tags     │
│  PK: id        │       │  PK: id      │
│  FK: spot_id   ├──────►│  UK: name    │
│  FK: tag_id    │       │  Attrs: slug │
│  UK: (spot,tag)│       └──────────────┘
└────────────────┘
```

---

## 2.7 Scripts SQL de Creación Completos

### Script de creación de todas las tablas (orden correcto):

```sql
-- 1. Tabla independiente: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 2. Tabla independiente: categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#0ea5e9',
    description TEXT,
    INDEX idx_slug (slug)
);

-- 3. Tabla dependiente: spots (depende de users y categories)
CREATE TABLE spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    image_url VARCHAR(500),
    address VARCHAR(500),
    rating_avg DECIMAL(2, 1) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    views INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_location (latitude, longitude),
    INDEX idx_rating (rating_avg DESC),
    INDEX idx_created (created_at DESC),
    INDEX idx_category_rating (category_id, rating_avg DESC),
    INDEX idx_status (status),
    CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT check_rating_avg CHECK (rating_avg >= 0 AND rating_avg <= 5)
);

-- 4. Tabla dependiente: comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    spot_id UUID NOT NULL,
    parent_id UUID NULL,
    text TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_spot_created (spot_id, created_at DESC),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id)
);

-- 5. Tabla dependiente: ratings
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id UUID NOT NULL,
    spot_id UUID NOT NULL,
    rating TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_spot (user_id, spot_id),
    INDEX idx_spot (spot_id),
    CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5)
);

-- 6. Tabla dependiente: favorites
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id UUID NOT NULL,
    spot_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_spot (user_id, spot_id),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_spot (spot_id)
);

-- 7. Tabla dependiente: reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    spot_id UUID NULL,
    comment_id UUID NULL,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'duplicate', 'fake', 'other')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by UUID NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created (created_at DESC),
    INDEX idx_spot (spot_id),
    INDEX idx_comment (comment_id),
    CONSTRAINT check_content CHECK (spot_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- 8. Tabla independiente: tags
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    usage_count INT DEFAULT 0,
    INDEX idx_name (name),
    INDEX idx_slug (slug),
    INDEX idx_usage (usage_count DESC)
);

-- 9. Tabla intermedia: spot_tags
CREATE TABLE spot_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id UUID NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_spot_tag (spot_id, tag_id),
    INDEX idx_tag (tag_id),
    INDEX idx_spot (spot_id)
);

-- 10. Tabla dependiente: images
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID NOT NULL,
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(200),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    INDEX idx_spot_order (spot_id, order_index ASC)
);

-- 11. Tabla dependiente: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('comment', 'like', 'favorite', 'report', 'system')),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, read_status),
    INDEX idx_created (created_at DESC)
);
```

---

**Fin del Documento 2: Modelo Relacional**
