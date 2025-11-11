<?php
declare(strict_types=1);

require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Controllers/SpotController.php';

use SpotMap\Database;
use SpotMap\Controllers\SpotController;

// CORS básico
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// Inicializar DB
Database::init();

// Obtener la ruta (sin index.php)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Debug: Log de la petición
error_log("Petición: $method $uri");

// Procesar la ruta
// Si termina en /spots (con o sin params)
if (preg_match('/\/spots(\/\d+)?(\/photo)?(\?.+)?$/', $uri, $matches)) {
    $parts = array_filter(explode('/', trim($uri, '/')));
    $parts = array_values($parts); // Re-indexar

// Simple router
if (isset($parts[0]) && $parts[0] === 'spots') {
    $controller = new SpotController();

    if ($method === 'GET' && count($parts) === 1) {
        $controller->index();
        exit;
    }

    if ($method === 'POST' && count($parts) === 1) {
        $controller->store();
        exit;
    }

    if ($method === 'GET' && count($parts) === 2) {
        $controller->show((int)$parts[1]);
        exit;
    }

    if ($method === 'DELETE' && count($parts) === 2) {
        $controller->destroy((int)$parts[1]);
        exit;
    }

    if ($method === 'POST' && count($parts) === 3 && $parts[2] === 'photo') {
        $controller->uploadPhoto((int)$parts[1]);
        exit;
    }
}

http_response_code(404);
echo json_encode(['error'=>'Route not found']);


