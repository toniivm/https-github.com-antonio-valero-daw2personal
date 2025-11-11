<?php
declare(strict_types=1);

require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/ApiResponse.php';
require __DIR__ . '/../src/Validator.php';
require __DIR__ . '/../src/Security.php';
require __DIR__ . '/../src/Controllers/SpotController.php';

use SpotMap\Database;
use SpotMap\ApiResponse;
use SpotMap\Security;
use SpotMap\Controllers\SpotController;

// Seguridad: Headers CORS, CSP y otros
Security::setCORSHeaders(); // Usar * para desarrollo local
Security::setSecurityHeaders();

// Content-Type JSON
header("Content-Type: application/json");

// Rate limiting: máx 100 requests por minuto
if (!Security::checkRateLimit(100, 60)) {
    ApiResponse::error('Too many requests', 429);
}

// Manejo de preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inicializar DB
Database::init();

$controller = new SpotController();
$method = $_SERVER['REQUEST_METHOD'];

// Obtener parametros de la URL
// Ejemplo: index.php?action=spots&id=1&sub=photo
$action = $_GET['action'] ?? 'spots';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$sub = $_GET['sub'] ?? null;

try {
    // GET /spots (listar todos)
    if ($method === 'GET' && $action === 'spots' && !$id) {
        $controller->index();
        exit;
    }

    // POST /spots (crear)
    if ($method === 'POST' && $action === 'spots' && !$id) {
        $controller->store();
        exit;
    }

    // GET /spots?id=1 (obtener uno)
    if ($method === 'GET' && $action === 'spots' && $id) {
        $controller->show($id);
        exit;
    }

    // DELETE /spots?id=1 (eliminar)
    if ($method === 'DELETE' && $action === 'spots' && $id) {
        $controller->destroy($id);
        exit;
    }

    // POST /spots?id=1&sub=photo (subir foto)
    if ($method === 'POST' && $action === 'spots' && $id && $sub === 'photo') {
        $controller->uploadPhoto($id);
        exit;
    }

    // Si nada coincide
    ApiResponse::notFound('Route not found');

} catch (Exception $e) {
    ApiResponse::serverError($e->getMessage());
}
?>
