# 🎬 DEMO - Cómo Probar tu Proyecto SpotMap

## ✅ PASO 1: Verificar que XAMPP está funcionando

```
1. Abre XAMPP Control Panel
2. Verifica que Apache está ON (puerto 80)
3. Verifica que MySQL está ON (puerto 3306)
```

**Si NO están encendidos:**
```
Haz clic en "Start" para cada uno
```

---

## 📱 PASO 2: Abre tu Frontend en el Navegador

```
URL: http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html
```

**¿Qué debes ver?**
```
┌─────────────────────────────────────────┐
│  📸 SpotMap        [Añadir spot]        │  ← Navbar
├──────────┬──────────────────────────────┤
│ Filtrar  │                              │
│ spots    │         MAPA                 │
│          │      (OpenStreetMap)         │
│ Buscar:  │                              │
│ [_____]  │   [Red Pin] [Red Pin]        │  ← Spots
│          │   [Red Pin]                  │
│ Spots    │                              │
│ cercanos │                              │
│ • Spot1  │                              │
│ • Spot2  │                              │
│ • Spot3  │                              │
└──────────┴──────────────────────────────┘
```

✅ Si ves el mapa con 3 pines rojos = PERFECTO

---

## 🎯 PASO 3: Prueba - Crear Spot CON Foto

### 3.1 - Haz clic en "Añadir spot"

```
Se abrirá un modal (ventana emergente)
```

### 3.2 - Completa el formulario:

```
┌────────────────────────────────────────┐
│ MODAL: Añadir nuevo spot               │
├────────────────────────────────────────┤
│                                        │
│ Título *                               │
│ [____________________________]          │
│  ↓ Ingresa: "Mi Nuevo Spot"           │
│                                        │
│ Descripción                            │
│ [____________________________]          │
│  ↓ Ingresa: "Un lugar bonito"         │
│                                        │
│ Foto del Spot                          │
│ [SELECCIONAR ARCHIVO] ← 📸 IMPORTANTE │
│  ↓ Busca una imagen JPG/PNG/GIF       │
│                                        │
│ [Usar mi ubicación actual]             │
│  ↓ Si quieres GPS automático, haz clic│
│     (si no, se usa centro del mapa)    │
│                                        │
│ Etiquetas (separadas por coma)         │
│ [____________________________]          │
│  ↓ Ingresa: "prueba,test,nuevo"      │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │         GUARDAR                  │  │ ← Haz clic
│ └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### 3.3 - Haz clic en GUARDAR

```
⏳ Espera un momento...
```

---

## ✨ PASO 4: Verifica que funcionó

### 4.1 - Deberías ver un mensaje:

```
✅ "Spot creado exitosamente con foto"
```

### 4.2 - El modal se cierra automáticamente

### 4.3 - En el mapa aparece un nuevo pin rojo

```
┌─────────────────────────────────────────┐
│  📸 SpotMap        [Añadir spot]        │
├──────────┬──────────────────────────────┤
│ Filtrar  │                              │
│ spots    │         MAPA                 │
│          │      (OpenStreetMap)         │
│ Buscar:  │                              │
│ [_____]  │   [Red Pin] [Red Pin]        │
│          │   [Red Pin]                  │
│ Spots    │   [Red Pin] ← NUEVO!         │  ← Aparece aquí
│ cercanos │                              │
│ • Spot1  │                              │
│ • Spot2  │                              │
│ • Spot3  │                              │
│ • Mi Nuevo Spot ← TAMBIÉN AQUÍ          │
└──────────┴──────────────────────────────┘
```

---

## 📸 PASO 5: Ver la Foto en el Popup

### 5.1 - Haz clic en el nuevo pin rojo

```
El pin debería estar en el centro del mapa
o donde ingresaste la ubicación
```

### 5.2 - Se abre un popup

```
┌──────────────────────┐
│ Mi Nuevo Spot        │  ← Título
│                      │
│  [  IMAGEN FOTO  ]   │  ← 📸 ¡TU FOTO AQUÍ!
│                      │
│ Un lugar bonito      │  ← Descripción
│ #prueba #test #nuevo │  ← Etiquetas
└──────────────────────┘
```

✅ **¡SI VES TU FOTO AQUÍ = ¡FUNCIONA!** 🎉

---

## 🔍 PASO 6: Verificar en la Base de Datos (Opcional)

### 6.1 - Abre phpMyAdmin

```
http://localhost/phpmyadmin
```

### 6.2 - Haz clic en "spotmap" (base de datos)

### 6.3 - Haz clic en "spots" (tabla)

### 6.4 - Deberías ver tus datos:

```
id  │ title           │ description    │ lat    │ lng    │ image_path
───┼─────────────────┼────────────────┼────────┼────────┼─────────────────
1   │ Skatepark...    │ Skatepark...   │ 41.65  │ -0.89  │ NULL
2   │ ss              │ ss             │ 68.87  │ -38.23 │ NULL
3   │ conforama       │ coches         │ 68.87  │ -38.23 │ NULL
4   │ Mi Nuevo Spot   │ Un lugar bonito│ 40.41  │ -3.70  │ /uploads/spots/
    │                 │                │        │        │ spot_4_1731.jpg
