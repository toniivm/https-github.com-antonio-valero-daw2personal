# 3. DIAGRAMAS DE PROCESOS

## 3.1 Diagrama de Clases UML

### Introducción
El diagrama de clases representa la estructura estática del sistema **SpotMap**, mostrando las clases principales, sus atributos, métodos y las relaciones entre ellas. Este diagrama se basa en una arquitectura **MVC (Model-View-Controller)** adaptada al patrón **Repository** y **Service Layer**.

---

### Diagrama de Clases Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID                                                              │
│ - email: String                                                         │
│ - password: String (hashed)                                             │
│ - fullName: String                                                      │
│ - role: Enum (user, moderator, admin)                                  │
│ - avatarUrl: String                                                     │
│ - emailVerified: Boolean                                                │
│ - createdAt: DateTime                                                   │
│ - updatedAt: DateTime                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ + register(email, password, fullName): User                             │
│ + login(email, password): AuthToken                                     │
│ + logout(): void                                                        │
│ + verifyEmail(token): Boolean                                           │
│ + resetPassword(email): void                                            │
│ + updateProfile(data): User                                             │
│ + changePassword(oldPassword, newPassword): Boolean                     │
│ + hasRole(role): Boolean                                                │
└───────────────┬─────────────────────────────────────────────────────────┘
                │
                │ 1                  creates
                │ *
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Spot                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ - id: UUID                                                              │
│ - userId: UUID                                                          │
│ - categoryId: Integer                                                   │
│ - title: String                                                         │
│ - description: Text                                                     │
│ - latitude: Decimal                                                     │
│ - longitude: Decimal                                                    │
│ - imageUrl: String                                                      │
│ - address: String                                                       │
│ - ratingAvg: Decimal                                                    │
│ - ratingCount: Integer                                                  │
│ - views: Integer                                                        │
│ - status: Enum (active, pending, deleted)                              │
│ - createdAt: DateTime                                                   │
│ - updatedAt: DateTime                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ + create(data): Spot                                                    │
│ + update(id, data): Spot                                                │
│ + delete(id): Boolean                                                   │
│ + findById(id): Spot                                                    │
│ + findAll(filters): Spot[]                                              │
│ + findNearby(lat, lng, radius): Spot[]                                  │
│ + incrementViews(): void                                                │
│ + updateRating(): void                                                  │
│ + getComments(): Comment[]                                              │
│ + getRatings(): Rating[]                                                │
│ + getTags(): Tag[]                                                      │
│ + isFavoritedBy(userId): Boolean                                        │
└───────┬───────────────────────────────┬─────────────────────────────────┘
        │                               │
        │ *                             │ *
        │ has                           │ belongs to
        │                               │
        │                               ▼
        │                    ┌──────────────────────┐
        │                    │      Category        │
        │                    ├──────────────────────┤
        │                    │ - id: Integer        │
        │                    │ - name: String       │
        │                    │ - slug: String       │
        │                    │ - icon: String       │
        │                    │ - color: String      │
        │                    │ - description: Text  │
        │                    ├──────────────────────┤
        │                    │ + findAll(): []      │
        │                    │ + findBySlug(): Cat  │
        │                    └──────────────────────┘
        │
        ├─────────────────────────────────┬─────────────────────┐
        │                                 │                     │
        │ 1                               │ 1                   │ 1
        │ *                               │ *                   │ *
        │ has                             │ has                 │ has
        │                                 │                     │
        ▼                                 ▼                     ▼
┌──────────────────┐          ┌──────────────────┐   ┌──────────────────┐
│     Comment      │          │      Rating      │   │     Favorite     │
├──────────────────┤          ├──────────────────┤   ├──────────────────┤
│ - id: UUID       │          │ - id: Integer    │   │ - id: Integer    │
│ - userId: UUID   │          │ - userId: UUID   │   │ - userId: UUID   │
│ - spotId: UUID   │          │ - spotId: UUID   │   │ - spotId: UUID   │
│ - parentId: UUID │          │ - rating: Int    │   │ - createdAt: DT  │
│ - text: Text     │          │ - createdAt: DT  │   ├──────────────────┤
│ - likes: Integer │          ├──────────────────┤   │ + toggle(): Bool │
│ - createdAt: DT  │          │ + create(): Rat  │   │ + findByUser():[]│
│ - updatedAt: DT  │          │ + update(): Rat  │   └──────────────────┘
├──────────────────┤          │ + delete(): Bool │
│ + create(): Comm │          │ + getAverage():  │
│ + update(): Comm │          │   Decimal        │
│ + delete(): Bool │          └──────────────────┘
│ + getReplies():[]│
│ + like(): void   │
└──────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                              Tag                                      │
├──────────────────────────────────────────────────────────────────────┤
│ - id: Integer                                                        │
│ - name: String                                                       │
│ - slug: String                                                       │
│ - usageCount: Integer                                                │
├──────────────────────────────────────────────────────────────────────┤
│ + create(name): Tag                                                  │
│ + findOrCreate(name): Tag                                            │
│ + incrementUsage(): void                                             │
│ + getMostUsed(limit): Tag[]                                          │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
                            │ *
                            │ belongs to many
                            │ *
                            ▼
                 ┌────────────────────┐
                 │     Spot (ref)     │ N:M relationship
                 └────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                            Report                                     │
├──────────────────────────────────────────────────────────────────────┤
│ - id: UUID                                                           │
│ - userId: UUID                                                       │
│ - spotId: UUID (nullable)                                            │
│ - commentId: UUID (nullable)                                         │
│ - reason: Enum (spam, inappropriate, duplicate, fake, other)        │
│ - description: Text                                                  │
│ - status: Enum (pending, reviewed, resolved, dismissed)             │
│ - createdAt: DateTime                                                │
│ - resolvedAt: DateTime                                               │
│ - resolvedBy: UUID                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ + create(data): Report                                               │
│ + update(id, status): Report                                         │
│ + resolve(id, moderatorId): Boolean                                  │
│ + dismiss(id, moderatorId): Boolean                                  │
│ + findPending(): Report[]                                            │
│ + findByStatus(status): Report[]                                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          Notification                                 │
├──────────────────────────────────────────────────────────────────────┤
│ - id: UUID                                                           │
│ - userId: UUID                                                       │
│ - type: Enum (comment, like, favorite, report, system)              │
│ - title: String                                                      │
│ - message: Text                                                      │
│ - link: String                                                       │
│ - read: Boolean                                                      │
│ - createdAt: DateTime                                                │
├──────────────────────────────────────────────────────────────────────┤
│ + create(data): Notification                                         │
│ + markAsRead(id): Boolean                                            │
│ + markAllAsRead(userId): Integer                                     │
│ + findUnread(userId): Notification[]                                 │
│ + delete(id): Boolean                                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Explicación de las Relaciones

#### **User ──1:*──> Spot (creates)**
- Un usuario puede crear múltiples spots
- Cada spot pertenece a un único usuario (autor)
- **Cardinalidad:** 1 User → * Spots
- **Navegabilidad:** Bidireccional (User.getSpots(), Spot.getUser())

