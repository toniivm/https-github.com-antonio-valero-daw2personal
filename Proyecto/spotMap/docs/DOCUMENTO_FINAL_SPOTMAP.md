# DOCUMENTO FINAL – SPOTMAP (para copiar y pegar en Word)

---

## Instrucciones rápidas

- Copiar a Word: abre este archivo, pulsa Ctrl+A y Ctrl+C; pega en Word con Ctrl+V. Word respeta títulos, listas y tablas.
- Marcadores de imagen: busca bloques con [IMAGEN: …]. Inserta ahí tus imágenes exportadas (PNG/JPG).
- Cómo generar imágenes (rápido y gratis):
  - Draw.io: https://app.diagrams.net/ → plantillas "UML Class Diagram", "Use Case", "ERD".
  - Excalidraw: https://excalidraw.com/ → estilo boceto para wireframes.
  - IA (opcional): pega la descripción en tu IA favorita y pide el diagrama.

---

# 3. DESCRIPCIÓN DEL ENTORNO TECNOLÓGICO

## 3.1 Perfiles de usuario

- Visitante: navega por el mapa y consulta spots.
- Usuario registrado: crea/edita/elimina sus spots; comenta, valora y guarda favoritos.
- Moderador: revisa reportes, valida/oculta contenido y gestiona incidencias.
- Administrador: panel completo, estadísticas, roles, categorías y configuración global.

## 3.2 Tecnologías asociadas a cada perfil (resumen)

- Visitante: Navegador moderno; frontend HTML/CSS/JS; mapa con Leaflet + OpenStreetMap.
- Usuario registrado: HTML/CSS/JS + API PHP; autenticación JWT; subida de imágenes (Supabase Storage).
- Moderador: Panel web interno; API PHP; revisión de reportes; acceso a métricas básicas.
- Administrador: Panel avanzado; dashboards con Chart.js; gestión de roles/categorías; monitorización y logs.

---

# 4. ESPECIFICACIÓN DE REQUISITOS (RESUMEN)

## 4.1 Requisitos Funcionales (RF)

- RF1. Registrarse: crear cuenta con email y contraseña (verificación por correo).
- RF2. Iniciar sesión: acceso con credenciales (JWT) o proveedores externos.
- RF3. Cerrar sesión: finalizar sesión de forma segura en cualquier momento.
- RF4. Crear spots: añadir título, descripción, categoría, ubicación e imagen.
- RF5. Editar spots: modificar datos de spots propios.
- RF6. Eliminar spots: borrar spots propios y sus datos asociados.
- RF7. Explorar mapa: ver spots en mapa interactivo con filtros.
- RF8. Buscar spots: búsqueda por texto, categoría o localidad.
- RF9. Favoritos: guardar/retirar spots favoritos del usuario.
- RF10. Comentarios: añadir y responder comentarios en spots.
- RF11. Moderación: revisar, aprobar/ocultar/eliminar contenido reportado.
- RF12. Reportes: denunciar spots/comentarios con motivo.
- RF13. Gestión de usuarios: roles, suspensiones y restablecimientos.
- RF14. Estadísticas: métricas básicas de uso (usuarios, spots, actividad).
- RF15. Notificaciones: avisos sobre comentarios, valoraciones y moderación.

---

# 5. MODELO ENTIDAD-RELACIÓN

## 5.1 Justificación del Modelo E/R

El modelo entidad-relación de **SpotMap** surge del análisis de los requisitos funcionales del sistema. A continuación se explica el origen de cada entidad y relación del modelo.

### 5.1.1 Origen de las Entidades

**USERS (Usuarios)**
- **Origen**: Requisito RF1, RF2, RF3 - Sistema de autenticación
- **Justificación**: Es necesaria para identificar usuarios, establecer autoría de contenido y gestionar permisos según roles (usuario, moderador, administrador)

**SPOTS (Puntos Fotográficos)**
- **Origen**: Requisito RF4, RF5, RF6, RF7 - Funcionalidad principal
- **Justificación**: Entidad central del sistema. Representa localizaciones fotográficas con información geoespacial, descriptiva y multimedia

**CATEGORIES (Categorías)**
- **Origen**: Requisito RF7, RF8 - Clasificación de contenido
- **Justificación**: Organiza spots por tipo (mirador, playa, urbano, montaña) facilitando navegación y filtrado

**COMMENTS (Comentarios)**
- **Origen**: Requisito RF10 - Interacción social
- **Justificación**: Permite a usuarios compartir experiencias y consejos sobre cada spot. Incluye soporte para respuestas anidadas (hilos de conversación)

