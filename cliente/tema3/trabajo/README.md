# MyBookShelf - Mi Biblioteca Personal 📚

Aplicación para gestionar mi colección de libros. La hice para la asignatura DWEC usando Vue.js 3.

Me gusta leer y siempre pierdo la cuenta de qué libros tengo y cuáles ya leí, así que esto me viene genial.

## Características

- **Gestión de libros**: Añade, edita y elimina libros de tu colección
- **Búsqueda y filtros**: Encuentra libros por título, autor o categoría
- **Marcado de lectura**: Marca libros como leídos o no leídos
- **Estadísticas detalladas**: Visualiza tu progreso de lectura
- **Almacenamiento local**: Tus datos se guardan en el navegador usando LocalStorage
- **Patrón AbstractFactory**: Implementación profesional de patrones de diseño
- **Diseño responsive**: Funciona perfectamente en móvil, tablet y escritorio

## 🛠️ Tecnologías Utilizadas

- **Vue.js 3** - Framework progresivo de JavaScript
- **Vite** - Build tool y servidor de desarrollo
- **JavaScript ES6+** - Programación moderna
- **CSS3** - Estilos y animaciones
- **LocalStorage API** - Persistencia de datos

## Instalación

```bash
npm install
npm run dev
```

Abre http://localhost:5173 y ya está.

## Deploy

La app está en: https://mybookshelf-antonio.web.app

Para hacer build:
```bash
npm run build
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/          # Componentes Vue
│   ├── BookLibrary.vue # Vista principal de biblioteca
│   ├── BookCard.vue    # Tarjeta individual de libro
│   ├── AddBookForm.vue # Formulario para añadir libros
│   └── Statistics.vue  # Vista de estadísticas
├── models/             # Modelos de datos
│   └── Book.js        # Clase Book
├── services/          # Servicios de negocio
│   └── BookService.js # Servicio de gestión de libros
├── storage/           # Capa de almacenamiento (Patrón AbstractFactory)
│   ├── StorageStrategy.js    # Estrategias de almacenamiento
│   └── StorageFactory.js     # Factory para crear storage
├── App.vue            # Componente principal
├── main.js           # Punto de entrada
└── style.css         # Estilos globales
```

## 🎯 Patrón de Diseño: AbstractFactory

El proyecto implementa el patrón AbstractFactory para la gestión de almacenamiento:

- **StorageStrategy**: Interfaz abstracta para estrategias de almacenamiento
- **LocalStorageStrategy**: Implementación para LocalStorage
- **SessionStorageStrategy**: Implementación para SessionStorage
- **MemoryStorageStrategy**: Implementación en memoria (fallback)
- **StorageFactory**: Factory que crea instancias de storage según necesidad

Esto permite cambiar fácilmente el tipo de almacenamiento sin modificar la lógica de negocio.

## 📱 Funcionalidades Detalladas

### Biblioteca de Libros
- Visualización en grid responsivo
- Búsqueda en tiempo real
- Filtros por categoría y estado de lectura
- Portadas visuales atractivas

### Añadir Libros
- Formulario completo con validación
- Vista previa en tiempo real
- Portadas automáticas según categoría
- Soporte para portadas personalizadas

### Estadísticas
- Total de libros, leídos y por leer
- Progreso visual de lectura
- Distribución por categorías
- Insights inteligentes
- Tiempo estimado de lectura

## 🌐 Despliegue

La aplicación está configurada para desplegarse fácilmente en:

- **GitHub Pages**: Configuración incluida en `vite.config.js`
- **Netlify**: Despliegue automático con `npm run build`
- **Vercel**: Compatible out-of-the-box

### Desplegar en GitHub Pages

```bash
npm run build
# Subir la carpeta dist/ a la rama gh-pages
```

## 👨‍💻 Desarrollo

El proyecto sigue las mejores prácticas de Vue.js 3:

- Composition API
- Props y emits tipados
- Computed properties para reactividad
- Lifecycle hooks apropiados
- Separación de responsabilidades

## 📄 Licencia

Proyecto educativo desarrollado para la asignatura de Desarrollo Web en Entorno Cliente.

## ✨ Características Destacables

✅ Uso de objetos y clases (Book, StorageStrategy)  
✅ Import/export entre módulos  
✅ Patrón AbstractFactory implementado  
✅ LocalStorage para persistencia  
✅ Múltiples vistas y componentes  
✅ Interactividad completa (formularios, búsqueda, filtros)  
✅ Diseño responsivo y atractivo  
✅ Código limpio y bien estructurado  

---

**Autor**: Antonio Valero  
**Curso**: DAW2  
**Asignatura**: DWEC - Desarrollo Web en Entorno Cliente