#### **Spot ──*:1──> Category (belongs_to)**
- Un spot pertenece a una categoría
- Una categoría agrupa múltiples spots
- **Cardinalidad:** * Spots → 1 Category
- **Navegabilidad:** Unidireccional (Spot.getCategory())

#### **Spot ──1:*──> Comment (has)**
- Un spot puede tener múltiples comentarios
- Cada comentario pertenece a un spot
- **Cardinalidad:** 1 Spot → * Comments
- **Navegabilidad:** Bidireccional (Spot.getComments(), Comment.getSpot())

#### **Comment ──1:*──> Comment (replies_to) - AUTO-RELACIÓN**
- Un comentario puede tener múltiples respuestas
- Una respuesta pertenece a un comentario padre
- **Cardinalidad:** 1 Comment → * Comments
- **Navegabilidad:** Bidireccional (Comment.getReplies(), Comment.getParent())

#### **Spot ──1:*──> Rating (receives)**
- Un spot puede recibir múltiples valoraciones
- Cada valoración pertenece a un spot
- **Cardinalidad:** 1 Spot → * Ratings
- **Restricción:** Un usuario solo puede valorar un spot una vez

#### **User ──1:*──> Favorite (saves)**
- Un usuario puede guardar múltiples favoritos
- Cada favorito pertenece a un usuario
- **Cardinalidad:** 1 User → * Favorites
- **Restricción:** Un usuario no puede guardar el mismo spot dos veces

#### **Spot ──*:*──> Tag (is_tagged_with)**
- Un spot puede tener múltiples tags
- Un tag puede estar en múltiples spots
- **Cardinalidad:** * Spots ↔ * Tags
- **Implementación:** Tabla intermedia `spot_tags`

---

## 3.2 Casos de Uso

### Introducción
Los casos de uso describen las interacciones entre los **actores** (usuarios del sistema) y el sistema **SpotMap**. Cada caso de uso representa una funcionalidad específica del sistema.

---

### Actores del Sistema

#### **🧑 Visitante (Guest)**
Usuario no autenticado que navega por la plataforma.

**Permisos:**
- ✅ Visualizar spots en el mapa
- ✅ Buscar spots por nombre/ubicación
- ✅ Filtrar por categoría
- ✅ Ver detalles de spots (descripción, imágenes, comentarios)
- ❌ No puede crear, comentar, valorar ni guardar favoritos

---

#### **🧑‍💼 Usuario Registrado (Registered User)**
Usuario autenticado con cuenta en la plataforma.

**Permisos:**
- ✅ Todo lo que puede hacer un Visitante
- ✅ Crear nuevos spots
- ✅ Editar/eliminar sus propios spots
- ✅ Comentar en spots
- ✅ Valorar spots (1-5 estrellas)
- ✅ Guardar spots como favoritos
- ✅ Reportar contenido inapropiado
- ✅ Recibir notificaciones
- ✅ Ver y editar su perfil

---

#### **👮 Moderador (Moderator)**
Usuario con permisos de moderación de contenido.

**Permisos:**
- ✅ Todo lo que puede hacer un Usuario Registrado
- ✅ Revisar reportes de contenido
- ✅ Aprobar/rechazar spots en estado "pendiente"
- ✅ Eliminar spots/comentarios inapropiados
- ✅ Suspender usuarios temporalmente
- ✅ Ver panel de moderación

---

#### **👨‍💼 Administrador (Administrator)**
Usuario con control total del sistema.

**Permisos:**
- ✅ Todo lo que puede hacer un Moderador
- ✅ Gestionar usuarios (editar roles, eliminar cuentas)
- ✅ Gestionar categorías y tags
- ✅ Ver estadísticas globales
- ✅ Configurar parámetros del sistema
- ✅ Acceder a logs y auditorías

---

### Diagrama de Casos de Uso (Formato Texto)

```
┌────────────────────────────────────────────────────────────────────┐
│                         SPOTMAP SYSTEM                              │
└────────────────────────────────────────────────────────────────────┘

┌─────────────┐                                           
│  Visitante  │                                           
│  (Guest)    │────────────┐                              
└─────────────┘            │                              
                           ▼                              
                   (UC-01) Visualizar mapa                
                   (UC-02) Buscar spots                   
                   (UC-03) Filtrar por categoría          
                   (UC-04) Ver detalles de spot           

┌─────────────┐                                           
│   Usuario   │                                           
│ Registrado  │────────────┐                              
└─────────────┘            │                              
                           ▼                              
                   (UC-05) Registrarse                    
                   (UC-06) Iniciar sesión                 
                   (UC-07) Cerrar sesión                  
                   (UC-08) Recuperar contraseña           
                   (UC-09) Editar perfil                  
                   (UC-10) Crear spot                     
                   (UC-11) Editar spot propio             
                   (UC-12) Eliminar spot propio           
                   (UC-13) Comentar en spot               
                   (UC-14) Valorar spot                   
                   (UC-15) Guardar favorito               
                   (UC-16) Ver mis favoritos              
                   (UC-17) Reportar contenido             
                   (UC-18) Ver notificaciones             

┌─────────────┐                                           
│  Moderador  │────────────┐                              
└─────────────┘            │                              
                           ▼                              
                   (UC-19) Ver reportes pendientes        
                   (UC-20) Resolver reporte               
                   (UC-21) Aprobar/rechazar spot          
                   (UC-22) Eliminar contenido inapropiado 
                   (UC-23) Suspender usuario              

┌──────────────┐                                          
│Administrador │────────────┐                             
└──────────────┘            │                             
                            ▼                             
                   (UC-24) Gestionar usuarios             
                   (UC-25) Gestionar categorías           
                   (UC-26) Ver estadísticas globales      
                   (UC-27) Configurar sistema             
                   (UC-28) Ver logs de auditoría          
```

---

### Especificación Detallada de Casos de Uso

---

#### **UC-01: Visualizar Mapa**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-01 |
| **Nombre** | Visualizar mapa interactivo con spots |
| **Actores** | Visitante, Usuario Registrado, Moderador, Administrador |
| **Descripción** | El usuario visualiza un mapa interactivo con marcadores de todos los spots activos |
| **Precondición** | El usuario accede a la página principal |
| **Flujo Normal** | 1. El sistema carga el mapa centrado en la ubicación del usuario (si permite geolocalización) o en una ubicación por defecto<br>2. El sistema muestra marcadores de todos los spots activos<br>3. El usuario puede hacer zoom, desplazar el mapa y hacer click en marcadores<br>4. Al hacer click en un marcador, se muestra un popup con información básica del spot<br>5. El usuario puede hacer click en "Ver detalles" para ver información completa |
| **Flujo Alternativo** | - Si el usuario no permite geolocalización, el mapa se centra en una ubicación por defecto (ej: Madrid) |
| **Postcondición** | El mapa muestra todos los spots disponibles con sus marcadores |
| **Excepciones** | - Error de conexión: Mostrar mensaje "No se pudo cargar el mapa"<br>- Sin spots en la zona: Mostrar mensaje "No hay spots en esta zona" |

