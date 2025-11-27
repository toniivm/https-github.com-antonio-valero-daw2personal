<?php

declare(strict_types=1);

header('Content-Type: application/json');

$pdo = require __DIR__ . '/../config.php';
require __DIR__ . '/../ejercicio2_busqueda_clientes.php';

$filtros = [
    'nombre' => $_GET['nombre'] ?? 'Mar',
    'ciudad' => $_GET['ciudad'] ?? null,
    'fecha_desde' => $_GET['fecha_desde'] ?? null,
    'fecha_hasta' => $_GET['fecha_hasta'] ?? null,
    'facturacion_min' => isset($_GET['facturacion_min']) ? (float)$_GET['facturacion_min'] : null,
    'facturacion_max' => isset($_GET['facturacion_max']) ? (float)$_GET['facturacion_max'] : null,
    'activo' => isset($_GET['activo']) ? (int)$_GET['activo'] : null,
];

try {
    $rows = buscarClientes($filtros, $pdo);
    echo json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
