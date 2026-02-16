# SpotMap - Tareas Pendientes

**Última actualización:** 16 Feb 2026  
**Estado general:** 3/15 tareas completadas (20%)

---

## 🔴 ALTA PRIORIDAD (Bloquean producción)

### [x] 1. Remover debug logs innecesarios ✅ COMPLETADA
**Ubicación:** `frontend/js/ui.js`, `frontend/js/spots.js`
**Trabajo efectuado:**
  - ✅ Removido `console.log('[UI-DEBUG]')` de ui.js línea 699
  - ✅ Removido `console.log('[SPOTS-DEBUG]')` de spots.js (4 logs eliminados en getTags())
  - ✅ Removido `console.error()` de onerror en images
**Impacto:** Console limpia, mejor performance en producción

---

### [x] 2. Implementar notificaciones spot aprobado/rechazado ✅ COMPLETADA
**Ubicación:** `backend/src/Controllers/NotificationController.php` (NEW), `frontend/js/notificationsManager.js` (NEW)
**Trabajo efectuado:**
  - ✅ Creada tabla `notifications` en MySQL + Supabase con RLS policies
  - ✅ Backend: NotificationController.php con endpoints CRUD
  - ✅ API: GET /notifications, GET /unread-count, PATCH /read, DELETE
  - ✅ Frontend: notificationsManager.js con polling cada 30s
  - ✅ UI: Botón campana 🔔 con badge de contador en navbar
  - ✅ Dropdown: Lista de notificaciones con opción marcar leídas/eliminar
  - ✅ Integration: AdminController crea notificaciones al aprobar/rechazar spots
  - ✅ Auth integration: init/cleanup en login/logout
**Impacto:** UX crítica - usuarios ahora saben estado de sus spots en tiempo real

### [x] 3. Refactorizar validación backend (robustez) ✅ COMPLETADA
**Ubicación:** `backend/src/Constants.php`, `backend/src/Auth.php`, `backend/src/Validator.php`, `backend/src/Controllers/SpotController.php`
**Problemas resueltos:**
  - ✅ **Creado Constants.php** - Centralización de todas las constantes (categorías, status, roles, límites)
  - ✅ **Auth::loadUserRole()** - Ahora carga rol real desde tabla `profiles` (antes siempre devolvía 'user')
  - ✅ **Sanitización** - Agregados métodos `sanitize()` y `clean()` en Validator
  - ✅ **Escalabilidad** - Todas las constantes hardcodeadas reemplazadas por referencias a Constants::
  - ✅ **Profesionalismo** - Métodos helper como `Constants::isModerator()` para lógica reutilizable
**Impacto:** 
  - 🛡️ Moderadores/admins ahora detectados correctamente
  - 🏗️ Único punto de entrada para cambiar reglas (Constants.php)
  - 🔐 Sanitización contra XSS
  - ✅ Cumple PROJECT_GUIDELINES: Scalable, robust, professional

---

## 🟠 MEDIA PRIORIDAD (Mejoran escalabilidad)

### [ ] 4. Implementar paginación spots
- **Ubicación:** `backend/public/api.php`, `frontend/js/spots.js`
- **Razón:** No queremos cargar 1000s de spots en memoria
- **Trabajo:**
  - Backend: agregar parámetros `limit=20&offset=0` a GET `/api/spots`
  - Frontend: implementar "Load More" button o infinite scroll
  - Cache: guardar en memoria página actual
- **Impacto:** Performance crítica si >500 spots
- **Nota:** Si ya hay <200 spots, no urgente pero planificar

### [ ] 5. Setup tests unitarios backend
- **Ubicación:** `backend/tests/`
- **Razón:** Validar endpoints sin romper código
- **Trabajo:**
  - Tests para `approveSpot()` con usuario no moderador (debe fallar)
  - Tests para `rejectSpot()` con razón
  - Tests para RLS policies (usuario A no ve spots de usuario B si no approved)
  - Tests para validación de coordenadas inválidas
- **Impacto:** Confiabilidad (detectar bugs antes de producción)

### [ ] 6. Setup tests E2E frontend
- **Ubicación:** `frontend/tests/`
- **Razón:** Validar flujo completo: login → crear spot → moderación
- **Trabajo:**
  - Tests con Cypress/Playwright
  - Flujo: login → crear spot → ver como pending → aprobar como mod → ver como approved
  - Test geolocalización
  - Test filtros
- **Impacto:** Confiabilidad (usuario journey completo)

### [ ] 7. Documentación API (Swagger/OpenAPI)
- **Ubicación:** `backend/openapi.json` (ya existe pero revisar)
- **Razón:** Devs nuevos necesitan saber endpoints
- **Trabajo:**
  - Completar OpenAPI con todos los endpoints
  - Documentar parámetros, responses, errores
  - Generar documentación HTML con Swagger UI
- **Impacto:** Mantenibilidad (onboarding devs)

