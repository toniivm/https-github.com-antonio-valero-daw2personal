<?php

// Ejercicio 1 — Sistema de Pedidos con Transacciones
// - Transacción completa: pedido + líneas + stock
// - Comprobar stock real antes de descontar
// - Consultas preparadas y precio actual desde la BD
// - Excepciones si no hay stock y logging en errores.log

// Realiza un pedido atómico (pedido + líneas + descuento de stock)
// Devuelve el id del pedido creado
function realizarPedido(string $cliente, array $carrito, PDO $pdo): int
{
    $logFile = __DIR__ . DIRECTORY_SEPARATOR . 'errores.log';

    if (empty($carrito)) {
        throw new InvalidArgumentException('El carrito no puede estar vacío');
    }

    try {
        if ($pdo->getAttribute(PDO::ATTR_ERRMODE) !== PDO::ERRMODE_EXCEPTION) {
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }

        $pdo->beginTransaction();

        // 1) Insertar pedido
        $stmtPedido = $pdo->prepare('INSERT INTO pedidos (cliente) VALUES (:cliente)');
        $stmtPedido->execute([':cliente' => $cliente]);
        $pedidoId = (int)$pdo->lastInsertId();

        // 2) Sentencias reutilizables
        $stmtSelProd = $pdo->prepare('SELECT id, nombre, stock, precio FROM productos WHERE id = :id FOR UPDATE');
        $stmtInsLinea = $pdo->prepare('INSERT INTO lineas_pedido (pedido_id, producto_id, unidades, precio_unitario) VALUES (:pedido_id, :producto_id, :unidades, :precio_unitario)');
        $stmtUpdStock = $pdo->prepare('UPDATE productos SET stock = stock - :unidades WHERE id = :id');

        foreach ($carrito as $item) {
            if (!isset($item['producto_id'], $item['unidades'])) {
                throw new InvalidArgumentException('Formato de carrito inválido');
            }
            $productoId = (int)$item['producto_id'];
            $unidades = (int)$item['unidades'];
            if ($productoId <= 0 || $unidades <= 0) {
                throw new InvalidArgumentException('producto_id y unidades deben ser positivos');
            }

            // 3) Comprobar stock real (fila bloqueada durante la transacción)
            $stmtSelProd->execute([':id' => $productoId]);
            $producto = $stmtSelProd->fetch(PDO::FETCH_ASSOC);
            if (!$producto) {
                throw new RuntimeException("Producto $productoId no encontrado");
            }

            $stock = (int)$producto['stock'];
            $precio = (string)$producto['precio'];

            if ($stock < $unidades) {
                throw new RuntimeException("Stock insuficiente para producto $productoId: disponible $stock, solicitado $unidades");
            }

            // 4) Insertar línea con el precio actual
            $stmtInsLinea->execute([
                ':pedido_id' => $pedidoId,
                ':producto_id' => $productoId,
                ':unidades' => $unidades,
                ':precio_unitario' => $precio,
            ]);

            // 5) Descontar stock
            $stmtUpdStock->execute([
                ':unidades' => $unidades,
                ':id' => $productoId,
            ]);
        }

        $pdo->commit();
        return $pedidoId;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $msg = sprintf('[%s] Pedido fallido (%s): %s%s', date('c'), $cliente, $e->getMessage(), PHP_EOL);
        error_log($msg, 3, $logFile);
        throw $e;
    }
}

// Ejemplo mínimo de uso (comentado):
// $pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4', 'user', 'pass');
// $carrito = [
//     ['producto_id' => 4, 'unidades' => 2],
//     ['producto_id' => 7, 'unidades' => 1],
// ];
// $pedidoId = realizarPedido('Cliente Demo', $carrito, $pdo);
// echo "Pedido creado: $pedidoId\n";
