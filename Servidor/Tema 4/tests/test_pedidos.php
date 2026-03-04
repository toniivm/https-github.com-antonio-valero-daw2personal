<?php

declare(strict_types=1);

$pdo = require __DIR__ . '/../config.php';
require __DIR__ . '/../ejercicio1_pedidos.php';

$carrito = [
    ['producto_id' => 1, 'unidades' => 2],
    ['producto_id' => 2, 'unidades' => 1],
];

try {
    $pedidoId = realizarPedido('Cliente Demo', $carrito, $pdo);
    echo "Pedido creado con ID: {$pedidoId}\n";
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Error: ' . $e->getMessage();
}