---

#### **UC-02: Buscar Spots**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-02 |
| **Nombre** | Buscar spots por nombre o ubicación |
| **Actores** | Visitante, Usuario Registrado, Moderador, Administrador |
| **Descripción** | El usuario busca spots mediante palabras clave o nombre de ubicación |
| **Precondición** | El usuario está en la página principal |
| **Flujo Normal** | 1. El usuario escribe en el campo de búsqueda<br>2. El sistema muestra autocompletado con sugerencias mientras escribe<br>3. El usuario selecciona una sugerencia o presiona Enter<br>4. El sistema filtra los spots que coincidan con la búsqueda<br>5. El mapa se centra en los resultados encontrados<br>6. La lista lateral muestra solo los spots filtrados |
| **Flujo Alternativo** | - Si no hay resultados, mostrar mensaje "No se encontraron spots" |
| **Postcondición** | El sistema muestra solo los spots que coinciden con la búsqueda |
| **Excepciones** | - Campo vacío: No filtrar, mostrar todos los spots |

---

#### **UC-05: Registrarse**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-05 |
| **Nombre** | Registrar nueva cuenta de usuario |
| **Actores** | Visitante |
| **Descripción** | Un visitante crea una cuenta en el sistema |
| **Precondición** | El usuario no tiene cuenta activa |
| **Flujo Normal** | 1. El usuario hace click en "Registrarse"<br>2. El sistema muestra un formulario con los campos:<br>   - Nombre completo<br>   - Email<br>   - Contraseña<br>   - Confirmar contraseña<br>   - Checkbox "Acepto términos y condiciones"<br>3. El usuario completa los campos<br>4. El sistema valida:<br>   - Email único (no registrado previamente)<br>   - Contraseña mínimo 6 caracteres<br>   - Contraseñas coinciden<br>   - Términos aceptados<br>5. El sistema crea la cuenta<br>6. El sistema envía email de verificación<br>7. El sistema inicia sesión automáticamente<br>8. El sistema muestra mensaje "Cuenta creada correctamente" |
| **Flujo Alternativo** | - Si el email ya existe: Mostrar error "Este email ya está registrado"<br>- Si las contraseñas no coinciden: Mostrar error "Las contraseñas no coinciden" |
| **Postcondición** | Se crea una cuenta de usuario con rol "user" |
| **Excepciones** | - Error del servidor: Mostrar mensaje "Error al crear la cuenta. Intenta de nuevo" |

---

#### **UC-10: Crear Spot**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-10 |
| **Nombre** | Crear nuevo spot fotográfico |
| **Actores** | Usuario Registrado, Moderador, Administrador |
| **Descripción** | Un usuario autenticado crea un nuevo spot en el mapa |
| **Precondición** | El usuario está autenticado |
| **Flujo Normal** | 1. El usuario hace click en "Añadir Spot"<br>2. El sistema muestra un formulario modal con los campos:<br>   - Nombre del spot (requerido)<br>   - Descripción<br>   - Categoría (desplegable)<br>   - Coordenadas (lat, lng)<br>   - URL de imagen<br>3. El usuario puede:<br>   - Escribir coordenadas manualmente<br>   - Hacer click en el mapa para obtener coordenadas automáticamente<br>4. El usuario completa el formulario<br>5. El sistema valida:<br>   - Nombre no vacío<br>   - Coordenadas válidas (lat: -90 a 90, lng: -180 a 180)<br>   - URL de imagen válida (opcional)<br>6. El sistema crea el spot<br>7. El sistema muestra el nuevo spot en el mapa<br>8. El sistema muestra mensaje "Spot creado correctamente" |
| **Flujo Alternativo** | - Si las coordenadas son inválidas: Mostrar error "Coordenadas fuera de rango"<br>- Si la URL de imagen no es válida: Mostrar advertencia pero permitir creación |
| **Postcondición** | Se crea un nuevo spot asociado al usuario autenticado |
| **Excepciones** | - Error del servidor: Mostrar mensaje "Error al crear el spot" |

---

#### **UC-13: Comentar en Spot**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-13 |
| **Nombre** | Añadir comentario a un spot |
| **Actores** | Usuario Registrado, Moderador, Administrador |
| **Descripción** | Un usuario autenticado añade un comentario a un spot |
| **Precondición** | - El usuario está autenticado<br>- El usuario ha abierto el modal de detalles de un spot |
| **Flujo Normal** | 1. El usuario visualiza el modal de detalles del spot<br>2. El usuario escribe en el campo de comentario<br>3. El usuario hace click en "Publicar comentario"<br>4. El sistema valida que el comentario no esté vacío<br>5. El sistema crea el comentario<br>6. El sistema actualiza la lista de comentarios en tiempo real<br>7. El sistema muestra mensaje "Comentario añadido"<br>8. El sistema envía notificación al autor del spot |
| **Flujo Alternativo** | - Si el comentario está vacío: Mostrar error "Escribe algo antes de publicar"<br>- **Responder a un comentario:**<br>  1. El usuario hace click en "Responder" en un comentario existente<br>  2. El sistema muestra campo de texto anidado<br>  3. El usuario escribe y publica<br>  4. El comentario se muestra como respuesta anidada |
| **Postcondición** | Se crea un comentario asociado al spot y al usuario |
| **Excepciones** | - Error del servidor: Mostrar mensaje "Error al añadir comentario" |

---

#### **UC-14: Valorar Spot**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-14 |
| **Nombre** | Valorar spot con estrellas |
| **Actores** | Usuario Registrado, Moderador, Administrador |
| **Descripción** | Un usuario autenticado valora un spot con 1-5 estrellas |
| **Precondición** | - El usuario está autenticado<br>- El usuario NO ha valorado previamente este spot |
| **Flujo Normal** | 1. El usuario visualiza el modal de detalles del spot<br>2. El usuario hace click en las estrellas (1-5)<br>3. El sistema valida que el usuario no haya valorado previamente<br>4. El sistema crea la valoración<br>5. El sistema actualiza la media de valoración del spot<br>6. El sistema actualiza el contador de valoraciones<br>7. El sistema muestra mensaje "Valoración añadida"<br>8. El sistema actualiza visualmente las estrellas en el modal |
| **Flujo Alternativo** | - Si el usuario ya valoró el spot: Mostrar mensaje "Ya has valorado este spot" (actualizar valoración existente) |
| **Postcondición** | Se crea/actualiza una valoración y se recalcula la media del spot |
| **Excepciones** | - Error del servidor: Mostrar mensaje "Error al valorar" |

---

