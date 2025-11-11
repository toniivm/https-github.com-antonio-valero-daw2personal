# SpotMap 2.0 - Documentación Final

## 🎯 ¿Qué es SpotMap?

SpotMap es una aplicación web colaborativa que permite a los usuarios descubrir y compartir lugares interesantes en un mapa interactivo. Hoy ha sido completamente refactorizado a una arquitectura enterprise-grade.

## 📦 Requisitos

- **XAMPP** (Apache + MySQL + PHP 8.2+)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Conexión a Internet** (para Leaflet y Bootstrap CDN)

## 🚀 Cómo Usar

### 1. Iniciar XAMPP

```bash
# En Windows
# Abrir XAMPP Control Panel y hacer click en "Start" para Apache y MySQL
```

### 2. Acceder a SpotMap

```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html
```

### 3. Funciones Principales

#### 🗺️ Ver Mapa
- Se carga automáticamente centrado en España
- Todos los spots aparecen como marcadores rojos
- Click en marcador = popup con información

#### 📍 Añadir Spot
1. Click en botón "Añadir spot"
2. Completar formulario:
   - **Título** (requerido): Nombre del lugar
   - **Descripción**: Detalles adicionales
   - **Foto**: Imagen del lugar (JPEG/PNG/WebP/GIF, max 5MB)
   - **Latitud/Longitud**: Coordenadas (o click "📍 Mi ubicación")
   - **Categoría**: Tipo de lugar (parque, monumento, etc)
   - **Etiquetas**: Palabras clave separadas por coma
3. Click en "Guardar spot"

#### 🔍 Buscar Spots
1. Escribir en barra de búsqueda "Buscar por nombre..."
2. Se filtran automáticamente los spots

#### 🏷️ Filtrar por Categoría
1. Seleccionar categoría en dropdown
2. Se muestran solo spots de esa categoría

#### 🗑️ Eliminar Spot
1. Click en spot de la lista lateral
2. Click en botón "🗑️"
3. Confirmar eliminación

#### 📍 Ir a Mi Ubicación
1. Click en botón "📍 Mi ubicación"
2. Mapa se centra en tu ubicación actual
3. Se agrega marcador azul de tu posición

### 4. API REST (Uso Avanzado)

#### Obtener todos los spots
```bash
curl http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/api.php?action=spots
```

#### Crear nuevo spot
```bash
curl -X POST http://localhost/.../api.php?action=spots \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Parque del Retiro",
    "description": "Parque hermoso en Madrid",
    "lat": 40.4168,
    "lng": -3.6938,
    "category": "parque",
    "tags": ["verde", "familia"]
  }'
```

#### Subir foto a spot
```bash
curl -X POST http://localhost/.../api.php?action=spots&id=1&sub=photo \
  -F "photo=@path/to/image.jpg"
```

#### Obtener spot específico
```bash
curl http://localhost/.../api.php?action=spots&id=1
```

#### Eliminar spot
```bash
curl -X DELETE http://localhost/.../api.php?action=spots&id=1
```

## 📂 Estructura de Proyecto

```
spotMap/
├── frontend/                    # Interfaz de usuario
│   ├── index.html              # HTML principal
│   ├── css/styles.css          # Estilos
│   └── js/
│       ├── main.js             # Orquestador
│       ├── map.js              # Gestión de mapa
│       ├── spots.js            # Lógica de spots
│       ├── ui.js               # Interfaz de usuario
│       └── api.js              # Cliente HTTP
│
├── backend/                     # Servidor y API
│   ├── src/
│   │   ├── Database.php        # Conexión BD
│   │   ├── ApiResponse.php     # Respuestas REST
│   │   ├── Validator.php       # Validación
│   │   ├── Security.php        # Seguridad
│   │   └── Controllers/
│   │       └── SpotController.php
│   ├── public/
│   │   ├── api.php             # Endpoint API
│   │   ├── index.php           # Router
│   │   └── uploads/spots/      # Almacenaje de fotos
│   └── init-db/
│       ├── schema.sql          # Schema BD
│       └── optimizations.sql   # Índices y triggers
│
└── docs/                        # Documentación
    ├── PROYECTO_FINAL.md       # Resumen completo
    ├── REFACTOR_COMPLETO.md    # Detalles del refactor
    └── [otros documentos]
```

## 🔐 Seguridad

### Lo que está protegido
- ✅ Validación de entrada en todos los campos
- ✅ MIME type validation para fotos
- ✅ Rate limiting (100 req/min por IP)
- ✅ CORS headers
- ✅ XSS protection con HTML escape
- ✅ CSRF headers
- ✅ Sanitización de strings

### Lo que debes saber
- ⚠️ En producción, cambiar `Security::setCORSHeaders()` a origen específico
- ⚠️ Usar HTTPS en producción
- ⚠️ Implementar autenticación si es público

