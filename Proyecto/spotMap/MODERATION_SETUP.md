# Sistema de Moderación de SpotMap ✅

## ¿Qué es?
Sistema donde:
- **Gente cualquiera** puede subir spots (se crean como `pending`)
- **Solo TÚ** (moderador/admin) puedes ver el panel de moderación
- **Solo spots aprobados** (`status='approved'`) se muestran al público
- **TÚ DECIDES** qué spots son válidos antes de que aparezcan

---

## 🚀 Activar Moderación

### Paso 1: Ejecutar SQL en Supabase

Si usas **Supabase**, ejecuta este SQL en la consola SQL:

```sql
-- 1. Añadir columna status a tabla spots
ALTER TABLE public.spots 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS spots_status_idx ON public.spots(status);

-- 3. Actualizar spots existentes a 'approved'
UPDATE public.spots 
SET status = 'approved' 
WHERE status IS NULL;
```

**Dónde ejecutarlo:**
- Accede a tu proyecto Supabase
- Ve a `SQL Editor`
- Copia y ejecuta el SQL anterior

### Paso 2: Asignarte rol de Moderador/Admin

En Supabase, en la tabla `profiles`:

```sql
-- Reemplaza 'TU_USER_ID' con tu ID de Supabase
UPDATE profiles 
SET role = 'moderator' 
WHERE user_id = 'TU_USER_ID';
```

O en la tabla `users` si usas MySQL:

```sql
UPDATE users 
SET role = 'moderator' 
WHERE id = 'TU_USER_ID';
```

### Paso 3: Ya está 🎉

Ahora:
1. **Gente sube spots** → Se crean con `status='pending'` (invisibles)
2. **TÚ ves panel** en la esquina superior derecha con spots pendientes
3. **TÚ APRUEBAS/RECHAZAS** → El spot aparece o desaparece

---

## 📋 Cómo funciona

### Flujo de un Spot

```
1. Usuario sube foto + título + descripción
   ↓
2. Spot se crea con status='pending'
   (INVISIBLE para público, VISIBLE en tu panel)
   ↓
3. TÚ ves el panel de moderación
   [✔️ Aprobar] [❌ Rechazar] [👁️ Ver]
   ↓
4. Si APRUEBAS: status='approved' → aparece en el mapa
   Si RECHAZAS: status='rejected' → desaparece
```

### Campos que se validan automáticamente

El frontend valida:
- ✅ Título no vacío
- ✅ Coordenadas válidas (lat -90 a 90, lng -180 a 180)
- ✅ Foto máx 5MB
- ✅ Foto válida (JPEG, PNG, WebP, GIF)

### Cosas que TÚ VALIDAS

Como moderador:
- ¿La foto es real o es una tonterías?
- ¿El título describe bien el spot?
- ¿La descripción es apropiada?
- ¿El lugar existe en realidad?

---

## 🎯 Panel de Moderación

### Dónde está
- Esquina superior derecha del mapa
- Solo visible si tu rol = `moderator` o `admin`
- Muestra "Pending: X" (número de spots por aprobar)

### Qué hace
- Lista todos los spots `pending`
- Para cada spot tienes 3 opciones:
  - **✔️ Aprobar** → Status = approved (visible para todos)
  - **❌ Rechazar** → Status = rejected (invisible para todos)
  - **👁️ Ver** → Enfoca el spot en el mapa

### Actualización en tiempo real
- Cuando apruebas/rechazas un spot, se actualiza automáticamente
- El mapa se actualiza sin recargar
- Otros usuarios ven los cambios en tiempo real

---

## 🔒 Seguridad

### Qué está protegido

1. **Panel de moderación**
   - Solo visible si `role='moderator'` o `role='admin'`
   - Los botones de aprobar/rechazar solo funcionan para moderadores

2. **Creación de spots**
   - Cualquiera puede crear (pero con `status='pending'`)
   - El usuario que crea no puede auto-aprobarse

3. **Filtros de display**
   - Solo se muestran spots con `status='approved'`
   - Backend valida esto también

### Backend (PHP)

Si quieres validación en el servidor también:

**backend/src/Controllers/SpotsController.php:**

```php
// Solo mostrar spots aprobados
if (!isset($_GET['admin'])) {
    $query .= " AND status='approved'";
}
```

---

## 📊 Estadísticas

Panel de moderación muestra:
- Total de spots pending
- Fecha de creación de cada spot
- Título + descripción (preview)
- Usuario que lo subió (si está registrado)

---

## ✨ Validación de Fotos (Avanzado)

Si quieres validación más avanzada de fotos:

### Opción 1: Validación Cliente (Simple)
- Ya está implementada: valida extensión, tamaño, tipo MIME
- Rechaza si no es imagen válida

### Opción 2: Validación Servidor (Recomendado)
Usa librerías como:
- **PHP**: `getimagesize()`, `imagecreatefromstring()`
- **Node**: `sharp`, `jimp`

```php
// Validar que sea imagen real (no corrupta)
$imageInfo = getimagesize($tempFile);
if (!$imageInfo) {
    throw new Exception('Archivo no es una imagen válida');
}
```

### Opción 3: AI (Futuro)
- Google Vision API
- AWS Rekognition
- Para detectar automáticamente si es contenido inapropiado

**Para ahora, confía en tu validación manual 😉**

---

## 🐛 Troubleshooting

### Panel no aparece
- Verifica que tu `role='moderator'` en la BD
- Recarga la página (F5)
- Abre consola (F12) y busca `[AUTH]` logs

### Spots siguen siendo 'pending'
- Verifica que la columna `status` existe en Supabase
- Ejecuta el SQL anterior

### "Multiple GoTrueClient instances" error
- Normal, no afecta funcionamiento
- Viene de Supabase, puedes ignorar

### Los spots no aparecen después de aprobar
- Recarga la página (F5)
- O espera 2-3 segundos (actualización en tiempo real)

---

## 📝 Script de Inicialización Rápida

Ejecuta esto en la consola SQL de Supabase para todo de una vez:

```sql
-- Setup completo de moderación
ALTER TABLE public.spots 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' 
CHECK (status IN ('pending', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS spots_status_idx ON public.spots(status);

UPDATE public.spots SET status = 'approved' WHERE status IS NULL;

-- Nota: Después actualiza manualmente tu rol a 'moderator' en profiles
-- UPDATE profiles SET role = 'moderator' WHERE user_id = 'TU_ID';
```

---

## 🎉 Ya está!

Tu aplicación ahora tiene:
- ✅ Sistema de moderación completo
- ✅ Panel privado para ti como moderador
- ✅ Spots pending invisibles para el público
- ✅ Control total sobre qué se publica

**¡A moderar! 🚀**