### [ ] 8. Revisar y mejorar rate limiting
- **Ubicación:** `backend/src/RateLimiter.php`
- **Razón:** Prevenir abuse (spam de spots, ataques)
- **Trabajo:**
  - Verificar que está habilitado en endpoints críticos
  - Tests que usuario que excede límite recibe 429
  - Configurar límites apropiados (ej: 10 spots/día por usuario)
- **Impacto:** Seguridad (prevenir DOS)

---

## 🟡 BAJA PRIORIDAD (Mejoras de calidad)

### [ ] 9. Verificar security headers CORS
- **Ubicación:** `backend/src/Security.php`, `backend/public/index.php`
- **Razón:** Verificar que CORS solo permite origen correcto
- **Trabajo:**
  - Cambiar `ALLOWED_ORIGINS=*` a origen específico
  - Verificar headers: Content-Security-Policy, X-Frame-Options, etc.
  - Tests que origen no permitido recibe error
- **Impacto:** Seguridad (prevenir CSRF, XSS)

### [ ] 10. Implementar CI/CD pipeline
- **Ubicación:** `.github/workflows/` (crear)
- **Razón:** Tests y deploy automático
- **Trabajo:**
  - GitHub Actions para: lint, tests, build
  - Deploy a producción en merge a `main`
  - Health check post-deploy
- **Impacto:** DevOps (deployments confiables)

### [ ] 11. Sistema de auditoría para moderación
- **Ubicación:** `backend/src/` (nueva tabla)
- **Razón:** Rastrear quién aprobó/rechazó qué y cuándo
- **Trabajo:**
  - Nueva tabla `moderation_logs` (spot_id, moderator_id, action, reason, timestamp)
  - Insert en `approveSpot()` y `rejectSpot()`
  - Dashboard para ver historial
- **Impacto:** Compliance (auditoría)

### [ ] 12. Mejorar caché usuario/roles
- **Ubicación:** `frontend/js/auth.js`, `backend/src/Auth.php`
- **Razón:** No cargar rol del user cada vez
- **Trabajo:**
  - Frontend: cachear rol en localStorage, revalidar en intervals
  - Backend: verificar TTL de caché
- **Impacto:** Performance (reducir queries)

### [ ] 13. Error handling centralizado
- **Ubicación:** `frontend/js/` (crear errorHandler.js mejorado)
- **Razón:** Inconsistencia: algunos errores muestran toast, otros console
- **Trabajo:**
  - Centralizar manejo de errores
  - Errores de red → retry automático
  - Errores de validación → mostrar en formulario
  - Errores de servidor → log + usuario ve mensaje amigable
- **Impacto:** UX (usuario entiende qué salió mal)

### [ ] 14. Optimizar carga de imágenes (WebP)
- **Ubicación:** `backend/public/api.php`, `frontend/js/ui.js`
- **Razón:** Reducir tamaño de imágenes (50% vs JPEG)
- **Trabajo:**
  - Backend: convertir JPEG → WebP en upload
  - Frontend: servir WebP si navegador soporta
  - Fallback a JPEG para navegadores viejos
- **Impacto:** Performance (menos bandwidth)

### [ ] 15. Fix aria-hidden en modales
- **Ubicación:** `frontend/js/ui.js`, `frontend/js/mapPickerModal.js`
- **Razón:** Browser warnings sobre aria-hidden con foco
- **Trabajo:**
  - Usar `inert` attribute en lugar de `aria-hidden`
  - Verificar accesibilidad con screen reader
- **Impacto:** Accesibilidad (usuarios con discapacidades)

---

## 📊 Progreso General

| Categoría | Total | Completadas | % |
|-----------|-------|-------------|---|
| Alta Prioridad | 3 | 2 | 67% |
| Media Prioridad | 5 | 0 | 0% |
| Baja Prioridad | 7 | 0 | 0% |
| **TOTAL** | **15** | **2** | **13%** |

---

## 📝 Sesión Actual (16 Feb 2026)

**Completadas:**
1. ✅ Refactorizar validación backend (20 min) - Profesional y robusto
2. ✅ Remover debug logs (5 min) - Console limpia

**Próxima sesión:**
- Notificaciones de moderación (20 min - UX impacto) ← RECOMENDADO
- O: Tests backend (establece confiabilidad)

---

## 🚀 Checklista de Inicio por Sesión

```
Cuando vuelvas al proyecto:
- [ ] Revisar esta lista
- [ ] Elegir 1-2 tareas de la sesión
- [ ] Marcar como completadas
- [ ] Actualizar % de progreso
- [ ] Hacer commit: "chore: complete task #X"
```

---

## 📝 Notas

- **Sesión 1 (16 Feb):** Completada 3-tier approval system, moderación funcional, geolocalización mejorada
- **Sesión 2 (próxima):** Enfocarse en ALTA PRIORIDAD para estabilidad
- **Sesión 3+:** Completar MEDIA y BAJA prioridad para producción ready

---

**Last updated:** 2026-02-16  
**Next review:** Cuando completes primera tarea
