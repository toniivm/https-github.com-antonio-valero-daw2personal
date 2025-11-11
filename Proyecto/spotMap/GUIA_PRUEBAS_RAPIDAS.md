# 🧪 Guía Rápida de Prueba - Validación y Formulario

## ✅ Verificación Rápida

### Paso 1: Abrir la aplicación
```
1. Ve a http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html
2. Verifica que el mapa cargue
3. Verifica que veas spots existentes
```

### Paso 2: Abrir el formulario
```
1. Click en botón "+ Añadir Spot" (esquina superior derecha)
2. Se abre modal "➕ Crear Nuevo Spot"
3. Verifica que veas la alerta azul diciendo "Campos requeridos: Título, Latitud y Longitud"
```

### Paso 3: Verificar estructura del formulario
```
Deberías ver 3 secciones:

📍 INFORMACIÓN BÁSICA (con fondo claro)
  • Título del Spot *
  • Latitud * 
  • Longitud *
  • Botón "📍 Usar mi ubicación actual"

📝 DETALLES (OPCIONAL)
  • Descripción
  • Categoría
  • Etiquetas

📸 FOTO DEL SPOT (OPCIONAL)
  • Selector de archivo
  • Información sobre formatos y tamaño
```

---

## 🧪 Test 1: Crear Spot Básico (MÍNIMO)

### Datos a ingresar:
```
Título: "Parque de prueba"
Latitud: 43.363781
Longitud: -5.877206
Descripción: (dejar vacío)
Categoría: (dejar vacío)
Etiquetas: (dejar vacío)
Foto: (no seleccionar)
```

### Pasos:
1. Rellena los campos requeridos
2. Click "✓ Crear Spot"
3. Verifica que:
   - ✅ Se cierre el modal
   - ✅ Aparezca notificación verde: "✓ Spot creado correctamente"
   - ✅ El spot aparezca en el mapa (punto nuevo)
   - ✅ El spot aparezca en la lista del sidebar

### Resultado esperado:
```
✅ ÉXITO
- Spot creado sin descripción, categoría ni foto
- Spot visible en mapa y lista
```

---

## 🧪 Test 2: Crear Spot Completo (CON TODO)

### Datos a ingresar:
```
Título: "Café especializado La Molienda"
Latitud: 43.363781
Longitud: -5.875000
Descripción: "Pequeño café con barista profesional. Tuestan localmente. Excelente espresso."
Categoría: "café"
Etiquetas: "especializado, wifi, trabajo"
Foto: (selecciona una imagen PNG/JPG de ~1-2 MB)
```

### Pasos:
1. Rellena todos los campos
2. Selecciona una foto pequeña (no muy grande)
3. Click "✓ Crear Spot"
4. Verifica que:
   - ✅ Se cierre el modal
   - ✅ Aparezca notificación: "✓ Spot creado correctamente"
   - ✅ El spot aparezca en mapa con foto
   - ✅ La foto sea visible en el popup del spot

### Resultado esperado:
```
✅ ÉXITO
- Spot creado con todos los datos y foto
- Foto se ve en el popup del spot
```

---

## 🧪 Test 3: Validación - Título Vacío

### Pasos:
1. Abre el modal
2. Deja TODOS los campos vacíos
3. Click "✓ Crear Spot"

### Resultado esperado:
```
❌ NO ENVÍA
⚠️ Alerta roja "Verifica los datos:"
⚠️ El título es requerido
```

**No hace scroll automático:** Verifica que la alerta aparezca y se desplace a ella

---

## 🧪 Test 4: Validación - Título Muy Corto

### Pasos:
1. Título: "Pa" (solo 2 caracteres)
2. Latitud: 43.363781
3. Longitud: -5.877206
4. Click "✓ Crear Spot"

### Resultado esperado:
```
❌ NO ENVÍA
⚠️ Alerta roja "Verifica los datos:"
⚠️ El título debe tener al menos 3 caracteres
```

---

## 🧪 Test 5: Validación - Latitud Fuera de Rango

### Pasos:
1. Título: "Test"
2. Latitud: 95 (FUERA de rango -90 a 90)
3. Longitud: -5.877206
4. Click "✓ Crear Spot"

### Resultado esperado:
```
❌ NO ENVÍA
⚠️ Alerta roja "Verifica los datos:"
⚠️ La latitud debe estar entre -90 y 90
```

---

## 🧪 Test 6: Validación - Longitud Fuera de Rango

### Pasos:
1. Título: "Test"
2. Latitud: 43.363781
3. Longitud: 185 (FUERA de rango -180 a 180)
4. Click "✓ Crear Spot"

### Resultado esperado:
```
❌ NO ENVÍA
⚠️ Alerta roja "Verifica los datos:"
⚠️ La longitud debe estar entre -180 y 180
```

---

## 🧪 Test 7: Validación - Foto Muy Grande

### Pasos:
1. Todos los campos válidos
2. Selecciona foto > 5 MB
3. Click "✓ Crear Spot"

### Resultado esperado:
```
❌ NO ENVÍA a servidor
🔴 Error mostrado: "La foto no puede exceder 5MB"
```

---

## 🧪 Test 8: Validación - Formato de Foto Inválido

### Pasos:
1. Todos los campos válidos
2. Intenta seleccionar archivo PDF o documento
   (Si no te deja, intenta cambiar el tipo de archivo en el selector)
