# SpotMap - Requisitos de Campos para Crear un Spot

## Resumen Ejecutivo

**Mínimo requerido:** Solo necesitas 3 campos para crear un spot
- ✅ **Título** (texto)
- ✅ **Latitud** (número)
- ✅ **Longitud** (número)

Todos los demás campos son **opcionales** y sirven para enriquecer la experiencia de otros usuarios.

---

## Campos Requeridos (Obligatorios)

### 1. **Título** 📍
- **Tipo:** Texto
- **Longitud:** Mínimo 3, máximo 255 caracteres
- **Validación:** No puede estar vacío
- **Ejemplos válidos:**
  - "Parque del Retiro"
  - "Café especializado en tercera ola"
  - "Mirador con vistas al mar"
  - "Restaurante de sushi"
  - "Librería antigua"

### 2. **Latitud** 📍
- **Tipo:** Número decimal
- **Rango:** De -90 a 90
- **Validación:** Solo números, precisión hasta 6 decimales
- **Ejemplos:**
  - `43.363781` (válido - Asturias, España)
  - `40.712776` (válido - Nueva York, USA)
  - `-33.868815` (válido - Sydney, Australia)
  - `91` (❌ inválido - fuera de rango)

### 3. **Longitud** 📍
- **Tipo:** Número decimal
- **Rango:** De -180 a 180
- **Validación:** Solo números, precisión hasta 6 decimales
- **Ejemplos:**
  - `-5.877206` (válido - Asturias, España)
  - `-74.006015` (válido - Nueva York, USA)
  - `151.209299` (válido - Sydney, Australia)
  - `185` (❌ inválido - fuera de rango)

---

## Campos Opcionales (Recomendados)

Aunque no son obligatorios, completar estos campos hace que el spot sea mucho más útil para otros usuarios.

### 4. **Descripción** 📝
- **Tipo:** Texto largo
- **Longitud:** Máximo 1000 caracteres
- **Propósito:** Describe el spot en detalle
- **Ejemplos de buen contenido:**
  - "Hermoso parque con zonas verdes amplias, ideal para pasear, correr o relajarse. Tiene áreas infantiles, bancos, senderos sombreados y una laguna artificial muy bonita. Muy limpio y seguro."
  - "Café especializado en tercera ola. Usan granos de calidad, tuestan en el lugar, ofrecen espresso, filter coffee y cold brew. El dueño es muy apasionado y recomendador. Ambiente tranquilo, ideal para trabajar."
  - "Mirador con vistas panorámicas de 360 grados. Se ve la costa, la ciudad y las montañas. Es especialmente bonito al atardecer. Hay bar-restaurante. Acceso en coche o a pie (20 minutos)."

### 5. **Categoría** 🏷️
- **Tipo:** Texto corto
- **Longitud:** Máximo 50 caracteres
- **Propósito:** Clasificar el tipo de spot
- **Categorías comunes sugeridas:**
  - `parque` - Espacios verdes, jardines, naturaleza
  - `monumento` - Lugares históricos, esculturas, patrimonio
  - `café` - Cafeterías, coffee shops
  - `restaurante` - Restaurantes, bares, comedores
  - `playa` - Playas, zonas costeras
  - `mirador` - Miradores, puntos de vista
  - `museo` - Museos, galerías, exposiciones
  - `librería` - Librerías, tiendas de libros
  - `mercado` - Mercadillos, ferias
  - `otro` - Cualquier otra cosa

### 6. **Etiquetas** 🏷️ (Tags)
- **Tipo:** Texto con separación por comas
- **Propósito:** Palabras clave para búsqueda y filtrado
- **Límite sugerido:** 3-10 etiquetas por spot
- **Ejemplos de etiquetas:**
  - Para un parque: `verde, familia, gratis, paseo, naturaleza, perros-permitidos`
  - Para un café: `especializado, tranquilo, wifi, trabajo, tercera-ola, expreso`
  - Para un mirador: `vistas, atardecer, fotografía, pareja, sunset, panorámico`
  - Para un restaurante: `sushi, japonés, calidad, ambiente, caro, reserva-recomendada`

**Ventajas de usar etiquetas:**
- ✅ Otros usuarios pueden buscar por palabra clave
- ✅ Sistema de filtrado mejora
- ✅ Visibilidad del spot aumenta
- ✅ Comunidad conecta mejor

### 7. **Foto del Spot** 📸
- **Tipo:** Archivo de imagen
- **Formatos válidos:** JPEG, PNG, WebP, GIF
- **Tamaño máximo:** 5 MB
- **Resolución recomendada:** 1920×1080 px (HD)
- **Propósito:** Visual atractivo del lugar
- **Tips para buenas fotos:**
  - ✅ Iluminación natural
  - ✅ Ángulo interesante
  - ✅ Mostrar lo más atractivo del lugar
  - ✅ Evitar gente si es posible
  - ✅ Nitidez clara

---

## Tabla Resumen

