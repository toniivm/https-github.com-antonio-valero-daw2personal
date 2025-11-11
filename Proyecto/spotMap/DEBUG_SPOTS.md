# 🔍 DEBUGGING - Los spots no aparecen en el mapa

## Paso 1: Verifica en la consola del navegador

1. **Abre** tu navegador
2. **Presiona** F12 (Abre consola)
3. **Copia todo** lo que aparezca en la pestaña "Console" 

---

## Paso 2: Busca los logs de API

Cuando la página carga, deberías ver mensajes como:

```
[API] GET /spots → 200
```

Si VES esto = API funciona ✅  
Si NO ves nada o ves error = API falla ❌

---

## Paso 3: Prueba el endpoint manualmente

Abre una nueva pestaña y ve a:

```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/test.php
```

Deberías ver un JSON como:

```json
{
  "status": "OK",
  "message": "BD conectada correctamente",
  "tablas": 3,
  "total_spots": 3,
  "spots": [
    {
      "id": 1,
      "title": "Skatepark Delicias",
      ...
    }
  ]
}
```

---

## Si VES el JSON (✅ API FUNCIONA):

El problema es que el FRONTEND no está mostrando los spots correctamente.

**Solución:**
1. Abre F12
2. Ve a la pestaña "Network"
3. Recarga la página
4. Busca la petición a `/spots`
5. Verifica que devuelve un array con los spots

---

## Si NO VES el JSON (❌ API NO FUNCIONA):

El problema está en el backend.

**Soluciona:**

### Opción A: Verifica que Apache está corriendo
```
Abre XAMPP Control Panel
Apache debe estar = ON (verde)
MySQL debe estar = ON (verde)
```

### Opción B: Verifica la ruta de la BD
```
La BD debe estar en:
Host: 127.0.0.1
Usuario: root
Contraseña: (vacío)
BD: spotmap
```

### Opción C: Verifica el .htaccess
```
Archivo: backend/public/.htaccess
Contenido debería tener mod_rewrite
```

---

## Paso 4: Cuéntame qué ves

Copia el contenido de:

1. **Consola del navegador (F12 > Console)**
   - ¿Qué mensajes ves?
   - ¿Hay errores rojos?

2. **test.php** (`http://localhost/.../test.php`)
   - ¿Ves un JSON válido?
   - ¿Cuántos spots muestra?

3. **Backend** (`http://localhost/.../backend/public/index.php/spots`)
   - ¿Ves JSON?
   - ¿Ves error?

Con esta información podré identificar el problema exacto.

---

## ⚡ Solución Rápida Probable

Si XAMPP y la BD están bien, el problema es probablemente:

1. **Apache mod_rewrite no está habilitado**
   - Solución: Editar `httpd.conf` y descomenta `LoadModule rewrite_module`

2. **Ruta del .htaccess incorrecta**
   - Solución: Revisar la ruta base del rewrite

Pero primero necesito saber qué dice la consola. 📝

---

## 🎯 TL;DR (Resumen rápido)

```
1. Abre F12 (Consola)
2. Recaraga la página
3. Busca: [API] GET /spots
4. Dice: → 200 ✅ o error ❌
5. Cuéntame qué ves
```