#### **UC-19: Ver Reportes Pendientes**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-19 |
| **Nombre** | Visualizar reportes pendientes de moderación |
| **Actores** | Moderador, Administrador |
| **Descripción** | Un moderador visualiza todos los reportes pendientes de revisión |
| **Precondición** | El usuario tiene rol "moderator" o "admin" |
| **Flujo Normal** | 1. El moderador accede al panel de moderación<br>2. El sistema muestra lista de reportes con estado "pending"<br>3. Para cada reporte se muestra:<br>   - Tipo de contenido reportado (spot o comentario)<br>   - Razón del reporte (spam, inapropiado, duplicado, falso)<br>   - Descripción del usuario reportante<br>   - Fecha del reporte<br>   - Link al contenido reportado<br>4. El moderador puede ordenar por:<br>   - Fecha (más recientes primero)<br>   - Tipo de razón<br>   - Número de reportes del mismo contenido<br>5. El moderador puede hacer click en un reporte para ver detalles |
| **Flujo Alternativo** | - Si no hay reportes pendientes: Mostrar mensaje "No hay reportes pendientes" |
| **Postcondición** | El moderador visualiza todos los reportes pendientes |
| **Excepciones** | - Error de permisos: Redirigir a página principal |

---

#### **UC-20: Resolver Reporte**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-20 |
| **Nombre** | Resolver reporte de contenido |
| **Actores** | Moderador, Administrador |
| **Descripción** | Un moderador revisa un reporte y toma acción |
| **Precondición** | - El usuario tiene rol "moderator" o "admin"<br>- Existe un reporte en estado "pending" |
| **Flujo Normal** | 1. El moderador selecciona un reporte<br>2. El sistema muestra:<br>   - Contenido reportado (spot o comentario completo)<br>   - Información del autor del contenido<br>   - Razón y descripción del reporte<br>   - Historial de reportes del autor (si existen)<br>3. El moderador puede:<br>   - **Resolver (eliminar contenido):**<br>     a. El sistema elimina el contenido<br>     b. El sistema marca el reporte como "resolved"<br>     c. El sistema registra fecha y moderador<br>     d. El sistema envía notificación al autor del contenido<br>   - **Desestimar (contenido válido):**<br>     a. El sistema marca el reporte como "dismissed"<br>     b. El sistema registra fecha y moderador<br>     c. El sistema NO elimina el contenido<br>4. El sistema muestra mensaje "Reporte resuelto" |
| **Flujo Alternativo** | - Si el moderador no está seguro: Puede marcar como "reviewed" y escalarlo a administrador |
| **Postcondición** | El reporte cambia de estado y se registra la acción del moderador |
| **Excepciones** | - Error del servidor: Mostrar mensaje "Error al resolver reporte" |

---

#### **UC-26: Ver Estadísticas Globales**

| Campo | Descripción |
|-------|-------------|
| **Código** | UC-26 |
| **Nombre** | Visualizar estadísticas del sistema |
| **Actores** | Administrador |
| **Descripción** | Un administrador visualiza métricas globales del sistema |
| **Precondición** | El usuario tiene rol "admin" |
| **Flujo Normal** | 1. El administrador accede al panel de administración<br>2. El sistema muestra dashboard con:<br>   - **Usuarios:**<br>     • Total de usuarios registrados<br>     • Usuarios activos (últimos 30 días)<br>     • Nuevos registros (últimos 7 días)<br>   - **Spots:**<br>     • Total de spots creados<br>     • Spots activos/pendientes/eliminados<br>     • Spots más visitados<br>     • Spots mejor valorados<br>   - **Actividad:**<br>     • Total de comentarios<br>     • Total de valoraciones<br>     • Total de favoritos<br>     • Total de reportes<br>   - **Categorías:**<br>     • Spots por categoría (gráfico de pastel)<br>   - **Geográfico:**<br>     • Mapa de calor con densidad de spots<br>3. El administrador puede exportar datos en CSV |
| **Flujo Alternativo** | - Filtrar por rango de fechas específico |
| **Postcondición** | El administrador visualiza métricas actualizadas del sistema |
| **Excepciones** | - Error de permisos: Redirigir a página principal |

---

### Resumen de Prioridades de Casos de Uso

| Prioridad | Casos de Uso |
|-----------|--------------|
| **Alta (MVP)** | UC-01, UC-02, UC-05, UC-06, UC-10, UC-13, UC-14 |
| **Media** | UC-03, UC-04, UC-07, UC-08, UC-09, UC-11, UC-12, UC-15, UC-16, UC-17, UC-18 |
| **Baja** | UC-19, UC-20, UC-21, UC-22, UC-23, UC-24, UC-25, UC-26, UC-27, UC-28 |

---

---

## 3.3 Diagramas de Secuencia

### Introducción
Los diagramas de secuencia muestran la interacción temporal entre los diferentes componentes del sistema **SpotMap**. Cada diagrama representa un flujo crítico del sistema mostrando el orden de las llamadas entre frontend, backend y base de datos.

---

### DS-01: Secuencia de Registro de Usuario

```
Usuario          Frontend          Backend API       Supabase Auth     Database
  │                 │                   │                  │              │
  │──Register Form─>│                   │                  │              │
  │                 │                   │                  │              │
  │                 │──POST /register──>│                  │              │
  │                 │   {email,         │                  │              │
  │                 │    password,      │                  │              │
  │                 │    fullName}      │                  │              │
  │                 │                   │                  │              │
  │                 │                   │──signUp()───────>│              │
  │                 │                   │   {email,        │              │
  │                 │                   │    password}     │              │
  │                 │                   │                  │              │
  │                 │                   │                  │──INSERT──────>│
  │                 │                   │                  │   auth.users │
  │                 │                   │                  │<────OK───────│
  │                 │                   │                  │              │
  │                 │                   │<──{user, jwt}───│              │
  │                 │                   │                  │              │
  │                 │                   │──INSERT─────────────────────────>│
  │                 │                   │   public.users  │              │
  │                 │                   │   {id, email,   │              │
  │                 │                   │    full_name,   │              │
  │                 │                   │    role:'user'} │              │
  │                 │                   │<────OK──────────────────────────│
  │                 │                   │                  │              │
  │                 │                   │──sendEmail()────>│              │
  │                 │                   │   (verification) │              │
  │                 │                   │                  │              │
  │                 │<──201 Created────│                  │              │
  │                 │   {user, token}   │                  │              │
  │                 │                   │                  │              │
  │<──Success Msg───│                   │                  │              │
  │   "Cuenta       │                   │                  │              │
  │    creada"      │                   │                  │              │
  │                 │                   │                  │              │
  │                 │──Store token─────>│                  │              │
  │                 │   localStorage    │                  │              │
  │                 │                   │                  │              │
  │                 │──Redirect to─────>│                  │              │
  │                 │   Dashboard       │                  │              │
```

**Descripción del flujo:**
1. El usuario completa el formulario de registro
2. El frontend envía petición POST `/register` al backend
3. El backend llama a `Supabase.auth.signUp()` para crear usuario en el sistema de autenticación
4. Supabase crea el registro en la tabla `auth.users` y genera un JWT
5. El backend inserta registro complementario en `public.users` con `full_name` y `role`
6. Supabase envía email de verificación automáticamente
7. El backend responde con código 201 y datos del usuario + token
8. El frontend guarda el token en `localStorage`
9. El frontend redirige al dashboard y muestra mensaje de éxito