**RATINGS (Valoraciones)**
- **Origen**: Requisito RF7 - Sistema de calidad
- **Justificación**: Sistema de valoración 1-5 estrellas para medir satisfacción y generar ranking de popularidad

**FAVORITES (Favoritos)**
- **Origen**: Requisito RF9 - Colecciones personales
- **Justificación**: Permite a usuarios guardar spots de interés para planificar rutas fotográficas

**REPORTS (Reportes)**
- **Origen**: Requisito RF11, RF12 - Moderación de contenido
- **Justificación**: Sistema de control de calidad para gestionar contenido inapropiado o duplicado

**TAGS (Etiquetas)**
- **Origen**: Requisito RF8 - Búsqueda avanzada
- **Justificación**: Sistema flexible de palabras clave (hashtags) para mejorar descubrimiento de spots

**IMAGES (Imágenes)**
- **Origen**: Requisito RF4 - Contenido multimedia
- **Justificación**: Gestiona múltiples imágenes por spot con metadatos y orden de visualización

**NOTIFICATIONS (Notificaciones)**
- **Origen**: Requisito RF15 - Comunicación con usuarios
- **Justificación**: Sistema de alertas para mantener usuarios informados de actividad relevante (comentarios, likes, reportes)

### 5.1.2 Origen de las Relaciones

**USER → SPOT (1:N - "crea")**
- Un usuario puede crear múltiples spots
- Cada spot pertenece a un único autor
- Necesaria para establecer autoría y permisos de edición

**SPOT → CATEGORY (N:1 - "pertenece a")**
- Cada spot tiene una categoría principal
- Una categoría agrupa múltiples spots
- Facilita filtrado eficiente en el mapa

**USER → COMMENT (1:N - "escribe")**
- Un usuario puede escribir múltiples comentarios
- Identifica al autor de cada comentario

**SPOT → COMMENT (1:N - "tiene")**
- Un spot puede tener múltiples comentarios
- Centraliza conversaciones sobre cada spot

**COMMENT → COMMENT (1:N - "responde a")**
- Auto-relación para respuestas anidadas
- Permite conversaciones estructuradas en hilos

**USER → RATING (1:N - "valora")**
- Un usuario puede valorar múltiples spots
- Restricción: Un usuario solo puede valorar cada spot una vez

**SPOT → RATING (1:N - "recibe")**
- Un spot puede recibir múltiples valoraciones
- Se calcula media automáticamente

**USER → FAVORITE (1:N - "guarda")**
- Un usuario puede tener múltiples favoritos
- Implementa colecciones personales

**SPOT → FAVORITE (1:N - "es favorito de")**
- Un spot puede ser favorito de múltiples usuarios
- Mide popularidad real

**USER → REPORT (1:N - "reporta")**
- Un usuario puede crear múltiples reportes
- Previene spam con validaciones

**SPOT → REPORT (1:N - "es reportado")**
- Un spot puede ser reportado múltiples veces
- Prioriza spots con más reportes

**COMMENT → REPORT (1:N - "es reportado")**
- Un comentario puede ser reportado múltiples veces
- Sistema de moderación de comentarios

**SPOT ↔ TAG (N:M - "está etiquetado con")**
- Un spot puede tener múltiples tags
- Un tag puede estar en múltiples spots
- Implementado mediante tabla intermedia SPOT_TAGS

**SPOT → IMAGE (1:N - "contiene")**
- Un spot puede tener múltiples imágenes
- Permite galerías fotográficas

**USER → NOTIFICATION (1:N - "recibe")**
- Un usuario puede recibir múltiples notificaciones
- Sistema de alertas personalizado

---

## 5.2 Diagrama Entidad-Relación

[IMAGEN: Diagrama E/R]

>> Genera esta imagen así:
>> - Herramienta: Draw.io → plantilla "Entity Relation" (o ERDPlus)
>> - Crea las 11 entidades listadas y conéctalas con las relaciones de 5.1.2 (marca 1:N y N:M)
>> - Exporta en PNG/JPG a 2x de escala

(Descripción textual incluida arriba como guía de apoyo.)

---

## 5.3 Explicación del Origen de los Atributos

[Sección completa con tablas y justificación, tal cual.] 

---

## 5.4 Elección de Claves Primarias

[Sección completa con comparativa UUID/INT y justificación, tal cual.]

---

# 5.5 MODELO RELACIONAL

## 5.5.1 Paso del Modelo E/R al Modelo Relacional

[Sección completa con reglas y ejemplos SQL, tal cual.]

