# DOCUMENTACIÓN DEL PROYECTO
## MyBookShelf - Gestión de Biblioteca Personal

**Alumno**: Antonio Valero  
**Asignatura**: DWEC - Desarrollo Web en Entorno Cliente  
**Curso**: DAW2  
**Fecha**: Noviembre 2025

---

## 1. DESCRIPCIÓN DE LA APLICACIÓN

MyBookShelf es una aplicación web desarrollada con Vue.js 3 que permite gestionar una biblioteca personal de libros. La aplicación permite añadir, buscar, filtrar y organizar una colección de libros, además de llevar un seguimiento de los libros leídos y obtener estadísticas sobre los hábitos de lectura.

### Concepto Principal
La idea surge de la necesidad de tener un control sobre los libros que tengo, los que he leído y los que me quedan por leer. Es una herramienta práctica para cualquier persona que le guste leer y quiera organizar su biblioteca.

### ¿Por qué este proyecto?
Elegí este tema porque soy aficionado a la lectura y siempre me ha costado recordar qué libros tengo y cuáles he leído ya. Con esta aplicación puedo tener todo organizado en un solo lugar.

---

## 2. FUNCIONALIDADES PRINCIPALES

### 2.1 Gestión de Libros
La aplicación permite realizar todas las operaciones básicas sobre los libros:

**Añadir libros**: Mediante un formulario puedo introducir:
- Título del libro (obligatorio)
- Autor (obligatorio)
- Categoría: Ficción, Tecnología, Historia, etc. (obligatorio)
- Número de páginas (obligatorio)
- Año de publicación (obligatorio)
- URL de la portada (opcional, si no la pongo se asigna una automática)
- Marcar si ya lo he leído

**Ver biblioteca**: En la vista principal veo todos mis libros en formato de tarjetas con:
- Portada del libro
- Título y autor
- Número de páginas y año
- Categoría
- Indicador visual si está leído
- Botones para marcar como leído/no leído
- Botón para eliminar el libro

**Buscar libros**: Puedo buscar en tiempo real escribiendo en el campo de búsqueda. La búsqueda funciona por título, autor o categoría.

**Filtrar**: Tengo dos filtros disponibles:
- Por categoría (todas, o una específica)
- Por estado (todos, leídos, no leídos)

Los filtros se pueden combinar entre sí.

### 2.2 Estadísticas
La sección de estadísticas me muestra información útil sobre mi biblioteca:

**Métricas generales**:
- Total de libros en mi biblioteca
- Cuántos he leído
- Cuántos me quedan por leer
- Total de páginas de todos los libros

**Progreso de lectura**:
- Barra visual mostrando el porcentaje completado
- Páginas leídas vs páginas pendientes

**Análisis por categorías**:
- Gráfico de barras mostrando cuántos libros tengo de cada categoría
- Me ayuda a ver qué género leo más

**Insights inteligentes**:
- Meta de lectura (cuántos libros me quedan)
- Categoría favorita (donde tengo más libros)
- Promedio de páginas por libro
- Tiempo estimado de lectura para terminar los pendientes

### 2.3 Persistencia de Datos
Todos los datos se guardan automáticamente en el navegador usando LocalStorage. Esto significa que aunque cierre el navegador y vuelva a abrir la aplicación, mis libros siguen ahí.

---

## 3. TECNOLOGÍAS UTILIZADAS

### Frontend
- **Vue.js 3**: Framework JavaScript que he usado con la Composition API
- **Vite**: Herramienta de desarrollo que hace que todo vaya muy rápido
- **HTML5 y CSS3**: Para la estructura y los estilos
- **JavaScript ES6+**: Lenguaje de programación moderno

### Gestión de Datos
- **LocalStorage**: API del navegador para guardar datos localmente
- **Patrón AbstractFactory**: Lo he implementado para tener diferentes estrategias de almacenamiento

### Diseño
- CSS personalizado con:
  - Variables CSS para los colores principales
  - Flexbox y Grid para la disposición
  - Media queries para que funcione en móvil
  - Animaciones y transiciones

---

## 4. ARQUITECTURA Y PATRONES DE DISEÑO

### Estructura del Proyecto
He organizado el código de forma modular:

```
src/
├── components/          # Componentes Vue
│   ├── BookLibrary.vue # Vista de la biblioteca
│   ├── BookCard.vue    # Tarjeta individual de libro
│   ├── AddBookForm.vue # Formulario para añadir
│   └── Statistics.vue  # Vista de estadísticas
├── models/             # Modelos de datos
│   └── Book.js        # Clase Book
├── services/          # Lógica de negocio
│   └── BookService.js # Servicio de gestión
├── storage/           # Capa de almacenamiento
│   ├── StorageFactory.js   # Factory
│   └── StorageStrategy.js  # Estrategias
├── App.vue            # Componente principal
├── main.js           # Punto de entrada
└── style.css         # Estilos globales
```

### Patrón AbstractFactory (Requerido)

He implementado el patrón AbstractFactory para la gestión del almacenamiento de datos. Esto me permite cambiar fácilmente dónde se guardan los datos sin tocar el resto del código.

**Cómo funciona**:

1. **StorageStrategy** (Interfaz abstracta): Define los métodos que debe tener cualquier estrategia de almacenamiento:
   - `save(key, data)`: Guardar datos
   - `load(key)`: Cargar datos
   - `remove(key)`: Eliminar datos
   - `clear()`: Limpiar todo

2. **Implementaciones concretas**:
   - **LocalStorageStrategy**: Usa localStorage del navegador (la que uso por defecto)
   - **SessionStorageStrategy**: Usa sessionStorage (se borra al cerrar pestaña)
   - **MemoryStorageStrategy**: Guarda en memoria RAM (para testing)

3. **StorageFactory** (La factory): Tiene un método `createStorage(tipo)` que crea la estrategia apropiada según el tipo que le pase.

**Ventajas de usar este patrón**:
- Puedo cambiar el tipo de almacenamiento sin modificar BookService
- Es fácil añadir nuevas estrategias (por ejemplo, una API backend)
- El código queda más limpio y organizado
- Cumple el principio de responsabilidad única

**Ejemplo de uso en el código**:
```javascript
// En BookService.js
constructor(storageType = 'local') {
  // Uso la factory para crear el storage
  this.storage = StorageFactory.createStorage(storageType);
  this.storageKey = 'mybookshelf_books';
  this.books = this.loadBooks();
}
```

### Separación de Responsabilidades

He dividido el código en capas:
- **Modelos** (Book.js): Representa la estructura de un libro
- **Servicios** (BookService.js): Lógica de negocio (añadir, buscar, estadísticas)
- **Storage** (Factory + Strategies): Se encarga solo del almacenamiento
- **Componentes Vue**: Solo se encargan de la interfaz

### Uso de Objetos con Import/Export

Todo el código está modularizado usando import/export:

```javascript
// Exporto la clase Book
export class Book { ... }

// La importo donde la necesito
import { Book } from '../models/Book.js';
```

Lo mismo con las estrategias, el servicio, etc. Cada archivo tiene su responsabilidad y se importa donde hace falta.

---

## 5. DISEÑO Y USABILIDAD

### Interfaz de Usuario
He intentado hacer una interfaz limpia y fácil de usar:

**Colores**: Uso un gradiente violeta-azul que le da un aspecto moderno
**Tipografía**: Segoe UI, que es legible y está en todos los sistemas
**Iconos**: Uso emojis para que sea más visual y amigable
**Espaciado**: He dejado suficiente espacio entre elementos para que no esté saturado

### Diseño Responsive
La aplicación funciona bien en cualquier dispositivo:
- **Escritorio**: Grid de 3-4 columnas para los libros
- **Tablet**: Grid de 2 columnas
- **Móvil**: Una sola columna, botones más grandes

He usado media queries para adaptar el diseño según el tamaño de pantalla.

### Experiencia de Usuario

**Feedback visual**:
- Cuando añado un libro aparece un mensaje verde de confirmación
- Los botones cambian de color al pasar el ratón
- Animaciones suaves en las transiciones
- Los libros leídos tienen un badge verde

**Validación de formularios**:
- Los campos obligatorios están marcados con *
- No se puede enviar el formulario si falta algo
- Hay una vista previa del libro antes de añadirlo