**Validaciones involucradas:**
- Email único (constraint en base de datos)
- Password mínimo 6 caracteres (Supabase)
- Email formato válido (Supabase)

---

### DS-02: Secuencia de Inicio de Sesión

```
Usuario          Frontend          Backend API       Supabase Auth     Database
  │                 │                   │                  │              │
  │──Login Form────>│                   │                  │              │
  │  {email,        │                   │                  │              │
  │   password}     │                   │                  │              │
  │                 │                   │                  │              │
  │                 │──POST /login─────>│                  │              │
  │                 │   {email,         │                  │              │
  │                 │    password}      │                  │              │
  │                 │                   │                  │              │
  │                 │                   │──signIn()───────>│              │
  │                 │                   │                  │              │
  │                 │                   │                  │──SELECT──────>│
  │                 │                   │                  │   FROM       │
  │                 │                   │                  │   auth.users │
  │                 │                   │                  │   WHERE      │
  │                 │                   │                  │   email=?    │
  │                 │                   │                  │<────user─────│
  │                 │                   │                  │              │
  │                 │                   │                  │──verify──────>│
  │                 │                   │                  │   password   │
  │                 │                   │                  │   hash       │
  │                 │                   │                  │<────OK───────│
  │                 │                   │                  │              │
  │                 │                   │<──{user,jwt}────│              │
  │                 │                   │                  │              │
  │                 │                   │──SELECT─────────────────────────>│
  │                 │                   │   FROM public.  │              │
  │                 │                   │   users WHERE   │              │
  │                 │                   │   id=?          │              │
  │                 │                   │<────userData────────────────────│
  │                 │                   │   {full_name,   │              │
  │                 │                   │    role, etc}   │              │
  │                 │                   │                  │              │
  │                 │<──200 OK─────────│                  │              │
  │                 │   {user, token,   │                  │              │
  │                 │    role}          │                  │              │
  │                 │                   │                  │              │
  │<──Success Msg───│                   │                  │              │
  │   "Bienvenido"  │                   │                  │              │
  │                 │                   │                  │              │
  │                 │──Store token─────>│                  │              │
  │                 │   sessionStorage  │                  │              │
  │                 │                   │                  │              │
  │                 │──Load userData───>│                  │              │
  │                 │   to state        │                  │              │
  │                 │                   │                  │              │
  │                 │──Update UI───────>│                  │              │
  │                 │   (show user      │                  │              │
  │                 │    menu)          │                  │              │
```

**Descripción del flujo:**
1. El usuario introduce email y contraseña
2. El frontend envía POST `/login` al backend
3. El backend llama a `Supabase.auth.signIn()`
4. Supabase busca el usuario en `auth.users` por email
5. Supabase verifica el hash de la contraseña con bcrypt
6. Si es válido, Supabase genera JWT con claims (user_id, role, exp)
7. El backend obtiene datos adicionales de `public.users` (full_name, avatar_url, role)
8. El backend responde con 200 OK + user + token
9. El frontend guarda el token en `sessionStorage` (sesión temporal)
10. El frontend actualiza el estado global de la aplicación
11. El frontend actualiza la UI mostrando menú de usuario autenticado

**Manejo de errores:**
- Credenciales incorrectas → 401 Unauthorized
- Usuario no verificado → 403 Forbidden (mostrar mensaje "Verifica tu email")
- Cuenta suspendida → 403 Forbidden

---

### DS-03: Secuencia de Creación de Spot

```
Usuario          Frontend          Backend API       Supabase Storage  Database
  │                 │                   │                   │             │
  │──Click "Add─────>│                   │                   │             │
  │   Spot"         │                   │                   │             │
  │                 │                   │                   │             │
  │                 │──Show modal──────>│                   │             │
  │                 │   with form       │                   │             │
  │                 │                   │                   │             │
  │<──Form visible──│                   │                   │             │
  │                 │                   │                   │             │
  │──Fill form─────>│                   │                   │             │
  │  + select image │                   │                   │             │
  │                 │                   │                   │             │
  │──Submit────────>│                   │                   │             │
  │                 │                   │                   │             │
  │                 │──Validate data───>│                   │             │
  │                 │   (client-side)   │                   │             │
  │                 │                   │                   │             │
  │                 │──Upload image────────────────────────>│             │
  │                 │   POST /storage   │                   │             │
  │                 │   with File       │                   │             │
  │                 │                   │                   │             │
  │                 │                   │                   │──Store──────>│
  │                 │                   │                   │   blob      │
  │                 │                   │                   │<────OK──────│
  │                 │                   │                   │             │
  │                 │<──{imageUrl}──────────────────────────│             │
  │                 │                   │                   │             │
  │                 │──POST /spots─────>│                   │             │
  │                 │   {title,         │                   │             │
  │                 │    description,   │                   │             │
  │                 │    categoryId,    │                   │             │
  │                 │    latitude,      │                   │             │
  │                 │    longitude,     │                   │             │
  │                 │    imageUrl}      │                   │             │
  │                 │                   │                   │             │
  │                 │                   │──Verify JWT──────────────────────>│
  │                 │                   │   (auth header)   │             │
  │                 │                   │<────user_id──────────────────────│
  │                 │                   │                   │             │
  │                 │                   │──Validate────────────────────────>│
  │                 │                   │   coordinates    │             │
  │                 │                   │   (-90≤lat≤90)   │             │
  │                 │                   │   (-180≤lng≤180) │             │
  │                 │                   │                   │             │
  │                 │                   │──INSERT──────────────────────────>│
  │                 │                   │   INTO spots     │             │
  │                 │                   │   (id, user_id,  │             │
  │                 │                   │    title, desc,  │             │
  │                 │                   │    lat, lng,     │             │
  │                 │                   │    image_url,    │             │
  │                 │                   │    category_id,  │             │
  │                 │                   │    status)       │             │
  │                 │                   │   VALUES(uuid(), │             │
  │                 │                   │    ?, ?, ...)    │             │
  │                 │                   │<────spot_id──────────────────────│
  │                 │                   │                   │             │
  │                 │                   │──INSERT──────────────────────────>│
  │                 │                   │   INTO images    │             │
  │                 │                   │   (spot_id,      │             │
  │                 │                   │    url, order)   │             │
  │                 │                   │<────OK───────────────────────────│
  │                 │                   │                   │             │
  │                 │<──201 Created────│                   │             │
  │                 │   {spot object}   │                   │             │
  │                 │                   │                   │             │
  │<──Success Msg───│                   │                   │             │
  │   "Spot creado" │                   │                   │             │
  │                 │                   │                   │             │
  │                 │──Add marker──────>│                   │             │
  │                 │   to map          │                   │             │
  │                 │                   │                   │             │
  │                 │──Close modal─────>│                   │             │
```