3. Si logras seleccionar, click "✓ Crear Spot"

### Resultado esperado:
```
❌ NO ENVÍA a servidor
🔴 Error mostrado: "Formato de foto no válido. Use: JPEG, PNG, WebP o GIF"
```

---

## 🧪 Test 9: Botón "Usar mi ubicación"

### Pasos:
1. Abre el modal
2. Click en "📍 Usar mi ubicación actual"
3. Autoriza la geolocalización del navegador
4. Verifica que:
   - ✅ Los campos de Latitud y Longitud se llenen automáticamente
   - ✅ El mapa se centre en tu ubicación

### Resultado esperado:
```
✅ ÉXITO
- Campos lat/lng rellenos con tu ubicación
- Mapa centrado en tu posición
- Puedes crear spot en tu ubicación actual
```

---

## 🧪 Test 10: Múltiples Errores a la Vez

### Pasos:
1. Título: "A" (muy corto)
2. Latitud: 95 (fuera de rango)
3. Longitud: 200 (fuera de rango)
4. Click "✓ Crear Spot"

### Resultado esperado:
```
❌ NO ENVÍA
⚠️ Alerta roja con TODOS los errores:
⚠️ El título debe tener al menos 3 caracteres
⚠️ La latitud debe estar entre -90 y 90
⚠️ La longitud debe estar entre -180 y 180
```

---

## 🖥️ Verificar Console del Navegador

### Para ver logs detallados:
```
1. Abre DevTools (F12 o Ctrl+Shift+I)
2. Ve a la pestaña "Console"
3. Crea un spot
```

### Deberías ver logs como:
```
[UI] Enviando formulario de nuevo spot...
[UI] Datos validados: {title: "...", lat: 43.363781, ...}
[SPOTS] Creando nuevo spot: ...
[API] POST /spots → 201
[SPOTS] ✓ Spot creado: {id: 5, title: "...", ...}
[UI] ✓ Spot creado: {id: 5, ...}
```

---

## 🔧 Troubleshooting

### Problema: El formulario se ve feo/cortado
**Solución:**
- Recarga la página (Ctrl+F5)
- Limpia caché del navegador
- Verifica que Bootstrap esté cargado

### Problema: Los errores no aparecen
**Solución:**
- Abre Console (F12)
- Busca si hay errores JavaScript
- Verifica que `ui.js` esté cargado

### Problema: La foto no sube
**Solución:**
- Verifica que sea < 5 MB
- Usa formato: JPEG, PNG, WebP o GIF
- Verifica que la carpeta `backend/public/uploads/spots/` exista

### Problema: El spot se crea pero no se ve
**Solución:**
- Recarga la página
- Verifica que las coordenadas sean dentro del rango visible
- Abre Console y busca logs de error

---

## 📱 Verificar en diferentes dispositivos

### Desktop (Chrome/Firefox/Edge)
```
✅ Debería funcionar perfectamente
✅ Validación visual clara
✅ Upload de foto funcional
```

### Mobile (Safari iOS / Chrome Android)
```
✅ Formulario responsive
✅ Teclado numérico en campos Lat/Lng
✅ Selector de foto desde galería
```

---

## 📊 Resumen de Pruebas

### Para pasar validación:
- [ ] Test 1: Spot básico crea correctamente
- [ ] Test 2: Spot completo con foto funciona
- [ ] Tests 3-6: Validación de campos funciona
- [ ] Test 7-8: Validación de foto funciona
- [ ] Test 9: Geolocalización funciona
- [ ] Test 10: Múltiples errores se muestran
- [ ] Console logs muestran proceso correcto

---

## 🎁 Bonus: Verificar Base de Datos

Si quieres verificar que los spots se guardan correctamente:

```sql
-- En PHPMyAdmin o MySQL CLI
SELECT * FROM spots ORDER BY created_at DESC LIMIT 10;

-- Deberías ver:
-- id | title | description | lat | lng | category | tags | image_path | created_at | updated_at
-- 5  | Parque de prueba | NULL | 43.363781 | -5.877206 | NULL | NULL | NULL | 2024-... | 2024-...
```

---

## ✅ Cuando TODO Funciona

```
Si todos los tests pasan:

✅ Error "Invalid JSON" RESUELTO
✅ Campos obligatorios vs opcionales CLAROS
✅ Validación en cliente FUNCIONA
✅ Upload de fotos FUNCIONA
✅ Mensajes de error ESPECÍFICOS
✅ UX mejorada VISIBLE
✅ Seguridad MEJORADA

🎉 SISTEMA LISTO PARA PRODUCCIÓN
```

---

## 📞 Preguntas Después de las Pruebas

¿Qué deberías poder decir después de completar estas pruebas?

1. ✅ "Los campos obligatorios están claros"
2. ✅ "El error 'Invalid JSON' desapareció"
3. ✅ "Los mensajes de error son específicos"
4. ✅ "Puedo crear spots sin foto"
5. ✅ "Puedo subir fotos si quiero"
6. ✅ "Los campos se validan antes de enviar"
7. ✅ "El formulario se ve profesional"
8. ✅ "La lista de spots se actualiza instantáneamente"

Si todas son SÍ → ✅ **TODO FUNCIONA PERFECTO**

---

*Guía de testing - SpotMap v2.0*
*Última actualización: 2024*
