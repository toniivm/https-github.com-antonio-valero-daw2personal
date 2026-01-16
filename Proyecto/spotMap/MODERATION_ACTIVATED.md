# ✅ Sistema de Moderación Activado

## Cambios Implementados

### 1. **Flujo de Creación de Spots**
- Cuando alguien sube un spot → `status='pending'` (invisible)
- Gente ve solo spots `status='approved'` 
- TÚ ves panel de moderación con todos los pending

### 2. **Archivos Actualizados**

#### `frontend/js/supabaseSpots.js`
- `createSpotRecord()` ahora crea con `status='pending'`
- Spots nuevos no aparecen automáticamente

#### `frontend/js/supabaseClient.js`
- `fetchApprovedSpots()` filtra por `status='approved'`
- `listPendingSpots()` muestra solo spots pendientes

#### `frontend/js/ui.js`
- Import: `validateImage` para validar fotos
- En `handleAddSpotSubmit()`: valida que la foto sea real
- Si la foto es corrupta/inválida → rechaza la subida

### 3. **Nuevos Archivos**

#### `imageValidator.js`
- `validateImage(file)` - Valida tamaño, tipo, que sea imagen real
- `getImagePreview(file)` - Obtiene preview en base64
- `checkImageSafety(file)` - Preparado para AI en futuro

#### `MODERATION_SETUP.md`
- Guía completa de activación
- Scripts SQL listos para copiar/pegar
- Troubleshooting incluido

#### `activate-moderation.sh`
- Script helper (instrucciones paso a paso)

---

## 🚀 Para Activar Ahora

### Paso 1: Ejecutar SQL en Supabase

Abre tu consola SQL de Supabase (SQL Editor) y ejecuta:

```sql
-- Crear columna status
ALTER TABLE public.spots 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Crear índice
CREATE INDEX IF NOT EXISTS spots_status_idx ON public.spots(status);

-- Actualizar spots existentes
UPDATE public.spots SET status = 'approved' WHERE status IS NULL;
```

### Paso 2: Asignarte rol de moderador

En la consola SQL, ejecuta (REEMPLAZA TU_USER_ID):

```sql
UPDATE profiles 
SET role = 'moderator' 
WHERE user_id = 'TU_USER_ID';
```

Para obtener TU_USER_ID:
1. Ve a Supabase > Authentication > Users
2. Haz click en tu usuario
3. Copia el User ID (campo UUID)

### Paso 3: Recarga

F5 en el navegador. Deberías ver:
- ✅ Panel de moderación en esquina superior derecha
- ✅ Cuando alguien sube un spot → aparece en tu panel como "pending"
- ✅ Apruebaes/rechazas con botones

---

## ✨ Validación de Fotos

Ya está implementada:
- ✅ Valida que sea JPEG, PNG, WebP o GIF
- ✅ Máximo 5MB
- ✅ Mínimo 100x100px
- ✅ Verifica que sea imagen real (no corrupta)

Si alguien sube una "tonterías cualquiera":
1. Si no es imagen válida → rechaza antes de enviar
2. Si pasa validación → aparece en tu panel para TÚ decidir

---

## 🔑 Flujo de Ejemplo

```
1. Usuario: Sube spot + foto
   ↓
2. Validación Client:
   ✓ Foto es JPEG válida
   ✓ Tamaño 3MB (< 5MB)
   ✓ Dimensiones 800x600 (> 100x100)
   ↓
3. Spot creado: status='pending'
   ↓
4. TÚ ves en panel:
   "#123 Parque Milan"
   [✔️] [❌] [👁️]
   ↓
5. TÚ APRUEBAS:
   status='pending' → status='approved'
   ↓
6. Todos ven el spot en el mapa
```

---

## 📊 Estadísticas

Tu panel mostrará:
- `Pending: X` (número de spots esperando aprobación)
- Para cada spot:
  - ID, título, descripción
  - Fecha de creación
  - Botones de acción

---

## 🐛 Si Algo No Funciona

### Panel no aparece
```
Solución:
1. Verifica: UPDATE profiles SET role = 'moderator' ... ✓
2. Recarga: F5
3. Abre consola: F12 > Console
4. Busca: [AUTH] UI actualizada para usuario logueado (rol=moderator)
```

### Spots siguen siendo pending
```
Solución:
1. Verifica SQL: columna 'status' existe en Supabase
2. Intenta aprobar manualmente desde tu panel
3. Recarga y verifica que aparece en el mapa
```

### Error "Imagen no válida"
```
Significa: Usuario subió algo que no es imagen real
Solución: 
- Usuario debe subir foto JPEG/PNG/WebP real
- No GIFs animados grandes
- No archivos corruptos
```

---

## 📝 Próximas Mejoras (Opcional)

1. **AI Image Detection**
   - Google Vision API para detectar si es NSFW/inapropiado
   - AWS Rekognition para análisis automático

2. **Notificaciones**
   - Email cuando hay spots pendientes
   - Notificaciones push en mobile

3. **Estadísticas**
   - Dashboard: spots por aprobar, tiempo promedio, etc.

4. **Aprovaciones Batch**
   - Seleccionar múltiples y aprobar/rechazar de una vez

---

## 🎉 ¡Listo!

Tu aplicación ahora tiene:
- ✅ Sistema de moderación completo
- ✅ Validación de fotos automática
- ✅ Panel privado de moderación
- ✅ Control total sobre publicaciones

**¡A moderar spots de calidad! 🚀**

