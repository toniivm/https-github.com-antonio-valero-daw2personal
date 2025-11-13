<?php
declare(strict_types=1);

// Iniciar buffering para evitar que cualquier salida (BOM/avisos) rompa el JSON
ob_start();

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Logger.php';
require __DIR__ . '/../src/RateLimiter.php';
require __DIR__ . '/../src/ApiResponse.php';
require __DIR__ . '/../src/Validator.php';
require __DIR__ . '/../src/SupabaseClient.php';
require __DIR__ . '/../src/DatabaseAdapter.php';
require __DIR__ . '/../src/Controllers/SpotController.php';

use SpotMap\Config;
use SpotMap\Database;
use SpotMap\DatabaseAdapter;
use SpotMap\Logger;
use SpotMap\RateLimiter;
use SpotMap\Controllers\SpotController;

// Inicializar configuración
Config::load();

// CORS mejorado
$allowedOrigins = explode(',', Config::get('CORS_ORIGINS', 'http://localhost,http://localhost:3000'));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// Inicializar base de datos local solo si NO usamos Supabase
if (!DatabaseAdapter::useSupabase()) {
    try {
        Database::init();
    } catch (\Exception $e) {
        Logger::error("DB initialization failed", ['error' => $e->getMessage()]);
        http_response_code(503);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}

// Obtener la ruta (sin index.php)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Rate limiting
if (!RateLimiter::check($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
    http_response_code(429);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Too many requests']);
    exit;
}

// Logging
Logger::info("Petición: $method $uri", ['ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown']);

// Endpoint rápido para comprobar conexión a la base de datos
if ($uri === '/ping-db') {
    try {
        $pdo = Database::pdo();
        $stmt = $pdo->query('SELECT 1');
        $ok = (bool)$stmt->fetchColumn();
        header('Content-Type: application/json');
        echo json_encode(['ok' => true, 'db' => $ok, 'time' => date('c')]);
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

if ($uri === '/db-info') {
    try {
        $pdo = Database::pdo();
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_NUM);
        $result = [];
        foreach ($tables as $t) {
            $tableName = $t[0];
            $countStmt = $pdo->query("SELECT COUNT(*) AS c FROM `{$tableName}`");
            $count = (int)$countStmt->fetchColumn();
            $result[$tableName] = $count;
        }
        header('Content-Type: application/json');
        echo json_encode(['ok' => true, 'tables' => $result]);
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Procesar la ruta: soportar llamadas donde index.php está en un subpath
$basePos = strpos($uri, '/spots');
if ($basePos !== false) {
    $route = substr($uri, $basePos);
} else {
    $route = $uri;
}

$parts = array_filter(explode('/', trim($route, '/')));
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

// Endpoint: Estado de salud de la API
if ($uri === '/api/status') {
    try {
        if (DatabaseAdapter::useSupabase()) {
            $dbConnected = true; // Supabase credenciales cargadas correctamente
            $connectionInfo = [
                'host' => parse_url(Config::get('SUPABASE_URL', ''), PHP_URL_HOST),
                'database' => 'supabase:spots'
            ];
        } else {
            $dbConnected = Database::isConnected();
            $connectionInfo = Database::getConnectionInfo();
        }
        $status = $dbConnected ? 'healthy' : 'degraded';
        
        http_response_code($dbConnected ? 200 : 503);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => $status,
            'api_version' => Config::get('API_VERSION', '1.0.0'),
            'environment' => Config::get('ENV', 'development'),
            'timestamp' => date('c'),
            'database' => [
                'connected' => $dbConnected,
                'host' => $connectionInfo['host'] ?? null,
                'database' => $connectionInfo['database'] ?? null,
            ],
            'config' => Config::getAll(),
        ]);
    } catch (\Exception $e) {
        Logger::exception($e, 'Status endpoint error');
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error'=>'Route not found']);


