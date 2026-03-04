<?php

$pdo = require __DIR__ . '/../config.php';
require __DIR__ . '/../ejercicio3_logs_paginacion.php';

// Configurar salida JSON
header('Content-Type: application/json');

$pagina = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$porPagina = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 20;

try {
    $resultado = obtenerLogsPaginados($pagina, $porPagina, $pdo);
    echo json_encode($resultado, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