---

## 5.5.2 Esquema Relacional Completo

[Sección completa con el esquema de todas las tablas, tal cual.]

---

## 5.5.3 Diagrama Relacional

[IMAGEN: Diagrama Relacional]

>> Genera esta imagen así:
>> - Herramienta: Draw.io → plantilla "Database" (o ERDPlus)
>> - Dibuja tablas con PK/FK/UNIQUE y une FKs a PKs (anota ON DELETE)
>> - Exporta en PNG/JPG a 2x de escala

(Descripción textual incluida arriba como guía.)

---

## 5.5.4 Explicación de ON DELETE y ON UPDATE

[Sección completa con tabla-resumen de decisiones.]

---

## 5.5.5 Normalización del Modelo

[Sección completa: 1FN, 2FN, 3FN y desnormalización controlada.]

---

**FIN DE LA SECCIÓN 5: MODELO ENTIDAD-RELACIÓN Y MODELO RELACIONAL**

---

# 6. DIAGRAMAS DE PROCESOS

## 6.1 Diagrama de Clases (resumen)

- User: usuarios, roles y perfil.
- Spot: puntos fotográficos, geolocalización e imagen principal.
- Comment: comentarios e hilos.
- Rating: valoraciones 1–5.
- Category: clasificación por tipo.
- Favorite: guardados del usuario.
- Soporte: Tag, Report, Image, Notification.

Relaciones clave:
- User 1:N Spot; Spot N:1 Category
- Spot 1:N Comment (y Comment 1:N Comment)
- Spot 1:N Rating; User 1:N Rating
- User 1:N Favorite; Favorite N:1 Spot

[IMAGEN: Diagrama UML de Clases]

>> Genera esta imagen así:
>> - Herramienta: Draw.io → plantilla "UML Class Diagram"
>> - Crea las 8–10 clases con atributos mínimos y relaciones (agrega multiplicidades)
>> - Exporta PNG/JPG a 2x

---

## 6.2 Casos de uso (resumen)

- CU01 Ver mapa; CU02 Buscar; CU03 Registrarse; CU04 Iniciar sesión; CU05 Crear spot; CU06 Valorar; CU07 Comentar; CU08 Favorito; CU09 Reportar; CU10 Moderar; CU11 Estadísticas.

[IMAGEN: Diagrama de Casos de Uso]

>> Genera esta imagen así:
>> - Herramienta: Draw.io → plantilla "UML Use Case"
>> - 4 actores (Visitante, Usuario, Moderador, Admin) a la izquierda; óvalos en el centro
>> - Herencia entre actores (Usuario hereda de Visitante)

---

# 7. DISEÑO DE INTERFAZ (resumen)

## 7.1 Pantallas principales

- Mapa (inicio): mapa a pantalla completa, buscador, filtros y marcadores.
- Detalle de spot: foto, descripción, ubicación, valoraciones y comentarios.
- Crear/Editar spot: formulario, selección en mapa y subida de imagen.
- Perfil: mis spots, favoritos, ajustes y notificaciones.
- Moderación: lista de reportes y acciones.
- Administración: usuarios, categorías, dashboard de métricas.

[IMAGEN: Wireframes de pantallas]

>> Genera esta imagen así:
>> - Herramienta: Figma/Excalidraw/Balsamiq (lo que prefieras)
>> - Boceto rápido de las 3 vistas clave (Inicio, Detalle, Formulario)

## 7.2 Guía visual mínima

- Colores: primario #0ea5e9, secundario #10b981, acento #f97316.
- Tipografía: Poppins; cuerpo 16px; títulos 24–32px.
- Iconos: Bootstrap Icons.

## 7.3 Navegación (esquema)

/
├─ Mapa (inicio)
├─ Sobre (about)
├─ FAQ
├─ Blog
├─ Autenticación (modales: login/registro)
└─ Perfil (privado)
   ├─ Mis Spots
   ├─ Favoritos
   ├─ Notificaciones
   └─ Ajustes

/admin (privado)
├─ Moderación
└─ Dashboard

[IMAGEN: Sitemap / flujo]

>> Genera esta imagen así:
>> - Herramienta: Gloomaps (sitemap) o Draw.io (flowchart)
>> - Árbol jerárquico con páginas públicas/privadas

---

## Apéndice: notas para entregar en Word

- Ajusta estilos de títulos y tablas al formato de tu centro.
- Inserta cada [IMAGEN: …] donde corresponda y centra la imagen.
- Si falta espacio, mueve las notas "Genera esta imagen así" a un apéndice.
