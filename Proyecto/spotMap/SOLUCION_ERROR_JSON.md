# SpotMap - Solución del Error "Invalid JSON"

## Análisis del Problema

**Error Reportado:** "Error: Invalid JSON" aparece cuando se intenta crear un nuevo spot
**Reproducción:** Llenar formulario con título, descripción, lat/lng, categoría, tags, SIN foto
**Resultado:** Error mostrado al usuario, aunque el spot podría crearse o no

---

## Causas Identificadas

### 1. **Headers Incorrectos con FormData**
- **Problema:** Se establecía `Content-Type: application/json` cuando se enviaba `FormData`
- **Impacto:** Backend no procesa correctamente el body
- **Solución:** El navegador establece automáticamente `Content-Type: multipart/form-data` para FormData

### 2. **Endpoint POST no Manejado**
- **Problema:** `api.js` no diferenciaba entre GET y POST para `/spots`
- **Impacto:** URL incorrecta, parámetros no en query string
- **Solución:** Agregar lógica específica para método POST

### 3. **Manejo de Errores del API**
- **Problema:** Respuesta 422 (validation error) no se convertía a mensaje legible
- **Impacto:** Usuario veía "Invalid JSON" en lugar del error real
- **Solución:** Extraer y mostrar errores específicos de validación

---

## Cambios Realizados

### 1. Mejorar `api.js` - Headers

**Antes:**
```javascript
const headers = new Headers({ 'Accept': 'application/json' });
if (body && !(body instanceof FormData)) {
  headers.append('Content-Type', 'application/json');
}
```

**Después:**
```javascript
const headers = new Headers({ 'Accept': 'application/json' });

// Merge custom headers (pero no establecer Content-Type para FormData)
if (!(body instanceof FormData)) {
  if (customHeaders['Content-Type']) {
    headers.append('Content-Type', customHeaders['Content-Type']);
  } else if (body) {
    headers.append('Content-Type', 'application/json');
  }
  // Agregar otros headers custom
  for (const [key, value] of Object.entries(customHeaders)) {
    if (key !== 'Content-Type') {
      headers.append(key, value);
    }
  }
} else {
  // Para FormData, solo agregar non-Content-Type headers
  for (const [key, value] of Object.entries(customHeaders)) {
    if (key !== 'Content-Type') {
      headers.append(key, value);
    }
  }
}
```

### 2. Mejorar `api.js` - Endpoint Handling

**Antes:**
```javascript
if (endpoint === '/spots') {
  url += '?action=spots';
} else if (endpoint.match(/^\/spots\/\d+$/)) {
  // ...
}
```

**Después:**
```javascript
if (endpoint === '/spots' && method === 'POST') {
  url += '?action=spots';
} else if (endpoint === '/spots' && method === 'GET') {
  url += '?action=spots';
} else if (endpoint.match(/^\/spots\/\d+$/)) {
  // ...
}
```

### 3. Mejorar `spots.js` - Validación Completa

**Nuevo en `createSpot()`:**
```javascript
// Validación de archivo de foto
if (photoFile) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (photoFile.size > maxSize) {
    throw new Error('La foto no puede exceder 5MB');
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(photoFile.type)) {
    throw new Error('Formato de foto no válido. Use: JPEG, PNG, WebP o GIF');
  }
}

// Mejor manejo de errores API
if (response?.errors) {
  const errorMessages = Object.values(response.errors).flat();
  throw new Error(errorMessages.join(', '));
}
```

### 4. Mejorar `ui.js` - Validación en Cliente

**Nuevo: Función `validateSpotForm()`**
```javascript
function validateSpotForm(title, latStr, lngStr) {
  const errors = [];

  // Validar título
  if (!title || title.length === 0) {
    errors.push('El título es requerido');
  } else if (title.length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  } else if (title.length > 255) {
    errors.push('El título no puede exceder 255 caracteres');
  }

  // Validar latitud
  if (!latStr || latStr.length === 0) {
    errors.push('La latitud es requerida');
  } else {
    const lat = parseFloat(latStr);
    if (isNaN(lat)) {
      errors.push('La latitud debe ser un número válido');
    } else if (lat < -90 || lat > 90) {
      errors.push('La latitud debe estar entre -90 y 90');
    }
  }

  // Validar longitud
  if (!lngStr || lngStr.length === 0) {
    errors.push('La longitud es requerida');
  } else {
    const lng = parseFloat(lngStr);
    if (isNaN(lng)) {
      errors.push('La longitud debe ser un número válido');
    } else if (lng < -180 || lng > 180) {
      errors.push('La longitud debe estar entre -180 y 180');
    }
  }

  return errors;
}
```

**Nuevo: Función `showValidationErrors()`**
```javascript
function showValidationErrors(errors) {
  const summaryDiv = document.getElementById('validation-summary');
  const errorList = document.getElementById('validation-list');

  errorList.innerHTML = '';
  errors.forEach(error => {
    const li = document.createElement('li');
    li.textContent = '⚠️ ' + error;
    errorList.appendChild(li);
  });

  summaryDiv.style.display = 'block';
  summaryDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
```