**Descripción del flujo:**
1. El usuario hace click en botón "Añadir Spot"
2. El frontend muestra modal con formulario
3. El usuario completa: título, descripción, categoría, coordenadas (click en mapa o manual), imagen
4. El frontend valida datos en cliente (campos obligatorios, formato coordenadas)
5. **Si hay imagen:** Se sube primero a Supabase Storage y se obtiene la URL pública
6. El frontend envía POST `/spots` con todos los datos + JWT en header `Authorization`
7. El backend verifica el JWT y extrae `user_id`
8. El backend valida coordenadas en rango válido
9. El backend inserta registro en tabla `spots` con status='active'
10. El backend inserta la imagen en tabla `images` con `order=1`
11. El backend responde con 201 Created + objeto spot completo
12. El frontend añade marcador al mapa sin recargar página
13. El frontend cierra modal y muestra toast de éxito

**Validaciones:**
- Título no vacío (max 100 caracteres)
- Coordenadas válidas: -90 ≤ lat ≤ 90, -180 ≤ lng ≤ 180
- Categoría existente (FK constraint)
- Usuario autenticado (JWT válido)
- Imagen máximo 5MB (validación en Storage)

---

### DS-04: Secuencia de Añadir Comentario

```
Usuario          Frontend          Backend API       Database          Notificaciones
  │                 │                   │                 │                    │
  │──Click "Add─────>│                   │                 │                    │
  │   Comment"      │                   │                 │                    │
  │                 │                   │                 │                    │
  │──Write text────>│                   │                 │                    │
  │                 │                   │                 │                    │
  │──Submit────────>│                   │                 │                    │
  │                 │                   │                 │                    │
  │                 │──Check auth──────>│                 │                    │
  │                 │   (JWT exists?)   │                 │                    │
  │                 │                   │                 │                    │
  │                 │──POST /comments──>│                 │                    │
  │                 │   {spotId,        │                 │                    │
  │                 │    text,          │                 │                    │
  │                 │    parentId?}     │                 │                    │
  │                 │   + JWT header    │                 │                    │
  │                 │                   │                 │                    │
  │                 │                   │──Verify JWT────>│                    │
  │                 │                   │<────user_id────│                    │
  │                 │                   │                 │                    │
  │                 │                   │──Validate──────>│                    │
  │                 │                   │   text not      │                    │
  │                 │                   │   empty         │                    │
  │                 │                   │                 │                    │
  │                 │                   │──XSS Filter────>│                    │
  │                 │                   │   (sanitize)    │                    │
  │                 │                   │                 │                    │
  │                 │                   │──INSERT────────>│                    │
  │                 │                   │   INTO comments │                    │
  │                 │                   │   (id, user_id, │                    │
  │                 │                   │    spot_id,     │                    │
  │                 │                   │    text,        │                    │
  │                 │                   │    parent_id)   │                    │
  │                 │                   │<────comment────│                    │
  │                 │                   │                 │                    │
  │                 │                   │──SELECT────────>│                    │
  │                 │                   │   spot.user_id  │                    │
  │                 │                   │   FROM spots    │                    │
  │                 │                   │   WHERE id=?    │                    │
  │                 │                   │<────author_id──│                    │
  │                 │                   │                 │                    │
  │                 │                   │──INSERT────────>│                    │
  │                 │                   │   INTO          │                    │
  │                 │                   │   notifications │                    │
  │                 │                   │   (user_id:     │                    │
  │                 │                   │    author_id,   │                    │
  │                 │                   │    type:        │                    │
  │                 │                   │    'comment',   │                    │
  │                 │                   │    message)     │                    │
  │                 │                   │<────OK─────────│                    │
  │                 │                   │                 │                    │
  │                 │                   │──Trigger────────────────────────────>│
  │                 │                   │   notification  │                    │
  │                 │                   │   (WebSocket/   │                    │
  │                 │                   │    Push)        │                    │
  │                 │                   │                 │                    │
  │                 │<──201 Created────│                 │                    │
  │                 │   {comment        │                 │                    │
  │                 │    with user      │                 │                    │
  │                 │    data}          │                 │                    │
  │                 │                   │                 │                    │
  │<──Success Msg───│                   │                 │                    │
  │                 │                   │                 │                    │
  │                 │──Append to────────>│                 │                    │
  │                 │   comments list   │                 │                    │
  │                 │   (optimistic UI) │                 │                    │
```

**Descripción del flujo:**
1. El usuario escribe en el campo de comentario dentro del modal de detalles
2. El usuario hace click en "Publicar comentario"
3. El frontend verifica que hay sesión activa (JWT existe)
4. El frontend envía POST `/comments` con `spotId`, `text` y opcionalmente `parentId` (si es respuesta)
5. El backend verifica el JWT y extrae `user_id`
6. El backend valida que el texto no esté vacío
7. El backend sanitiza el texto para prevenir XSS (escapa HTML)
8. El backend inserta el comentario en la base de datos
9. El backend obtiene el `user_id` del autor del spot
10. El backend crea una notificación para el autor del spot
11. El backend dispara evento de notificación (WebSocket/Push Notification)
12. El backend responde con 201 + comentario completo + datos del usuario
13. El frontend añade el comentario a la lista inmediatamente (Optimistic UI)

**Características especiales:**
- **Comentarios anidados:** Si `parentId` existe, se muestra como respuesta indentada
- **Tiempo relativo:** "Hace 2 minutos", "Hace 1 hora" usando función `getTimeAgo()`
- **XSS Protection:** Todos los comentarios pasan por `escapeHtml()` antes de renderizar

---

### DS-05: Secuencia de Valoración de Spot

```
Usuario          Frontend          Backend API       Database
  │                 │                   │                 │
  │──Click stars───>│                   │                 │
  │  (3 stars)      │                   │                 │
  │                 │                   │                 │
  │                 │──Check auth──────>│                 │
  │                 │                   │                 │
  │                 │──POST /ratings───>│                 │
  │                 │   {spotId,        │                 │
  │                 │    rating: 3}     │                 │
  │                 │   + JWT header    │                 │
  │                 │                   │                 │
  │                 │                   │──Verify JWT────>│
  │                 │                   │<────user_id────│
  │                 │                   │                 │
  │                 │                   │──Validate──────>│
  │                 │                   │   rating 1-5    │
  │                 │                   │                 │
  │                 │                   │──SELECT────────>│
  │                 │                   │   FROM ratings  │
  │                 │                   │   WHERE user_id │
  │                 │                   │   AND spot_id   │
  │                 │                   │<────existing?──│
  │                 │                   │                 │
  ┌─────────────────────────────────────────────────────┐│
  │ IF EXISTS:      │                   │                 ││
  │                 │                   │──UPDATE────────>││
  │                 │                   │   ratings       ││
  │                 │                   │   SET rating=3  ││
  │                 │                   │   WHERE id=?    ││
  │ ELSE:           │                   │                 ││
  │                 │                   │──INSERT────────>││
  │                 │                   │   INTO ratings  ││
  └─────────────────────────────────────────────────────┘│
  │                 │                   │<────OK─────────│
  │                 │                   │                 │
  │                 │                   │──TRIGGER───────>│
  │                 │                   │   update_spot_  │
  │                 │                   │   rating_avg()  │
  │                 │                   │                 │
  │                 │                   │   UPDATE spots──>│
  │                 │                   │   SET rating_avg│
  │                 │                   │   = (SELECT AVG)│
  │                 │                   │   rating_count  │
  │                 │                   │   = (SELECT CNT)│
  │                 │                   │   WHERE id=?    │
  │                 │                   │<────OK─────────│
  │                 │                   │                 │
  │                 │<──200 OK─────────│                 │
  │                 │   {rating,        │                 │
  │                 │    newAvg: 3.7,   │                 │
  │                 │    count: 12}     │                 │
  │                 │                   │                 │
  │<──Success Msg───│                   │                 │
  │   "Valoración   │                   │                 │
  │    añadida"     │                   │                 │
  │                 │                   │                 │
  │                 │──Update UI───────>│                 │
  │                 │   - Fill stars    │                 │
  │                 │   - Show new avg  │                 │
  │                 │   - Update count  │                 │
```

