# 📸 Sistema de Fotos - SpotMap

## ¿Qué se implementó?

Se ha completado el sistema de subida de fotos para SpotMap. Ahora puedes:

1. **Subir una foto al crear un spot**
2. **Ver la foto en el popup del mapa**
3. **Guardar la ruta en la base de datos**

---

## 🏗️ Cambios Realizados

### Backend

#### 1. **Nuevo método en `SpotController.php`**
```php
public function uploadPhoto(int $id): void
```

**Funcionalidades:**
- Valida que el spot existe
- Acepta JPEG, PNG, WebP, GIF (máximo 5MB)
- Genera nombre de archivo seguro: `spot_{id}_{timestamp}.{ext}`
- Guarda en: `/backend/public/uploads/spots/`
- Actualiza la columna `image_path` en la BD
- Retorna el spot actualizado

#### 2. **Nuevo endpoint en router**
```
POST /spots/{id}/photo
```

**Ejemplo:**
```bash
curl -X POST \
  http://localhost/.../backend/public/index.php/spots/1/photo \
  -F "photo=@/ruta/a/imagen.jpg"
```

#### 3. **Carpetas creadas**
```
backend/public/uploads/
└── spots/        (aquí se guardan las fotos)
```

---

### Frontend

#### 1. **Actualizado `main.js`**

**Función `addMarker()` mejorada:**
```javascript
// Ahora muestra:
- Título
- Foto (si existe)
- Descripción
- Etiquetas
```

**Función de guardado mejorada:**
```javascript
1. Guarda el spot (GET ID)
2. Si hay foto, la sube al endpoint /spots/{id}/photo
3. Recarga todos los spots
4. Limpia el formulario
```

---

## 🚀 Cómo Usar

### Crear un spot con foto:

1. Abre el frontend: `http://localhost/...frontend/index.html`
2. Haz clic en **"Añadir spot"**
3. Completa el formulario:
   - ✅ **Título**: Obligatorio
   - ✅ **Descripción**: Opcional
   - ✅ **Foto**: Opcional (soporta JPG, PNG, WebP, GIF)
   - ✅ **Ubicación**: Requiere lat/lng
   - ✅ **Etiquetas**: Opcional, separadas por coma
4. Haz clic en **"Guardar"**
5. ✨ El spot aparecerá en el mapa **con la foto visible**

---

## 📊 Base de Datos

### Tabla: `spots`

La tabla ya tiene la columna `image_path`:

```sql
CREATE TABLE spots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  tags JSON NULL,
  category VARCHAR(100) NULL,
  image_path VARCHAR(255) NULL,        ← NUEVA/EXISTENTE
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔍 Respuesta de API

Cuando subes una foto, la respuesta incluye:

```json
{
  "id": 1,
  "title": "Skatepark Delicias",
  "description": "Bonito lugar para patinar",
  "lat": 41.6488,
  "lng": -0.8891,
  "tags": ["street", "bowl"],
  "category": "skatepark",
  "image_path": "/uploads/spots/spot_1_1731326400.jpg",
  "created_at": "2025-11-11 12:00:00",
  "updated_at": "2025-11-11 12:00:00"
}
```

---

## 🎨 Características del Popup

El popup ahora muestra:

```
┌─────────────────────┐
│ Título del Spot     │
│                     │
│   [  IMAGEN  ]      │ (200px max)
│                     │
│ Descripción breve   │
│ #tag1 #tag2         │
└─────────────────────┘
```

---

## 🔒 Validaciones

| Validación | Límite |
|-----------|--------|
| Tamaño máximo | 5 MB |
| Formatos | JPG, PNG, WebP, GIF |
| Ruta | `/uploads/spots/` |
| Nombrado | `spot_{id}_{timestamp}.{ext}` |

---

## 📂 Estructura de Carpetas

```
spotMap/
├── backend/
│   └── public/
│       ├── index.php (router actualizado)
│       └── uploads/
│           ├── .htaccess
│           └── spots/
│               └── spot_1_1731326400.jpg  ← Aquí van las fotos
│
├── frontend/
│   └── js/
│       └── main.js (actualizado)
```

---

## 🐛 Solución de Problemas

### "Error al subir foto"

**Causa:** Permisos de carpeta
```powershell
# Dar permisos a la carpeta
icacls "C:\xampp\htdocs\...\uploads" /grant Everyone:F /T
```

### "La foto no aparece en el popup"

**Causa:** `image_path` es NULL
```php
// Verifica en BD:
SELECT id, title, image_path FROM spots;
```

### "Error 413 - Payload Too Large"

**Causa:** Límite de Apache
```apache
# Aumentar en .htaccess
LimitRequestBody 10485760  # 10 MB
```

---

## ✅ Próximos Pasos Opcionales

1. **Miniaturas:** Generar thumbnails automáticas
2. **Galería:** Permitir múltiples fotos por spot
3. **Optimización:** Comprimir imágenes automáticamente
4. **Almacenamiento:** Usar cloud storage (AWS S3, etc)
5. **Edición:** Permitir cambiar foto de un spot existente

---

## 🎯 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/spots` | Obtiene todos los spots |
| `POST` | `/spots` | Crea un nuevo spot |
| `GET` | `/spots/{id}` | Obtiene un spot específico |
| `DELETE` | `/spots/{id}` | Elimina un spot |
| `POST` | `/spots/{id}/photo` | **NUEVO:** Sube foto a un spot |

---

*Implementado: 11 de noviembre de 2025*
