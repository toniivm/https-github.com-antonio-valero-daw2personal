# 📖 Documentación API - SpotMap

## 🚀 Acceso Rápido

### Base REST (API principal)
```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php
```

### Interfaz Interactiva Swagger UI
```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/api.php?docs
```

### Especificación OpenAPI JSON
```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/api.php?openapi
```

---

## 🎯 Características de la Documentación

### ✨ Funcionalidades Implementadas

1. **Swagger UI Interactivo**
   - Interfaz visual completa para explorar la API
   - Prueba endpoints directamente desde el navegador
   - Autenticación automática con tokens de Supabase
   - Resaltado de sintaxis para respuestas JSON

2. **Especificación OpenAPI 3.0.3 Completa**
   - 10+ endpoints documentados
   - Esquemas de datos con validación
   - Códigos de estado HTTP detallados
   - Ejemplos de peticiones y respuestas
   - Seguridad Bearer Auth (JWT Supabase)

3. **Categorización por Tags**
   - 🗺️ **Spots**: CRUD de spots de escalada
   - 🔐 **Auth**: Autenticación y autorización
   - 💬 **Comments**: Comentarios en spots
   - ⭐ **Ratings**: Valoraciones de usuarios
   - ❤️ **Favorites**: Spots favoritos
   - 👑 **Admin**: Endpoints de administración

---

## 📝 Endpoints Documentados

### Spots
- `GET /spots` - Listar spots con filtros (paginación, categoría, tags, geolocalización, rating)
- `POST /spots` - Crear nuevo spot (requiere auth)
- `GET /spots/{id}` - Obtener detalles de un spot
- `DELETE /spots/{id}` - Eliminar spot (solo propietario/admin)

### Comments
- `GET /spots/{id}/comments` - Listar comentarios
- `POST /spots/{id}/comments` - Crear comentario (requiere auth)

### Ratings
- `POST /spots/{id}/ratings` - Valorar spot (requiere auth)

### Favorites
- `GET /favorites` - Listar favoritos del usuario (requiere auth)
- `POST /favorites` - Añadir spot a favoritos (requiere auth)

### Admin
- `GET /admin/pending` - Spots pendientes de moderación (solo moderadores/admins)

---

## 🔒 Autenticación

La API usa **Bearer Token Authentication** con JWT de Supabase:

```http
Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
```

### Configuración Automática en Swagger UI

El Swagger UI detecta automáticamente el token de `localStorage.getItem('supabaseToken')` y lo configura para todas las peticiones autenticadas.

Para probar endpoints protegidos:
1. Inicia sesión en tu frontend
2. Abre Swagger UI (`api.php?docs`)
3. El token se aplica automáticamente ✅

---

## 📊 Esquemas de Datos

### Spot (Modelo Principal)
```json
{
  "id": 1,
  "user_id": "uuid",
  "title": "El Chorro - Sector Frontales",
  "description": "...",
  "latitude": 36.9287,
  "longitude": -4.7684,
  "category_id": 1,
  "status": "approved",
  "avg_rating": 4.5,
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Validaciones
- **title**: 3-200 caracteres
- **description**: máx 2000 caracteres
- **latitude**: -90 a 90
- **longitude**: -180 a 180
- **rating**: 1-5 (entero)

---

## 🎨 Personalización UI

### Colores por Método HTTP
- 🟦 **GET**: Azul (#61affe)
- 🟩 **POST**: Verde (#49cc90)
- 🟥 **DELETE**: Rojo (#f93e3e)
- 🟧 **PUT**: Naranja (#fca130)

### Header Personalizado
- Gradiente morado (#667eea → #764ba2)
- Badges informativos (versión, tecnología)
- Diseño responsive

---

## 🔧 Configuración de Servidores

### Desarrollo (XAMPP Local)
```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php
```

### Producción
```
https://api.spotmap.com
```

---

## 📦 Tecnologías

- **OpenAPI**: 3.0.3
- **Swagger UI**: 5.11.0 (CDN)
- **Autenticación**: Supabase JWT
- **Backend**: PHP 8.2
- **Base de Datos**: PostgreSQL/Supabase

---

## 🧪 Testing con Swagger UI

### Flujo de Prueba Completo

1. **Abrir Documentación**
   ```
   http://localhost/.../api.php?docs
   ```

2. **Autenticación** (si es necesario)
   - Haz clic en "Authorize" 🔓
   - Pega tu token JWT de Supabase
   - Haz clic en "Authorize" ✅

3. **Probar Endpoint**
   - Expande el endpoint deseado
   - Haz clic en "Try it out"
   - Completa los parámetros
   - Haz clic en "Execute"
   - Revisa la respuesta y código de estado

---

## 🎓 Ventajas para Portfolio

### Para Entrevistas Técnicas

✅ **Profesionalismo**: Documentación estándar de industria (OpenAPI)  
✅ **Usabilidad**: Interfaz interactiva para probar la API sin Postman  
✅ **Mantenibilidad**: Especificación versionada y centralizada  
✅ **Escalabilidad**: Fácil añadir nuevos endpoints al JSON  
✅ **Estándares**: Sigue OpenAPI 3.0.3 (adoptado por Google, Microsoft, Stripe)

### Impacto en CV

> "API REST documentada con OpenAPI 3.0.3 y Swagger UI interactivo, permitiendo testing end-to-end sin herramientas externas."

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Docs](https://swagger.io/tools/swagger-ui/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

### Generación de Código
Desde Swagger UI puedes generar clientes en múltiples lenguajes:
- JavaScript/TypeScript
- Python
- Java
- C#
- PHP

---

## 🔄 Actualización de Documentación

### Añadir Nuevo Endpoint

1. Edita `backend/openapi.json`
2. Añade el path en `paths`:
   ```json
   "/new-endpoint": {
     "get": {
       "tags": ["Category"],
       "summary": "Description",
       "responses": { ... }
     }
   }
   ```
3. Recarga Swagger UI (F5)
4. ✅ El nuevo endpoint aparece automáticamente

### Añadir Nuevo Esquema

1. Añade en `components.schemas`:
   ```json
   "NewModel": {
     "type": "object",
     "properties": { ... }
   }
   ```
2. Referencia con `$ref: "#/components/schemas/NewModel"`

---

## 🐛 Troubleshooting

### Problema: "Failed to fetch OpenAPI spec"
**Solución**: Verifica que `backend/openapi.json` existe y es JSON válido

### Problema: "Authorization not working"
**Solución**: Verifica el token en localStorage con:
```javascript
console.log(localStorage.getItem('supabaseToken'));
```

### Problema: "CORS error"
**Solución**: Verifica que `Security::setCORSHeaders()` permite tu origen

---

## ✨ Próximas Mejoras

- [ ] Versionado de API (v1, v2)
- [ ] Webhooks documentation
- [ ] Rate limiting details
- [ ] Code generation for frontend
- [ ] Postman collection export
- [ ] ReDoc alternative UI

---

**Creado**: 2024  
**Versión**: 1.0.0  
**Mantenedor**: SpotMap Team  
**Licencia**: MIT
