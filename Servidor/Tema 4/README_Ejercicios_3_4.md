# Ejercicios 3 y 4 — PDO (PHP)

Este paquete contiene los ejercicios 3 (paginación de logs) y 4 (gestión de usuarios con Argon2ID), listos para probar.

## Contenido del ZIP

```
Tema4_Ejercicios_3_4/
├── ejercicio3_logs_paginacion.php  (Paginación con LIMIT/OFFSET)
├── ejercicio4_usuarios.php         (Registro/Login con Argon2ID)
├── config.php                      (Conexión PDO)
├── README_Ejercicios_3_4.md        (Este archivo)
├── sql/
│   ├── schema.sql                  (Tablas completas)
│   └── seed.sql                    (Datos de ejemplo)
└── tests/
    ├── test_logs_api.php           (API JSON paginación)
    ├── test_logs_paginacion.php    (Test paginación CLI)
    └── test_usuarios.php           (Test registro/login)
```

## Pasos para probar

### 1. Extraer el ZIP
Descomprime en cualquier carpeta accesible por XAMPP (ej: `C:\xampp\htdocs\ejercicios34\`)

### 2. Importar base de datos
Abre MySQL/phpMyAdmin y ejecuta:
```sql
SOURCE C:/xampp/htdocs/ejercicios34/sql/schema.sql;
SOURCE C:/xampp/htdocs/ejercicios34/sql/seed.sql;
```

O desde línea de comandos:
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "SOURCE C:/xampp/htdocs/ejercicios34/sql/schema.sql"
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "SOURCE C:/xampp/htdocs/ejercicios34/sql/seed.sql"
```

### 3. Configurar conexión (opcional)
Si tu MySQL no es `root` sin contraseña en `localhost`, edita `config.php` o crea `.env.php`:
```php
<?php
return [
    'DB_DSN' => 'mysql:host=localhost;dbname=test;charset=utf8mb4',
    'DB_USER' => 'tu_usuario',
    'DB_PASS' => 'tu_password'
];
```

### 4. Probar los ejercicios

**A) Ejercicio 3 — Paginación (CLI):**
```powershell
& "C:\xampp\php\php.exe" "C:\xampp\htdocs\ejercicios34\tests\test_logs_paginacion.php"
```

**B) Ejercicio 3 — Paginación (API JSON en navegador):**
```
http://localhost/ejercicios34/tests/test_logs_api.php?page=1&per_page=3
```

**C) Ejercicio 4 — Usuarios (registro y login):**
```powershell
& "C:\xampp\php\php.exe" "C:\xampp\htdocs\ejercicios34\tests\test_usuarios.php"
```

---

## Ejercicio 3 — Paginación de Logs

### Función implementada
```php
function obtenerLogsPaginados($pagina, $porPagina, PDO $pdo)
```

### Características técnicas
✓ `LIMIT` y `OFFSET` con `bindValue` + `PDO::PARAM_INT`  
✓ Cálculo de total de páginas con `COUNT(*)`  
✓ Fetch iterativo (no `fetchAll`) para páginas grandes  
✓ Orden descendente por fecha  
✓ Devuelve array con: `totalRegistros`, `totalPaginas`, `paginaActual`, `datos`

### Ejemplo de uso directo
```php
require 'ejercicio3_logs_paginacion.php';
$pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$resultado = obtenerLogsPaginados(1, 20, $pdo);
print_r($resultado);
```

### Salida esperada
```json
{
  "totalRegistros": 5,
  "totalPaginas": 1,
  "paginaActual": 1,
  "datos": [
    {
      "id": "5",
      "usuario": "ventas",
      "accion": "Exportó informe mensual",
      "fecha": "2025-12-01 10:30:00"
    },
    ...
  ]
}
```

## Ejercicio 4 — Gestión de Usuarios (Argon2ID)

### Funciones implementadas
```php
function registrarUsuario($email, $password, PDO $pdo)
function loginUsuario($email, $password, PDO $pdo)
```

### Características técnicas
✓ Hash con `PASSWORD_ARGON2ID` (recomendado OWASP 2023+)  
✓ Verificación con `password_verify`  
✓ Comprobación previa de email duplicado (lanza excepción)  
✓ Logging de errores en `errores.log`  
✓ `FETCH_ASSOC` para obtener datos  
✓ No revela si el email existe en login fallido (seguridad)

### Ejemplo de uso directo
```php
require 'ejercicio4_usuarios.php';
$pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $id = registrarUsuario('usuario@ejemplo.com', 'MiPassword123!', $pdo);
    echo "Registrado con ID: $id\n";
    
    $ok = loginUsuario('usuario@ejemplo.com', 'MiPassword123!', $pdo);
    echo $ok ? "Login OK\n" : "Login fallido\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

### Salida esperada del test
```
Usuario registrado correctamente
ID: 1
Email: prueba_675c123abc@ejemplo.com

Login con contraseña correcta: OK
Login con contraseña incorrecta: FAIL
```

---

## Verificación de requisitos

### ✅ Ejercicio 3 cumple:
- [x] `LIMIT` y `OFFSET` con `bindValue` + `PARAM_INT`
- [x] Cálculo de total de páginas con `COUNT(*)`
- [x] Devuelve array con `totalRegistros`, `totalPaginas`, `paginaActual`, `datos`
- [x] No usa `fetchAll` (fetch iterativo)
- [x] Ejemplo de salida JSON para API

### ✅ Ejercicio 4 cumple:
- [x] Hash con `PASSWORD_ARGON2ID`
- [x] Verificación con `password_verify`
- [x] Comprueba si existe el email antes de registrar
- [x] Lanza excepción si email duplicado
- [x] Manejo de errores con `try/catch`
- [x] Usa `FETCH_ASSOC`

---

## Notas técnicas importantes

**Ejercicio 3 (Paginación):**
- Fetch iterativo evita cargar miles de registros en memoria
- `PARAM_INT` previene inyección SQL en LIMIT/OFFSET
- Offset correcto: `($pagina - 1) * $porPagina`

**Ejercicio 4 (Usuarios):**
- Argon2ID: algoritmo recomendado por OWASP (2023+)
- `registrarUsuario`: verifica duplicados antes de insertar
- `loginUsuario`: no revela si el email existe (anti-enumeración)
- Errores registrados en `errores.log` con timestamp

---

## Solución de problemas

**Error: "Table doesn't exist"**
→ Ejecuta `sql/schema.sql` primero

**Error: "Can't connect to MySQL"**
→ Verifica que XAMPP esté corriendo y edita `config.php`

**PHP no encuentra las funciones**
→ Asegúrate de hacer `require` del archivo correcto antes de llamar las funciones

**No aparecen logs en la paginación**
→ Ejecuta `sql/seed.sql` para insertar datos de ejemplo
