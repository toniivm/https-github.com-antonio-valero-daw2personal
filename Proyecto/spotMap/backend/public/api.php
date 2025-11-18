<?php
declare(strict_types=1);

// Iniciar buffering para evitar que cualquier salida (BOM/avisos) rompa el JSON
ob_start();

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Logger.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/SupabaseClient.php';
require __DIR__ . '/../src/DatabaseAdapter.php';
require __DIR__ . '/../src/ApiResponse.php';
require __DIR__ . '/../src/Validator.php';
require __DIR__ . '/../src/Security.php';
require __DIR__ . '/../src/Controllers/SpotController.php';

use SpotMap\Database;
use SpotMap\DatabaseAdapter;
use SpotMap\ApiResponse;
use SpotMap\Security;
use SpotMap\Controllers\SpotController;

// Health check endpoint
if (isset($_GET['health']) || (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] === '/health')) {
    ob_clean();
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'timestamp' => time(), 'service' => 'spotmap-api', 'version' => '1.2']);
    exit;
}

// Inicializar configuración para acceso a variables
\SpotMap\Config::load();

// Seguridad: Headers CORS, CSP y otros
Security::setCORSHeaders(); // Usar * para desarrollo local
Security::setSecurityHeaders();

// Log inicio de petición
\SpotMap\Logger::info('Nueva petición API', [
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
    'uri' => $_SERVER['REQUEST_URI'] ?? '',
    'requestId' => \SpotMap\Logger::getRequestId(),
]);

// Content-Type JSON
header("Content-Type: application/json");

// Rate limiting: máx 100 requests por minuto
if (!Security::checkRateLimit(100, 60)) {
    ApiResponse::error('Too many requests', 429, null, [ 'retryAfterSeconds' => 60 ]);
}

// Manejo de preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inicializar DB local solo si no usamos Supabase
if (!DatabaseAdapter::useSupabase()) {
    Database::init();
}

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
    \SpotMap\Logger::exception($e);
    ApiResponse::serverError('Unexpected error', [ 'detail' => $e->getMessage() ]);
}
?>
