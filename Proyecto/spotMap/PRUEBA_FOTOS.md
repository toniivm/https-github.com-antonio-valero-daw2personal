# 🧪 Guía de Prueba - Sistema de Fotos SpotMap

## ✅ Checklist de Validación

### Paso 1: Verificar Backend
- [ ] Carpeta `/uploads/spots` existe
- [ ] Archivo `SpotController.php` tiene método `uploadPhoto()`
- [ ] Archivo `index.php` tiene ruta para `/spots/{id}/photo`

### Paso 2: Abre el Frontend
```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html
```

**Verifica:**
- [ ] El mapa carga correctamente
- [ ] Los 3 spots actuales aparecen en el mapa
- [ ] No hay errores en la consola (F12)

### Paso 3: Crear Spot CON Foto

1. Haz clic en **"Añadir spot"**
2. Completa el formulario:
   ```
   Título: "Test Foto - Mi Spot"
   Descripción: "Probando subida de fotos"
   Foto: [Sube cualquier imagen JPG/PNG]
   Ubicación: Haz clic en "Usar mi ubicación actual"
              o ingresa manualmente: lat=40.5, lng=-3.5
   Etiquetas: "test,foto,nueva"
   ```
3. Haz clic en **"Guardar"**

**Esperado:**
- [ ] Mensaje: "Spot creado exitosamente con foto"
- [ ] No hay errores en consola
- [ ] El spot aparece en el mapa

### Paso 4: Verificar Foto en el Popup

1. Haz clic en el nuevo spot en el mapa (aparecerá como pin rojo)
2. Se debe abrir un popup con:
   - [ ] Título visible
   - [ ] **IMAGEN VISIBLE** (200px de ancho máximo)
   - [ ] Descripción
   - [ ] Etiquetas con #

### Paso 5: Verificar en Base de Datos

Abre phpmyadmin:
```
http://localhost/phpmyadmin
```

Consulta:
```sql
SELECT id, title, image_path FROM spots WHERE id = (SELECT MAX(id) FROM spots);
```

**Esperado:**
- [ ] Existe la fila del nuevo spot
- [ ] `image_path` contiene algo como: `/uploads/spots/spot_4_1731326400.jpg`
- [ ] NO está NULL

### Paso 6: Verificar Archivo en Disco

Navega a:
```
C:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Proyecto\spotMap\backend\public\uploads\spots\
```

**Esperado:**
- [ ] Existe archivo `spot_X_TIMESTAMP.jpg` (o .png, etc)
- [ ] El archivo tiene tamaño real (no está vacío)

---

## 🔧 Solución de Problemas

### ❌ "Error al subir foto"

**Opción 1: Permisos de carpeta**
```powershell
# Abre PowerShell como Administrador y ejecuta:
icacls "C:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Proyecto\spotMap\backend\public\uploads" /grant Everyone:F /T
```

**Opción 2: Verifica Apache está corriendo**
```powershell
# Abre XAMPP Control Panel y asegúrate de que Apache está ON
```

---

### ❌ "La foto no aparece en el popup"

**Paso 1:** Abre consola (F12) en el navegador
```
Copia el valor de image_path de la BD:
ej: /uploads/spots/spot_4_1234567890.jpg
```

**Paso 2:** Intenta acceder directamente:
```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/uploads/spots/spot_4_1234567890.jpg
```

Si ves la imagen, entonces está bien.

---

### ❌ "404 Not Found en /spots/{id}/photo"

**Verificar router:**
```php
// Abre: backend/public/index.php
// Busca: if ($method === 'POST' && count($parts) === 3 && $parts[2] === 'photo')
// Si no está, vuelve a ejecutar la actualización
```

---

### ❌ "413 Payload Too Large"

El archivo es mayor a 5MB. Sube una imagen más pequeña.

Para aumentar el límite (no recomendado en desarrollo):
```apache
# Crear archivo .htaccess en /backend/public
LimitRequestBody 10485760  # 10 MB
```

---

## 📱 Probar desde otra Máquina

Si quieres acceder desde otro dispositivo:

1. Obtén tu IP local:
```powershell
ipconfig | findstr "IPv4"
# Resultado: 192.168.1.100 (ejemplo)
```

2. Desde otro dispositivo, accede a:
```
http://192.168.1.100/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html
```

---

## 🐛 Debug Mode

Para ver más detalles del error, abre la consola del navegador (F12) y:

1. Haz clic en "Añadir spot"
2. Completa formulario
3. Haz clic en "Guardar"
4. Abre la consola (F12 > Consola)
5. Copia los mensajes de error

---

## ✅ Test Exitoso

Si todo funciona:
- ✅ Mapa carga
- ✅ Spots antiguos se muestran
- ✅ Puedes crear nuevo spot
- ✅ Foto se sube sin errores
- ✅ Foto aparece en el popup
- ✅ `image_path` se guardó en BD
- ✅ Archivo existe en `/uploads/spots/`

**¡FELICIDADES! 🎉 Tu sistema de fotos funciona completamente**

---

## 📝 Casos de Prueba Avanzados

### Test 1: Imagen muy grande (>5MB)
```
Esperado: Error "File too large (max 5MB)"
```

### Test 2: Formato no permitido (.bmp, .tiff, etc)
```
Esperado: Error "Only JPEG, PNG, WebP and GIF allowed"
```

### Test 3: Spot sin foto (como antes)
```
Esperado: Spot creado sin imagen, image_path = NULL
```

### Test 4: Crear 2 fotos del mismo spot
```
Esperado: La segunda foto sobrescribe la primera (nombre similar)
```

### Test 5: Eliminar spot con foto
```
Esperado: Solo se elimina de BD, la foto queda en disco
```

---

*Guía de prueba: 11 de noviembre de 2025*
