# 🚀 Guía de Instalación - SpotMap

## Requisitos
- ✅ XAMPP con Apache y MySQL
- ✅ navegador moderno (Chrome, Firefox, Edge)

---

## 📖 Instalación Rápida (5 minutos)

### **1. Iniciar XAMPP**
```bash
# Abre XAMPP Control Panel y asegúrate de que:
- Apache: ON (puerto 80)
- MySQL: ON (puerto 3306)
```

### **2. Crear la base de datos**

**Opción A: phpMyAdmin (interfaz visual)**
```
1. Abre: http://localhost/phpmyadmin
2. Arriba a la izquierda, haz clic en "Nueva"
3. Crea base de datos "spotmap" con UTF-8 unicode ci
4. Haz clic en SQL
5. Pega el contenido de: backend/init-db/schema.sql
6. Ejecuta (Ctrl + Enter)
```

**Opción B: Terminal**
```powershell
mysql -u root -p < "backend/init-db/schema.sql"
# (déjalo en blanco si no tienes contraseña)
```

### **3. Abre la aplicación**

Frontend:
```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html
```

Verifica que el backend responda:
```
http://localhost/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/index.php/spots
```

Deberías ver: `[]`

---

## ✅ Checklist de Validación

- [ ] Apache está corriendo
- [ ] MySQL está corriendo
- [ ] Base de datos "spotmap" existe
- [ ] El mapa de Leaflet aparece en el frontend
- [ ] El API retorna `[]` en /spots
- [ ] Puedo hacer clic en "Añadir spot"
- [ ] Puedo crear un spot
- [ ] El spot aparece en el mapa

---

## 🐛 Solución de Problemas

### "Conexión rechazada"
```
❌ Error: Connection refused
✅ Solución: Verifica que Apache y MySQL están ejecutándose en XAMPP
```

### "Base de datos no encontrada"
```
❌ Error: Unknown database 'spotmap'
✅ Solución: Ejecuta el schema.sql desde phpMyAdmin
```

### "El mapa no carga"
```
❌ Problema: Mapa en blanco
✅ Solución: Verifica que tienes internet (Leaflet necesita descargar tiles)
           o que no hay errores en la consola del navegador (F12)
```

### "Error 404 en API"
```
❌ Error: GET /spots → 404 not found
✅ Solución: Verifica que la ruta es exacta:
           http://localhost/https-github...../backend/public/index.php/spots
           (copiar desde la barra de direcciones)
```

---

## 🎮 Uso Básico

### Agregar un spot:
1. Haz clic en **"Añadir spot"** (botón superior derecha)
2. Completa el formulario:
   - **Título** (obligatorio): ej. "Mirador del Alcázar"
   - **Descripción** (opcional): ej. "Vistas increíbles del Alcázar de Segovia"
   - **Foto** (opcional): sube una imagen JPG/PNG
   - **Ubicación**: Usa el botón "Usar mi ubicación actual" o ingresa manualmente
   - **Etiquetas**: Separa con comas, ej. "castillo, atardecer"
3. Haz clic en **"Guardar"**

### Buscar spots:
1. En la barra lateral izquierda, escribe en "Buscar por nombre o etiqueta"
2. Selecciona una categoría si quieres
3. Haz clic en **"Aplicar"**

### Ver spot en el mapa:
- Haz clic en el nombre del spot en la lista lateral
- El mapa enfocará esa ubicación y mostrará la información

---

## 🔐 Configuración de Seguridad (Opcional)

Si deseas tener más seguridad en producción:

### 1. Cambiar contraseña MySQL
```powershell
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'tu_nueva_contraseña';
```

Luego actualiza `backend/src/Database.php`:
```php
$pass = 'tu_nueva_contraseña';  // Línea 15
```

### 2. Restringir CORS (producción)
En `backend/public/index.php`, cambia:
```php
// De:
header("Access-Control-Allow-Origin: *");

// A:
header("Access-Control-Allow-Origin: https://tu-dominio.com");
```

---

## 📱 Acceso Remoto (Opcional)

Para acceder desde otro dispositivo en la misma red:

1. Obtén tu IP local:
```powershell
ipconfig | findstr "IPv4"
```
Ejemplo: `192.168.1.100`

2. Accede desde otro dispositivo:
```
http://192.168.1.100/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html
```

---

## 📚 Archivos Importantes

| Archivo | Función |
|---------|---------|
| `frontend/index.html` | Interfaz principal |
| `frontend/js/main.js` | Lógica del mapa |
| `frontend/js/api.js` | Comunicación con API |
| `backend/public/index.php` | Router API |
| `backend/src/Controllers/SpotController.php` | Lógica de spots |
| `backend/init-db/schema.sql` | Estructura de BD |

---

## 🎯 Próximos Pasos

Después de validar que funciona:

1. Lee `ANALISIS_PROYECTO.md` para entender la estructura
2. Considera implementar subida de fotos
3. Agrega autenticación de usuarios
4. Implementa búsqueda geoespacial

---

¡Listo! 🎉 Tu proyecto SpotMap debería estar funcionando.
