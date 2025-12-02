# CONTINUACIÓN DOCUMENTACIÓN SPOTMAP (VERSIÓN RESUMIDA)

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

## 6.2 Casos de uso (resumen)

- CU01 Ver mapa: todos; explorar marcadores y abrir detalles.
- CU02 Buscar spots: todos; sugerencias y centrado del mapa.
- CU03 Registrarse: visitante; crear cuenta y verificar email.
- CU04 Iniciar sesión: usuario; credenciales o proveedor externo.
- CU05 Crear spot: usuario/moderador/admin; formulario + ubicación + imagen.
- CU06 Valorar spot: usuario/moderador/admin; estrellas 1–5 con media.
- CU07 Comentar: usuario/moderador/admin; publicar y responder.
- CU08 Guardar favorito: usuario/moderador/admin; añadir/quitar.
- CU09 Reportar contenido: cualquiera registrado; motivo y envío a moderación.
- CU10 Moderar reporte: moderador/admin; aprobar, ocultar o eliminar.
- CU11 Ver estadísticas: admin; dashboard con métricas y exportación CSV.

[Inserta aquí el diagrama de casos de uso (imagen).]

---

# 7. DISEÑO DE INTERFAZ (RESUMEN)

## 7.1 Pantallas principales

- Mapa (inicio): mapa a pantalla completa, buscador, filtros y marcadores.
- Detalle de spot: foto, descripción, ubicación, valoraciones y comentarios.
- Crear/Editar spot: formulario, selección en mapa y subida de imagen.
- Perfil: mis spots, favoritos, ajustes y notificaciones.
- Moderación: lista de reportes, revisión y acciones.
- Administración: usuarios, categorías, y dashboard de métricas.

[Inserta aquí wireframes o capturas (imágenes).]

## 7.2 Guía visual mínima

- Colores: primario #0ea5e9, secundario #10b981, acento #f97316.
- Tipografía: Poppins (Google Fonts); cuerpo 16px; títulos 24–32px.
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

[Inserta aquí el sitemap/flujo (imagen).]