```

✅ Ver `image_path` con valor = PERFECTO

---

## 🖼️ PASO 7: Ver la Foto en el Servidor

### 7.1 - Abre tu explorador de archivos

```
C:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Proyecto\spotMap\backend\public\uploads\spots\
```

### 7.2 - Deberías ver archivos como:

```
📂 uploads
 └── 📂 spots
      ├── spot_1_1731326400.jpg
      ├── spot_1_1731326401.png
      └── spot_4_1731326402.jpg  ← Tu archivo aquí
```

✅ Ver archivos = PERFECTO

---

## ⚡ PASO 8: Crear Más Spots para Completar el Mapa

Repite PASO 3-5 pero con diferentes:
- ✅ Ubicaciones (busca en Google Maps coordenadas diferentes)
- ✅ Fotos (usa fotos diferentes)
- ✅ Títulos y descripciones

**Resultado esperado:**

```
Tu mapa debería verse así:

        🗺️ ESPAÑA
        
    📍 Spot1 (Cataluña)
    📍 Spot2 (Valencia)
    📍 Spot3 (Murcia)
    📍 Spot4 (Madrid)
    📍 Mi Nuevo Spot (Localización)
    
Cada uno con su FOTO visible en el popup
```

---

## 🎮 PASO 9: Prueba la Búsqueda

### 9.1 - En el sidebar, escribe en "Buscar"

```
Escribe: "prueba"
```

### 9.2 - Haz clic en "Aplicar"

```
El mapa debería mostrar SOLO los spots
que contengan "prueba" en nombre o etiquetas
```

---

## 🎊 FÉLICIDADES

Si llegaste aquí y viste:

- ✅ Mapa cargando
- ✅ Spots con pines rojos
- ✅ Puedes crear nuevo spot
- ✅ La FOTO aparece en el popup
- ✅ La búsqueda funciona
- ✅ Los archivos se guardan

## 🏆 **¡TU PROYECTO SPOTMAP FUNCIONA PERFECTAMENTE!**

---

## 🆘 Si algo no funciona

### ❌ "No veo el mapa"
```
1. Abre consola (F12)
2. Verifica que no hay errores rojos
3. Comprueba que tienes internet (CDN de Leaflet)
```

### ❌ "El photo no se sube"
```
1. Abre consola (F12)
2. Copia el error
3. Verifica que /uploads/spots existe
4. Comprueba permisos de carpeta
```

### ❌ "No veo la foto en el popup"
```
1. Abre phpMyAdmin
2. Verifica que image_path NO sea NULL
3. Copia la ruta y accede directamente
4. Si ves la foto, revisa el HTML generado
```

---

## 📞 Resumen de URLs Importantes

```
Frontend:
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html

API (verificar):
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php/spots

phpMyAdmin (BD):
http://localhost/phpmyadmin
```

---

## 🚀 ¡A disfrutar tu proyecto!

Ahora tienes un sistema completo de mapeo colaborativo con:
- 📍 Geolocalización
- 📸 Subida de fotos
- 🔍 Búsqueda y filtrado
- 🗺️ Mapa interactivo

¡Que lo disfrutes! 🎉