| Campo | Requerido | Tipo | Validación | Notas |
|-------|-----------|------|-----------|-------|
| **Título** | ✅ SÍ | Texto | 3-255 caracteres | Identifica el spot |
| **Latitud** | ✅ SÍ | Número | -90 a 90 | Ubicación geográfica |
| **Longitud** | ✅ SÍ | Número | -180 a 180 | Ubicación geográfica |
| **Descripción** | ⏳ No | Texto | Hasta 1000 caracteres | Muy recomendado |
| **Categoría** | ⏳ No | Texto | Hasta 50 caracteres | Útil para clasificación |
| **Etiquetas** | ⏳ No | CSV | Hasta 10 etiquetas | Mejora búsqueda |
| **Foto** | ⏳ No | Archivo | Max 5MB, formatos comunes | Hace más atractivo |

---

## Casos de Uso

### Caso 1: Crear un spot básico (solo mínimo)
```
Título: "Parque del Retiro"
Latitud: 43.363781
Longitud: -5.877206
```
✅ **Válido** - El spot se crea correctamente, aunque básico

### Caso 2: Crear un spot completo (recomendado)
```
Título: "Café Especializado La Molienda"
Descripción: "Pequeño café con barista profesional, tuestan los granos localmente, 
  excelente espresso y filter coffee. Ambiente bohemio, muy limpio. Ideal para trabajar 
  o tomar café de calidad. WiFi disponible."
Latitud: 43.363781
Longitud: -5.877206
Categoría: "café"
Etiquetas: "especializado, wifi, trabajo, tercera-ola, tranquilo, brunch"
Foto: [imagen del café]
```
✅ **Óptimo** - Spot muy informativo, útil para otros usuarios

### Caso 3: Spot con error de validación
```
Título: "P" ❌
Latitud: 150 ❌ (fuera de rango)
Longitud: -5.877206 ✅
```
❌ **Inválido** - No permite guardar hasta corregir

---

## Mejoras de UX Aplicadas

### Indicadores Visuales en el Formulario
- ✅ **Asterisco rojo** (*) en campos requeridos
- ✅ **Sección "Información Básica"** para campos obligatorios
- ✅ **Sección "Detalles (Opcional)"** para campos opcionales
- ✅ **Sección "Foto del Spot (Opcional)"** para foto
- ✅ **Mensaje de alerta** en la parte superior del formulario
- ✅ **Validación en tiempo real** de campos

### Mejoras en Mensajes de Error
Cuando hay un error de validación, el sistema ahora muestra:
```
⚠️ Verifica los datos:
⚠️ El título debe tener al menos 3 caracteres
⚠️ La latitud debe estar entre -90 y 90
```

En lugar de solo:
```
Error: Invalid JSON
```

### Ayudas Contextuales
- ✅ Ejemplos en placeholders (Ej: "Parque del Retiro")
- ✅ Rango de valores (Ej: "Máximo 255 caracteres")
- ✅ Botón "📍 Usar mi ubicación actual" para llenar lat/lng automáticamente
- ✅ Información sobre formatos de foto permitidos

---

## Flujo de Creación de Spot

```
1. Abrir modal "Crear Nuevo Spot"
   ↓
2. Rellenar MÍNIMO: Título, Latitud, Longitud
   ↓
3. (Opcional) Agregar descripción, categoría, etiquetas, foto
   ↓
4. Hacer clic "Crear Spot"
   ↓
5. Validación en cliente (frontend)
   ├─ ¿Es válido? → Ir a paso 6
   └─ ¿Hay error? → Mostrar mensaje, volver a paso 3
   ↓
6. Enviar a servidor
   ↓
7. Validación en servidor (backend)
   ├─ ¿Es válido? → Crear spot → Mostrar éxito
   └─ ¿Hay error? → Mostrar error específico
   ↓
8. Actualizar lista de spots en mapa y sidebar
   ↓
9. Cerrar modal y mostrar notificación de éxito
```

---

## Preguntas Frecuentes

**P: ¿Qué pasa si no agrego foto?**
A: El spot se crea normalmente, solo sin imagen. Se puede agregar después editando.

**P: ¿Puedo crear un spot sin descripción?**
A: Sí, es opcional. Pero recomendamos agregar una para que otros usuarios aprovechen mejor.

**P: ¿Qué son las etiquetas?**
A: Son palabras clave (separadas por comas) que ayudan a otros a encontrar tu spot buscando.

**P: ¿Cuánta precisión necesita la ubicación?**
A: Con 6 decimales tienes precisión de ~10 centímetros. Es más que suficiente.

**P: ¿Puedo editar un spot después de crearlo?**
A: Sí, habrá opción de editar (próxima mejora).

**P: ¿Qué sucede si agrego una foto muy grande?**
A: El sistema rechazará la foto y pedirá que sea menor a 5 MB.

---

## Validaciones de Seguridad

El sistema valida en **dos niveles**:

### 1. Cliente (Frontend)
- Validaciones antes de enviar al servidor
- Mensajes de error inmediatos
- Mejor experiencia de usuario

### 2. Servidor (Backend)
- Validaciones de seguridad adicionales
- Prevención de inyecciones de código
- Verificación de tipos de dato
- Límites de tamaño

---

## Changelog

**v1.0 - Implementado:**
- ✅ Campos obligatorios vs opcionales definidos
- ✅ Validación en cliente mejorada
- ✅ Mensajes de error específicos
- ✅ Indicadores visuales de campos requeridos
- ✅ Soporte para upload de fotos
- ✅ Validación de formatos y tamaño de foto

---

*Última actualización: 2024*
*SpotMap v2.0 - Proyecto Personal*