**Descripción del flujo:**
1. El usuario hace click en las estrellas (1-5) dentro del modal de detalles
2. El frontend verifica autenticación
3. El frontend envía POST `/ratings` con `spotId` y `rating` (1-5)
4. El backend verifica JWT y extrae `user_id`
5. El backend valida que rating esté entre 1 y 5
6. El backend busca si el usuario ya valoró este spot
7. **Si existe:** Actualiza la valoración existente
8. **Si no existe:** Inserta nueva valoración
9. El backend ejecuta TRIGGER `update_spot_rating_avg()` automáticamente:
   - Calcula la media de todas las valoraciones del spot
   - Cuenta el número total de valoraciones
   - Actualiza `spots.rating_avg` y `spots.rating_count`
10. El backend responde con 200 OK + nueva media + nuevo contador
11. El frontend actualiza la UI:
    - Rellena las estrellas hasta la valoración del usuario
    - Actualiza la media global (ej: "3.7 ⭐")
    - Actualiza el contador (ej: "12 valoraciones")

**Restricciones:**
- Un usuario solo puede valorar un spot una vez (constraint UNIQUE)
- Rating debe ser entre 1 y 5 (constraint CHECK)
- Usuario autenticado requerido

---

### DS-06: Secuencia de Búsqueda Geoespacial

```
Usuario          Frontend          Backend API       Database (PostGIS)
  │                 │                   │                    │
  │──Move/zoom map─>│                   │                    │
  │                 │                   │                    │
  │                 │──Get bounds──────>│                    │
  │                 │   (viewport)      │                    │
  │                 │   ne: {lat, lng}  │                    │
  │                 │   sw: {lat, lng}  │                    │
  │                 │                   │                    │
  │                 │──GET /spots──────>│                    │
  │                 │   ?bounds=ne.lat, │                    │
  │                 │     ne.lng,sw.lat,│                    │
  │                 │     sw.lng        │                    │
  │                 │   &category=3     │                    │
  │                 │                   │                    │
  │                 │                   │──Build query──────>│
  │                 │                   │   SELECT *         │
  │                 │                   │   FROM spots       │
  │                 │                   │   WHERE            │
  │                 │                   │   latitude         │
  │                 │                   │   BETWEEN sw.lat   │
  │                 │                   │   AND ne.lat       │
  │                 │                   │   AND longitude    │
  │                 │                   │   BETWEEN sw.lng   │
  │                 │                   │   AND ne.lng       │
  │                 │                   │   AND category_id  │
  │                 │                   │   = 3              │
  │                 │                   │   AND status=      │
  │                 │                   │   'active'         │
  │                 │                   │                    │
  │                 │                   │   [OPTIMIZADO CON] │
  │                 │                   │   INDEX idx_spots_ │
  │                 │                   │   location         │
  │                 │                   │   (latitude,       │
  │                 │                   │    longitude)      │
  │                 │                   │                    │
  │                 │                   │<────spots[]────────│
  │                 │                   │   (50 results)     │
  │                 │                   │                    │
  │                 │                   │──Join data────────>│
  │                 │                   │   LEFT JOIN        │
  │                 │                   │   categories       │
  │                 │                   │   LEFT JOIN users  │
  │                 │                   │<────enriched───────│
  │                 │                   │                    │
  │                 │<──200 OK─────────│                    │
  │                 │   [{id, title,    │                    │
  │                 │     latitude,     │                    │
  │                 │     longitude,    │                    │
  │                 │     category: {   │                    │
  │                 │       name, icon, │                    │
  │                 │       color       │                    │
  │                 │     },            │                    │
  │                 │     user: {       │                    │
  │                 │       full_name   │                    │
  │                 │     },            │                    │
  │                 │     rating_avg,   │                    │
  │                 │     image_url     │                    │
  │                 │   }, ...]         │                    │
  │                 │                   │                    │
  │                 │──Clear markers───>│                    │
  │                 │                   │                    │
  │                 │──Add markers─────>│                    │
  │                 │   for each spot   │                    │
  │                 │   with custom     │                    │
  │                 │   icon by         │                    │
  │                 │   category        │                    │
  │                 │                   │                    │
  │<──Map updated───│                   │                    │
```

**Descripción del flujo:**
1. El usuario mueve o hace zoom en el mapa
2. El frontend calcula los límites del viewport (bounds): noreste y suroeste
3. El frontend envía GET `/spots` con parámetros de consulta:
   - `bounds`: coordenadas del rectángulo visible
   - `category`: ID de categoría (opcional, si hay filtro activo)
4. El backend construye consulta SQL con:
   - Filtro de latitud BETWEEN `sw.lat` AND `ne.lat`
   - Filtro de longitud BETWEEN `sw.lng` AND `ne.lng`
   - Filtro de categoría (si aplica)
   - Solo spots con status='active'
5. La consulta se optimiza usando índice `idx_spots_location (latitude, longitude)`
6. El backend hace JOIN con `categories` para obtener nombre, icono y color
7. El backend hace JOIN con `users` para obtener `full_name` del autor
8. El backend responde con array de spots con toda la información necesaria
9. El frontend limpia los marcadores existentes del mapa
10. El frontend añade nuevos marcadores con iconos personalizados por categoría
11. El mapa se actualiza mostrando solo los spots visibles

**Optimizaciones:**
- Índice compuesto en `(latitude, longitude)` para búsqueda rápida
- Límite de 500 spots por viewport (evitar sobrecarga)
- Debounce de 300ms en eventos de movimiento del mapa (evitar múltiples llamadas)

---

## 3.4 Diagramas de Actividad

### Introducción
Los diagramas de actividad muestran el flujo de trabajo de procesos complejos con decisiones, bucles y condiciones en **SpotMap**.

---

### DA-01: Proceso de Moderación de Reportes

