# Tema 4 — Ejercicios PDO (PHP)

Este directorio contiene 2 ejercicios listos para entregar (1 y 2), más un esquema SQL, datos de ejemplo y un `config.php` para conexión.

## Archivos
- `ejercicio1_pedidos.php`: función `realizarPedido($cliente, $carrito, PDO $pdo)` con transacción atómica (pedido + líneas + stock) y logging en `errores.log`.
- `ejercicio2_busqueda_clientes.php`: función `buscarClientes($filtros, PDO $pdo)` con filtros dinámicos y `LIKE` seguro.
- `sql/schema.sql`: tablas necesarias para ejercicios 1 y 2.
- `sql/seed.sql`: datos de ejemplo (productos y clientes).
- `config.php`: retorna un `PDO` listo. Puedes crear `.env.php` para sobreescribir DSN/usuario/clave.
- `tests/`: `test_pedidos.php` y `test_clientes.php`.

## BD
Importa esquema y (opcional) seed:
```sql
SOURCE C:/xampp/htdocs/https-github.com-antonio-valero-daw2personal/Servidor/Tema 4/sql/schema.sql;
SOURCE C:/xampp/htdocs/https-github.com-antonio-valero-daw2personal/Servidor/Tema 4/sql/seed.sql;
```

## Ejercicio 1 — Pedidos
```php
require 'ejercicio1_pedidos.php';
$pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4','user','pass');
$carrito = [
  ['producto_id' => 1, 'unidades' => 2],
  ['producto_id' => 2, 'unidades' => 1],
];
$pedidoId = realizarPedido('Cliente Demo', $carrito, $pdo);
echo $pedidoId;
```

## Ejercicio 2 — Búsqueda clientes
```php
require 'ejercicio2_busqueda_clientes.php';
$filtros = [
  'nombre' => 'Mar',
  'ciudad' => null,
  'fecha_desde' => '2023-01-01',
  'fecha_hasta' => '2023-12-31',
  'facturacion_min' => 10000,
  'activo' => 1,
];
$rows = buscarClientes($filtros, $pdo);
```

## Ejecutar con XAMPP (Windows)
PHP CLI suele no estar en PATH. Usa ruta absoluta:
```powershell
& "C:\xampp\php\php.exe" "C:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Servidor\Tema 4\tests\test_pedidos.php"
& "C:\xampp\php\php.exe" "C:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Servidor\Tema 4\tests\test_clientes.php"
```