**Búsqueda en tiempo real**:
- No hace falta darle a ningún botón, según escribo se filtran los resultados
- Es instantáneo gracias a las propiedades computadas de Vue

---

## 6. INSTRUCCIONES DE USO

### Instalación y Ejecución

Para ejecutar el proyecto en local:

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. Abrir en el navegador
# Se abre automáticamente en http://localhost:5173/trabajo/
```

Para crear la versión de producción:

```bash
# Generar build optimizado
npm run build

# La carpeta dist/ contendrá la aplicación lista para subir
```

### Uso de la Aplicación

**Primera vez que entras**:
La aplicación carga con 4 libros de ejemplo para que veas cómo funciona.

**Añadir un libro**:
1. Click en "➕ Añadir Libro" en el menú superior
2. Relleno el formulario con los datos del libro
3. Puedo ver una vista previa a la derecha
4. Click en "✓ Añadir Libro"
5. Aparece un mensaje verde de confirmación
6. El libro se añade a mi biblioteca

**Buscar y filtrar**:
1. Voy a "📖 Biblioteca"
2. Escribo en el campo de búsqueda (busca en título, autor y categoría)
3. Uso los selectores para filtrar por categoría o estado
4. Los filtros se pueden combinar

**Marcar como leído**:
1. En cada tarjeta de libro hay un botón verde
2. Si lo pulso, marca el libro como leído y aparece un badge verde
3. Si vuelvo a pulsarlo, lo marca como no leído

**Ver estadísticas**:
1. Click en "📊 Estadísticas"
2. Veo todas las métricas de mi biblioteca
3. Hay insights interesantes como el tiempo estimado de lectura

**Reiniciar datos**:
Si quiero volver a los libros de ejemplo:
1. Voy a Estadísticas
2. Abajo hay un botón "⚠️ Reiniciar Datos"
3. Me pide confirmación y resetea todo

---

## 7. DESPLIEGUE

### URL de la Aplicación Desplegada

**🌐 URL**: https://mybookshelf-antonio.web.app

La aplicación está desplegada en Firebase Hosting y funciona perfectamente. Puedes acceder desde cualquier navegador y todos los datos se guardan en el LocalStorage del navegador.

### Proceso de Despliegue en Firebase

He desplegado la aplicación en Firebase siguiendo estos pasos:

1. **Instalé Firebase CLI**:
```bash
npm install -g firebase-tools
```

2. **Me logueé en Firebase**:
```bash
firebase login
```

3. **Inicialicé el proyecto**:
```bash
firebase init hosting
```

Configuración que usé:
- Public directory: `dist`
- Single-page app: Sí
- GitHub deploys: No (por ahora)

4. **Generé el build de producción**:
```bash
npm run build
```

5. **Desplegué**:
```bash
firebase deploy
```

Firebase me dio la URL pública donde está alojada la aplicación.

### Alternativas de Despliegue

También preparé el proyecto para poder desplegarlo en:

**Netlify**: Incluí archivo `netlify.toml` con la configuración
**GitHub Pages**: Incluí workflow de GitHub Actions
**Render**: Compatible sin configuración adicional
**Vercel**: Compatible sin configuración adicional

---

## 8. PROBLEMAS ENCONTRADOS Y SOLUCIONES

Durante el desarrollo me encontré con algunos problemas que tuve que resolver:

### Problema 1: Pérdida de datos al recargar
**Problema**: Al principio los datos se perdían al recargar la página.
**Solución**: Implementé el patrón AbstractFactory con LocalStorage para que los datos persistan. Ahora cada vez que añado, modifico o elimino un libro, se guarda automáticamente.

### Problema 2: Imágenes que no cargan
**Problema**: Algunas URLs de portadas de libros no funcionaban.
**Solución**: Añadí un manejador de errores en las imágenes que, si falla la carga, pone una imagen por defecto. También tengo un sistema de portadas automáticas por categoría.

```javascript
handleImageError(e) {
  e.target.src = 'https://images.unsplash.com/photo-1495446815901...';
}
```

### Problema 3: Filtros no se actualizaban bien
**Problema**: Al principio los filtros no funcionaban correctamente juntos.
**Solución**: Usé propiedades computadas (computed) de Vue que se actualizan automáticamente cuando cambia algún valor. Así la búsqueda y los filtros funcionan en tiempo real.

### Problema 4: Responsive en móvil
**Problema**: En móvil algunos elementos se veían mal.
**Solución**: Añadí media queries específicas para diferentes tamaños y probé en varios dispositivos. Ahora funciona bien desde 320px en adelante.

---

## 9. MEJORAS FUTURAS

Cosas que me gustaría añadir en el futuro:

**Backend real**: Conectar con una API para guardar los datos en un servidor y poder acceder desde cualquier dispositivo.

**Autenticación**: Sistema de login para que cada usuario tenga su propia biblioteca.

**Valoración de libros**: Poder puntuar los libros del 1 al 5 estrellas.

**Notas personales**: Añadir un campo de notas para cada libro donde pueda escribir comentarios o citas favoritas.

**Importar/Exportar**: Poder exportar mi biblioteca a un archivo JSON o CSV y también importarla.

**Recomendaciones**: Usar alguna API de libros para sugerir libros similares.

**Compartir**: Poder compartir mi lista de libros leídos con amigos.

**Modo oscuro**: Añadir un tema oscuro para leer por la noche.

---

## 10. CONCLUSIONES

### Lo que he aprendido

Este proyecto me ha servido para:
- Profundizar en Vue.js 3 y su Composition API
- Entender mejor los patrones de diseño, especialmente AbstractFactory
- Aprender a estructurar un proyecto de forma modular
- Practicar con LocalStorage y la persistencia de datos
- Mejorar mis habilidades de CSS y diseño responsive
- Familiarizarme con herramientas modernas como Vite
- Aprender a desplegar aplicaciones en Firebase

### Dificultades superadas

Lo más complicado fue:
1. Implementar correctamente el patrón AbstractFactory
2. Hacer que los filtros y búsqueda funcionen bien juntos
3. Conseguir un diseño responsive que se vea bien en todos los dispositivos
4. Organizar el código de forma limpia y mantenible

### Valoración personal

Estoy contento con el resultado final. La aplicación hace lo que debe hacer, se ve bien y el código está bien organizado. Creo que es un proyecto útil que yo mismo puedo usar para organizar mis libros.

He cumplido todos los requisitos de la práctica:
✅ Uso de Vue.js 3
✅ HTML y CSS
✅ Objetos con import/export
✅ Gestión de datos con LocalStorage
✅ Patrón AbstractFactory implementado
✅ Varias vistas y componentes
✅ Interactividad con formularios y filtros
✅ Aplicación desplegada y funcional

---

## 11. BIBLIOGRAFÍA Y RECURSOS

### Documentación oficial consultada:
- Vue.js 3: https://vuejs.org/
- Vite: https://vitejs.dev/
- MDN Web Docs (LocalStorage): https://developer.mozilla.org/

### Recursos de diseño:
- Unsplash: Para las imágenes de portadas
- Google Fonts: Aunque al final usé Segoe UI del sistema

### Inspiración:
- Goodreads: Para ver cómo organizan las bibliotecas
- Varias aplicaciones de gestión de libros en Google Play

### Herramientas utilizadas:
- VS Code: Editor de código
- Firefox Developer Tools: Para debugging
- Git: Control de versiones
- Firebase: Hosting

---

## ANEXO: CAPTURAS DE PANTALLA

### Vista Principal - Biblioteca
La vista principal muestra todos los libros en formato de tarjetas con sus portadas, información básica y botones de acción.

### Formulario de Añadir Libro
Formulario completo con validación y vista previa en tiempo real del libro que se va a añadir.

### Vista de Estadísticas
Panel de estadísticas con métricas generales, progreso de lectura, distribución por categorías e insights inteligentes.

### Búsqueda y Filtros
Los filtros y la búsqueda funcionan en tiempo real sin necesidad de pulsar ningún botón.

### Responsive en Móvil
La aplicación se adapta perfectamente a pantallas pequeñas, con los elementos reorganizados en una sola columna.

---

**Fin de la documentación**

*Antonio Valero - DAW2 - DWEC - Noviembre 2025*
*Proyecto MyBookShelf - Gestión de Biblioteca Personal*
