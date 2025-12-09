<?php
/**
 * ⚠️ CÓDIGO PROPIETARIO - SPOTMAP ⚠️
 * Copyright (c) 2025 Antonio Valero
 * Todos los derechos reservados.
 * 
 * API REST protegida con sistema de seguridad avanzado
 * CONFIDENCIAL - Para uso interno únicamente
 */
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
require __DIR__ . '/../src/SecurityHardening.php';
require __DIR__ . '/../src/AdvancedLogger.php';
require __DIR__ . '/../src/PerformanceMonitor.php';
require __DIR__ . '/../src/ErrorTracker.php';
require __DIR__ . '/../src/Controllers/SpotController.php';
require __DIR__ . '/../src/Controllers/MonitoringController.php';

use SpotMap\Database;
use SpotMap\DatabaseAdapter;
use SpotMap\ApiResponse;
use SpotMap\Security;
use SpotMap\Controllers\SpotController;
use SpotMap\Controllers\MonitoringController;
use SpotMap\AdvancedLogger;
use SpotMap\PerformanceMonitor;
use SpotMap\ErrorTracker;

// API Documentation endpoint
if (isset($_GET['docs']) || (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] === '/docs')) {
    ob_clean();
    header('Location: api-docs.html');
    exit;
}

// OpenAPI spec endpoint
if (isset($_GET['openapi']) || (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] === '/openapi.json')) {
    ob_clean();
    header('Content-Type: application/json');
    readfile(__DIR__ . '/../openapi.json');
    exit;
}

// Health check endpoint
if (isset($_GET['health']) || (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] === '/health')) {
    ob_clean();
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'timestamp' => time(), 'service' => 'spotmap-api', 'version' => '1.2']);
    exit;
}

// 🔍 Monitoring Dashboard endpoint
if (isset($_GET['monitoring']) || (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] === '/monitoring')) {
    ob_clean();
    header('Location: monitoring.html');
    exit;
}

// Inicializar configuración para acceso a variables
\SpotMap\Config::load();

// 🔍 INICIALIZAR MONITORING AVANZADO
PerformanceMonitor::getInstance()->start();
ErrorTracker::getInstance(); // Registra automáticamente handlers
$logger = AdvancedLogger::getInstance();

// Log inicio de petición con detalles completos
$logger->info('Nueva petición API', [
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
    'uri' => $_SERVER['REQUEST_URI'] ?? '',
    'path_info' => $_SERVER['PATH_INFO'] ?? '',
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
]);

// ⚠️ SISTEMA DE SEGURIDAD AVANZADO ACTIVADO
\SpotMap\SecurityHardening::setAdvancedSecurityHeaders();

// Seguridad: Headers CORS, CSP y otros
Security::setCORSHeaders(); // Usar * para desarrollo local
Security::setSecurityHeaders();

// Content-Type JSON
header("Content-Type: application/json");

// Verificar rate limiting
if (!\SpotMap\SecurityHardening::checkRateLimit()) {
    ob_clean();
    $logger->warning('Rate limit exceeded', [
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'
    ]);
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 429,
            'message' => 'Too many requests. Please slow down.'
        ]
    ]);
    exit;
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
$monitoringController = new MonitoringController();
$method = $_SERVER['REQUEST_METHOD'];

// Obtener parametros de la URL
// Ejemplo: index.php?action=spots&id=1&sub=photo
$action = $_GET['action'] ?? 'spots';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$sub = $_GET['sub'] ?? null;

try {
    // 🔍 RUTAS DE MONITOREO
    if ($action === 'monitoring') {
        PerformanceMonitor::getInstance()->mark('monitoring_start');
        
        if ($method === 'GET' && $sub === 'logs') {
            $monitoringController->getLogs();
            exit;
        }
        if ($method === 'GET' && $sub === 'metrics') {
            $monitoringController->getMetrics();
            exit;
        }
        if ($method === 'GET' && $sub === 'alerts') {
            $monitoringController->getAlerts();
            exit;
        }
        if ($method === 'GET' && $sub === 'health') {
            $monitoringController->getHealth();
            exit;
        }
        
        $logger->warning('Monitoring endpoint not found', ['sub' => $sub]);
        ApiResponse::notFound('Monitoring endpoint not found');
    }

    // ⭐ GET /spots (listar todos)
    if ($method === 'GET' && $action === 'spots' && !$id) {
        PerformanceMonitor::getInstance()->mark('spots_list_start');
        $controller->index();
        PerformanceMonitor::getInstance()->mark('spots_list_end');
        $logger->info('GET /spots - Success', ['count' => count($_GET)]);
        exit;
    }

    // ⭐ POST /spots (crear)
    if ($method === 'POST' && $action === 'spots' && !$id) {
        PerformanceMonitor::getInstance()->mark('spots_create_start');
        $controller->store();
        PerformanceMonitor::getInstance()->mark('spots_create_end');
        exit;
    }

    // ⭐ GET /spots?id=1 (obtener uno)
    if ($method === 'GET' && $action === 'spots' && $id) {
        PerformanceMonitor::getInstance()->mark('spots_show_start');
        $controller->show($id);
        PerformanceMonitor::getInstance()->mark('spots_show_end');
        $logger->info("GET /spots/{$id} - Success");
        exit;
    }

    // ⭐ DELETE /spots?id=1 (eliminar)
    if ($method === 'DELETE' && $action === 'spots' && $id) {
        PerformanceMonitor::getInstance()->mark('spots_delete_start');
        $controller->destroy($id);
        PerformanceMonitor::getInstance()->mark('spots_delete_end');
        $logger->info("DELETE /spots/{$id} - Success");
        exit;
    }

    // ⭐ POST /spots?id=1&sub=photo (subir foto)
    if ($method === 'POST' && $action === 'spots' && $id && $sub === 'photo') {
        PerformanceMonitor::getInstance()->mark('photo_upload_start');
        $controller->uploadPhoto($id);
        PerformanceMonitor::getInstance()->mark('photo_upload_end');
        $logger->info("POST /spots/{$id}/photo - Success");
        exit;
    }

    // Si nada coincide
    $logger->warning('Route not found', [
        'action' => $action,
        'method' => $method,
        'id' => $id,
        'sub' => $sub
    ]);
    ApiResponse::notFound('Route not found');

} catch (Exception $e) {
    // 🚨 CAPTURAR Y LOGUEAR EXCEPCIONES
    $logger->critical('Unhandled exception in API', [
        'exception' => get_class($e),
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'action' => $action ?? 'unknown',
        'method' => $method ?? 'unknown'
    ]);
    
    // Log del backtrace
    $logger->debug('Exception backtrace', ['trace' => $e->getTraceAsString()]);
    
    // Registrar tiempo total
    $summary = PerformanceMonitor::getInstance()->getSummary();
    $logger->info('Request completed with error', $summary);
    
    ApiResponse::serverError('Unexpected error', [
        'detail' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
}
?>