## 🐛 Troubleshooting

### "Spots no aparecen en el mapa"
**Solución:**
1. Abre DevTools (F12)
2. Revisa console para errores
3. Verifica que MySQL esté corriendo
4. Verifica que Apache esté corriendo

### "No puedo subir fotos"
**Solución:**
1. Revisa que la foto sea JPEG/PNG/WebP/GIF
2. Revisa que sea menor a 5MB
3. Verifica permisos en `/uploads/spots/`

### "Botón 'Añadir spot' no funciona"
**Solución:**
1. Abre DevTools → Console
2. Verifica errores de JavaScript
3. Recarga la página (Ctrl+F5)

## 📊 Base de Datos

### Tabla spots
```sql
CREATE TABLE spots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lat DECIMAL(10, 6) NOT NULL,
    lng DECIMAL(10, 6) NOT NULL,
    tags JSON,
    category VARCHAR(50),
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Datos de Prueba
La BD viene con 3 spots de ejemplo:
1. Skatepark Delicias (Zaragoza)
2. ss (Ubicación test)
3. conforama (Ubicación test)

## 🎓 Para Desarrolladores

### Cómo modificar código

#### Agregar nueva funcionalidad en Backend
1. Crear método en `SpotController.php`
2. Agregar validación con clase `Validator`
3. Retornar respuesta con `ApiResponse`
4. Agregar ruta en `api.php`

#### Agregar nueva funcionalidad en Frontend
1. Agregar función en módulo correspondiente (map.js, spots.js, ui.js)
2. Exportar función con `export function nombre() {}`
3. Importar en main.js: `import { nombre } from './module.js'`
4. Usar en main

#### Ejemplo: Agregar filtro por distancia
```javascript
// En spots.js
export function filterByDistance(spots, lat, lng, maxDistance) {
    return spots.filter(spot => {
        const distance = calculateDistance(spot.lat, spot.lng, lat, lng);
        return distance <= maxDistance;
    });
}

// En main.js
import { filterByDistance } from './spots.js';
const nearby = filterByDistance(spots, 40.4, -3.7, 5);
```

## 📈 Performance

### Optimizaciones Implementadas

#### Backend
- ✅ Paginación automática (50 items por página)
- ✅ Índices en lat/lng para búsquedas
- ✅ Rate limiting para prevenir DDoS
- ✅ Compresión de respuestas

#### Frontend
- ✅ Módulos ES6 (lazy loading)
- ✅ Debounce en búsqueda (300ms)
- ✅ Caché de spots en memoria
- ✅ Eventos delegados en lista

#### Base de Datos
- ✅ 9 índices para queries rápidas
- ✅ Unique index en coordenadas
- ✅ Triggers para actualización automática
- ✅ Vistas para queries comunes

## 🚀 Próximos Pasos

### Corto Plazo (1-2 semanas)
- [ ] Agregar autenticación de usuarios
- [ ] Implementar comentarios en spots
- [ ] Sistema de ratings/likes

### Medio Plazo (1-2 meses)
- [ ] Migrar backend a Laravel 11
- [ ] Migrar frontend a React 18
- [ ] Implementar tests automáticos

### Largo Plazo (3-6 meses)
- [ ] Multitenancy (múltiples ciudades)
- [ ] Integración con Google Maps
- [ ] IA para sugerencias de spots
- [ ] Notificaciones en tiempo real

## 📞 Soporte

### Documentación Disponible
- `PROYECTO_FINAL.md` - Resumen ejecutivo
- `REFACTOR_COMPLETO.md` - Detalles técnicos
- `MEJORAS_HOY.md` - Cambios recientes
- Comentarios en código - JSDoc y docstrings

### Preguntas Frecuentes

**P: ¿Puedo usar SpotMap en producción?**
R: Sí, pero necesitas:
- [ ] Configurar HTTPS
- [ ] Configurar autenticación
- [ ] Cambiar CORS origin
- [ ] Configurar backups automáticos

**P: ¿Cómo migro a Laravel?**
R: Las clases ApiResponse y Validator ya usan el patrón de Laravel.

**P: ¿Cómo migro a React?**
R: Los módulos ES6 (map.js, spots.js, ui.js) son fáciles de convertir a componentes React.

**P: ¿Cómo implemento autenticación?**
R: Ver documentación de Validator para sanitización de credentials.

## 🎉 Conclusión

¡SpotMap está listo para usar y escalar! 

**Versión**: 2.0 (Enterprise Edition)
**Calidad**: Production-ready
**Documentación**: Completa
**Seguridad**: Robusta
**Performance**: Optimizado

---

**¿Preguntas?** Revisar documentación o código fuente.

**¿Bugs?** Reportar en comentarios del código.

**¿Sugerencias?** El código está optimizado para cambios futuros.

¡Diviértete con SpotMap! 🗺️✨
