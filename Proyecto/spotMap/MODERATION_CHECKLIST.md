# ✅ Checklist de Activación del Sistema de Moderación

## 🎯 Objetivo Final
Gente sube spots (pending) → TÚ apruebas/rechazas → Solo aprobados aparecen en público

---

## FASE 1: Base de Datos ✓

- [ ] **1.1** Accede a tu proyecto Supabase (supabase.com)
- [ ] **1.2** Ve a `SQL Editor`
- [ ] **1.3** Copia el SQL de `SUPABASE_SPOTS_STATUS.sql`
- [ ] **1.4** Ejecuta en Supabase
  ```sql
  ALTER TABLE public.spots 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' 
  CHECK (status IN ('pending', 'approved', 'rejected'));
  
  CREATE INDEX IF NOT EXISTS spots_status_idx ON public.spots(status);
  
  UPDATE public.spots SET status = 'approved' WHERE status IS NULL;
  ```
- [ ] **1.5** Verifica que no hay errores (debería mostrar "Success")

---

## FASE 2: Configuración de Roles ✓

- [ ] **2.1** En Supabase, ve a `Authentication > Users`
- [ ] **2.2** Busca tu usuario (el tuyo)
- [ ] **2.3** Haz click en el usuario
- [ ] **2.4** Copia el `User ID` (es un UUID como: `550e8400-e29b-41d4-a716-446655440000`)
- [ ] **2.5** Ve a `SQL Editor` nuevamente
- [ ] **2.6** Ejecuta este SQL (REEMPLAZA TU_USER_ID):
  ```sql
  UPDATE profiles 
  SET role = 'moderator' 
  WHERE user_id = 'TU_USER_ID';
  ```
  **EJEMPLO:**
  ```sql
  UPDATE profiles 
  SET role = 'moderator' 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
  ```
- [ ] **2.7** Ejecuta y verifica que retorna `Success`

---

## FASE 3: Verificar en Frontend ✓

- [ ] **3.1** Accede a tu aplicación (http://localhost/spotMap o similar)
- [ ] **3.2** Recarga la página (F5 o Ctrl+Shift+R)
- [ ] **3.3** Abre la consola del navegador (F12)
- [ ] **3.4** Busca este log:
  ```
  [AUTH] ✓ UI actualizada para usuario logueado (rol=moderator)
  ```
- [ ] **3.5** Si lo ves = ✅ Configuración correcta
- [ ] **3.6** Si NO lo ves = ❌ Revisa que SQL se ejecutó

---

## FASE 4: Panel de Moderación ✓

- [ ] **4.1** Mira la esquina superior DERECHA del mapa
- [ ] **4.2** Deberías ver una caja que dice "Pending: 0"
- [ ] **4.3** Si la ves = ✅ Panel activo
- [ ] **4.4** Si NO la ves:
  - Recarga (F5)
  - Abre F12 Console
  - Busca errores (mensajes rojos)
  - Verifica que role=moderator en paso 2.6

---

## FASE 5: Probar Flujo Completo ✓

### Test 1: Crear un Spot (con otra sesión/navegador)

- [ ] **5.1** Abre navegador privado/incógnito (o diferente usuario)
- [ ] **5.2** Accede a la app
- [ ] **5.3** Haz clic en "Añadir Spot"
- [ ] **5.4** Completa formulario:
  - Título: "Test Spot"
  - Descripción: "Esto es una prueba"
  - Ubica en el mapa (cualquier lugar)
  - Sube una foto (JPEG o PNG)
- [ ] **5.5** Haz click en "Guardar"
- [ ] **5.6** Deberías ver: "Spot creado y pendiente de aprobación" ✓

### Test 2: Ver en Panel de Moderación (tu sesión)

- [ ] **5.7** Vuelve a tu navegador (donde eres moderator)
- [ ] **5.8** Recarga (F5)
- [ ] **5.9** Mira el panel de moderación (arriba a la derecha)
- [ ] **5.10** Deberías ver: "Pending: 1" y el spot en la lista
- [ ] **5.11** Si lo ves = ✅ Funcionando

### Test 3: Aprobar el Spot

- [ ] **5.12** En el panel, busca tu "Test Spot"
- [ ] **5.13** Haz click en **✔️ Aprobar**
- [ ] **5.14** El panel debería actualizar a "Pending: 0"
- [ ] **5.15** Recarga la página (F5)
- [ ] **5.16** Mira el mapa: deberías ver "Test Spot" como marcador
- [ ] **5.17** Si lo ves = ✅ Todo funciona

---

## FASE 6: Validación de Fotos ✓

- [ ] **6.1** Intenta subir un archivo que NO es imagen (por ej: .txt)
- [ ] **6.2** Debería rechazar: "Formato no válido..."
- [ ] **6.3** Intenta subir una imagen muy pequeña (< 100px)
- [ ] **6.4** Debería rechazar: "Imagen demasiado pequeña..."
- [ ] **6.5** Si rechaza ambas = ✅ Validación funciona

---

## FASE 7: Rechazo de Spots ✓

- [ ] **7.1** Crea otro spot (como usuario no-mod)
- [ ] **7.2** En tu panel de mod, busca el nuevo
- [ ] **7.3** Haz click en **❌ Rechazar**
- [ ] **7.4** El spot debería desaparecer del panel
- [ ] **7.5** Recarga el mapa
- [ ] **7.6** El spot NO debería aparecer = ✅ Rechazo funciona

---

## 🎉 ¡Todo Completo!

Si pasaste todos los checks, tu sistema de moderación está **100% funcional**:

✅ Base de datos configurada
✅ Roles asignados correctamente
✅ Panel visible para moderadores
✅ Spots nuevos quedan pending
✅ Aprobación funciona
✅ Rechazo funciona
✅ Validación de fotos funciona
✅ Solo spots aprobados aparecen públicamente

---

## 🔥 Próximas Mejoras (Opcional)

- [ ] Agregar notificaciones sonoras
- [ ] Mostrar preview de fotos en panel
- [ ] Dashboard con estadísticas
- [ ] Email cuando hay spots pendientes
- [ ] Razón de rechazo (comentarios)
- [ ] AI para detectar contenido inapropiado

---

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| Panel no aparece | Verifica role=moderator en BD |
| Spots no en mapa | Recarga página, verifica status=approved |
| Fotos rechazadas | Usa JPEG/PNG, mín 100x100, máx 5MB |
| Error en SQL | Copia exactamente (ten cuidado con ' y ") |
| Multiple GoTrueClient | Normal, ignorar (mensaje de Supabase) |

---

## 📝 Documentación Relacionada

- `MODERATION_SETUP.md` - Guía completa
- `MODERATION_ACTIVATED.md` - Cambios implementados
- `MODERATION_UI_ENHANCEMENTS.md` - Mejoras visuales

---

## ✨ ¡Éxito!

Ahora tienes control total sobre qué se publica. 
**Gente sube spots de calidad, TÚ decides cuáles son válidos. 🚀**