### 5. Mejorar HTML - Estructura del Formulario

**Cambios:**
- Agregar alerta de información sobre campos requeridos
- Dividir en secciones: "Información Básica", "Detalles (Opcional)", "Foto (Opcional)"
- Asterisco rojo (*) en campos requeridos
- Placeholder de ejemplo más descriptivo
- Área de resumen de validación con ID `validation-summary`
- Lista de errores con ID `validation-list`
- Información sobre formatos y tamaños permitidos

---

## Flujo de Validación Mejorado

```
1. Usuario llena formulario
   ↓
2. Click "Crear Spot"
   ↓
3. handleAddSpotSubmit() en ui.js
   │
   ├─ Obtener datos del formulario
   ├─ Validar con validateSpotForm()
   │
   ├─ ¿Hay errores?
   │  ├─ SÍ: showValidationErrors() → Mostrar en alerta → RETURN
   │  └─ NO: Continuar
   ├─ Llamar createSpot() en spots.js con datos y foto
   │
   └─ Try/Catch:
      ├─ Error: showNotification() con mensaje específico
      └─ Success: Actualizar lista, cerrar modal, mostrar éxito
```

---

## Errores Ahora Mostrados Correctamente

### Antes:
```
Error: Invalid JSON
```

### Después:
```
⚠️ El título es requerido
⚠️ La latitud debe estar entre -90 y 90
⚠️ La foto no puede exceder 5MB
⚠️ Formato de foto no válido. Use: JPEG, PNG, WebP o GIF
```

---

## Testing Manual

### Test 1: Solo campos requeridos (sin foto)
```
✓ Título: "Parque del Retiro"
✓ Latitud: 43.363781
✓ Longitud: -5.877206
- Descripción: (vacío)
- Categoría: (vacío)
- Etiquetas: (vacío)
- Foto: (no seleccionada)

Resultado esperado: ✅ Spot creado exitosamente
```

### Test 2: Con foto válida
```
✓ Título: "Café La Molienda"
✓ Latitud: 43.363781
✓ Longitud: -5.877206
✓ Descripción: "Café especializado"
✓ Categoría: "café"
✓ Etiquetas: "especializado, wifi"
✓ Foto: imagen.jpg (1.2 MB, válido)

Resultado esperado: ✅ Spot creado con foto
```

### Test 3: Título muy corto (error)
```
✓ Título: "Po" ❌ (solo 2 caracteres)
✓ Latitud: 43.363781
✓ Longitud: -5.877206

Resultado esperado: ⚠️ Error mostrado sin enviar
```

### Test 4: Latitud fuera de rango (error)
```
✓ Título: "Test Spot"
✓ Latitud: 95 ❌ (mayor que 90)
✓ Longitud: -5.877206

Resultado esperado: ⚠️ Error mostrado sin enviar
```

### Test 5: Foto muy grande (error)
```
✓ Todos los campos válidos
✓ Foto: imagen-grande.jpg (8 MB) ❌

Resultado esperado: ⚠️ Error de tamaño mostrado
```

### Test 6: Foto formato inválido (error)
```
✓ Todos los campos válidos
✓ Foto: documento.pdf ❌

Resultado esperado: ⚠️ Error de formato mostrado
```

---

## Debugging Console

Para ver logs de depuración en la consola del navegador:

```javascript
// Ver flujo de validación
[UI] Enviando formulario de nuevo spot...
[UI] Datos validados: {title: "...", lat: 43.363781, ...}
[UI] Abriendo modal para añadir spot

// Ver comunicación con API
[API] POST /spots → 201
[SPOTS] Creando nuevo spot: ...
[SPOTS] ✓ Spot creado: {id: 5, title: "...", ...}

// Ver errores
[UI] Error creando spot: Error: La foto no puede exceder 5MB
```

---

## Beneficios de la Solución

✅ **Errores claros:** Usuario sabe exactamente qué está mal
✅ **Validación doble:** Cliente y servidor
✅ **UX mejorada:** Secciones claras de obligatorio/opcional
✅ **Soporte para fotos:** Upload correcto con FormData
✅ **Responsive:** Indicadores visuales claros
✅ **Seguridad:** Validación rigurosa

---

## Archivos Modificados

1. `frontend/js/api.js` - Headers y endpoint handling
2. `frontend/js/spots.js` - Validación y manejo de FormData
3. `frontend/js/ui.js` - Validación de formulario y mensajes
4. `frontend/index.html` - Estructura del formulario mejorada

---

## Próximas Mejoras (TODO)

- [ ] Editar spots existentes
- [ ] Reordenar spots por favoritos
- [ ] Comentarios en spots
- [ ] Filtrado por distancia
- [ ] Historial de visitas
- [ ] Exportar lista de spots a PDF

---

*Documento técnico - SpotMap v2.0*