```
┌─ INICIO: Moderador accede al panel de moderación ─┐
│                                                     │
▼                                                     │
┌──────────────────────────────────┐                 │
│  Cargar lista de reportes        │                 │
│  con status = 'pending'           │                 │
└───────────┬──────────────────────┘                 │
            │                                         │
            ▼                                         │
         ┌────┐                                       │
         │ ¿Hay│                                      │
         │reportes│ ──NO──> [Mostrar "No hay         │
         │pending?│          reportes pendientes"]    │
         └──┬─────┘          │                        │
            │YES             │                        │
            ▼                │                        │
┌──────────────────────────────────┐                 │
│  Seleccionar reporte de la lista │                 │
└───────────┬──────────────────────┘                 │
            │                                         │
            ▼                                         │
┌──────────────────────────────────┐                 │
│  Visualizar contenido reportado: │                 │
│  - Spot o Comentario completo    │                 │
│  - Razón del reporte             │                 │
│  - Descripción del reportante    │                 │
│  - Historial del autor           │                 │
└───────────┬──────────────────────┘                 │
            │                                         │
            ▼                                         │
         ┌─────┐                                      │
         │¿Deci │                                     │
         │sión? │                                     │
         └──┬───┘                                     │
            │                                         │
     ┌──────┼────────┐                                │
     │      │        │                                │
   RESOLVER │      DESESTIMAR                         │
     │      │        │                                │
     ▼      │        ▼                                │
┌─────────  │  ┌──────────────┐                      │
│Eliminar   │  │Marcar como   │                      │
│contenido  │  │'dismissed'   │                      │
│reportado  │  └──────┬───────┘                      │
└─────┬──── │         │                               │
      │     │         │                               │
      ▼     │         ▼                               │
┌───────────┴──────────────────┐                     │
│ Marcar reporte como          │                     │
│ 'resolved' o 'dismissed'     │                     │
│ Registrar moderator_id       │                     │
│ Registrar resolved_at        │                     │
└───────────┬──────────────────┘                     │
            │                                         │
            ▼                                         │
         ┌────┐                                       │
         │¿Es │                                       │
         │'reso│──YES──>┌──────────────────────┐     │
         │lved'│         │Enviar notificación   │     │
         │?    │         │al autor del contenido│     │
         └──┬──┘         └──────────┬───────────┘     │
            │NO                     │                 │
            │◄──────────────────────┘                 │
            │                                         │
            ▼                                         │
┌──────────────────────────────────┐                 │
│  Actualizar lista de reportes    │                 │
│  (eliminar de vista pending)     │                 │
└───────────┬──────────────────────┘                 │
            │                                         │
            ▼                                         │
         ┌────┐                                       │
         │¿Más│                                       │
         │repo │──YES──────────────────┐              │
         │rtes?│                       │              │
         └──┬──┘                       │              │
            │NO                        │              │
            │                          │              │
            ▼                          │              │
       ┌─ FIN ─┐                      │              │
                                       │              │
                                       └──────────────┘
```

**Decisiones clave:**
1. **¿Hay reportes pending?** → Si NO: Mostrar mensaje vacío
2. **¿Decisión del moderador?** → RESOLVER (eliminar) o DESESTIMAR (mantener)
3. **¿Es 'resolved'?** → Si YES: Enviar notificación al autor
4. **¿Más reportes?** → Si YES: Volver al inicio del bucle

---

### DA-02: Flujo de Autenticación y Protección de Rutas

```
┌─ INICIO: Usuario intenta acceder a una página ─┐
│                                                  │
▼                                                  │
┌───────────────────────────────┐                 │
│  Verificar si existe token    │                 │
│  en sessionStorage/           │                 │
│  localStorage                 │                 │
└────────┬──────────────────────┘                 │
         │                                         │
         ▼                                         │
      ┌─────┐                                      │
      │¿Token│                                     │
      │existe│──NO──>┌─────────────────────┐      │
      │?    │        │¿Página requiere     │      │
      └──┬──┘        │autenticación?       │      │
         │YES        └──┬────────────┬─────┘      │
         │              │YES         │NO           │
         │              │            │             │
         │              ▼            ▼             │
         │         [Redirigir]  [Permitir         │
         │         [a login]    acceso]            │
         │                       │                 │
         ▼                       │                 │
┌────────────────────────────┐  │                 │
│  Decodificar JWT           │  │                 │
│  Extraer claims:           │  │                 │
│  - user_id                 │  │                 │
│  - email                   │  │                 │
│  - role                    │  │                 │
│  - exp (expiración)        │  │                 │
└────────┬───────────────────┘  │                 │
         │                       │                 │
         ▼                       │                 │
      ┌─────┐                    │                 │
      │¿Token│                   │                 │
      │expi  │──YES──>┌─────────┴──────────┐      │
      │rado? │        │Eliminar token      │      │
      └──┬───┘        │Redirigir a login   │      │
         │NO          │Mostrar "Sesión     │      │
         │            │expirada"           │      │
         ▼            └────────────────────┘      │
┌────────────────────────────┐                    │
│  Verificar firma JWT       │                    │
│  con secret del servidor   │                    │
└────────┬───────────────────┘                    │
         │                                         │
         ▼                                         │
      ┌─────┐                                      │
      │¿Firma│                                     │
      │válida│──NO──>┌──────────────────┐         │
      │?    │        │Token inválido    │         │
      └──┬──┘        │Eliminar token    │         │
         │YES        │Redirigir a login │         │
         │           └──────────────────┘         │
         ▼                                         │
┌────────────────────────────┐                    │
│  Cargar datos del usuario  │                    │
│  desde backend o cache:    │                    │
│  - full_name               │                    │
│  - avatar_url              │                    │
│  - role                    │                    │
└────────┬───────────────────┘                    │
         │                                         │
         ▼                                         │
      ┌─────┐                                      │
      │¿Página│                                    │
      │requie │──YES──>┌──────────────────┐       │
      │re rol │        │¿Usuario tiene    │       │
      │espe  │        │rol requerido?    │       │
      │cífico│        └──┬────────┬──────┘       │
      │?    │           │YES      │NO             │
      └──┬──┘           │         │               │
         │NO            │         ▼               │
         │              │    [Redirigir a         │
         │              │     403 Forbidden]      │
         │              │                          │
         ▼              ▼                          │
┌──────────────────────────────────┐              │
│  Actualizar UI:                  │              │
│  - Mostrar nombre de usuario     │              │
│  - Mostrar avatar                │              │
│  - Mostrar menú según rol        │              │
│  - Habilitar botones protegidos  │              │
└────────┬─────────────────────────┘              │
         │                                         │
         ▼                                         │
    ┌─ FIN: Acceso permitido ─┐                   │
```

**Decisiones clave:**
1. **¿Token existe?** → Si NO: Verificar si página requiere auth
2. **¿Token expirado?** → Si YES: Eliminar y redirigir a login
3. **¿Firma válida?** → Si NO: Token manipulado, redirigir a login
4. **¿Página requiere rol específico?** → Si YES: Verificar rol del usuario
5. **¿Usuario tiene rol requerido?** → Si NO: Mostrar 403 Forbidden

**Ejemplo de roles requeridos:**
- Panel de moderación: `role='moderator'` OR `role='admin'`
- Panel de administración: `role='admin'`
- Crear spot: `authenticated` (cualquier rol)
- Ver spots: `public` (sin autenticación)

---

**Fin del Documento 3: Diagramas de Procesos (Completo)**
