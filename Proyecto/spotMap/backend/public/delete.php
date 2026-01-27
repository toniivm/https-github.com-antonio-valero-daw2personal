<?php
/**
 * Endpoint simple para eliminar spots
 * Acceso: /backend/public/delete.php?id=24
 */
declare(strict_types=1);

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Logger.php';
require __DIR__ . '/../src/Auth.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/SupabaseClient.php';
require __DIR__ . '/../src/SupabaseStorage.php';
require __DIR__ . '/../src/DatabaseAdapter.php';
require __DIR__ . '/../src/ApiResponse.php';

use SpotMap\Database;
use SpotMap\DatabaseAdapter;
use SpotMap\Logger;
use SpotMap\Auth;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json; charset=utf-8");

\SpotMap\Config::load();
$logger = Logger::getInstance();

if (!DatabaseAdapter::useSupabase()) {
    Database::init();
}

try {
    // Autenticación requerida
    $user = Auth::requireUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'No autenticado']);
        exit;
    }
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($_POST['id']) ? (int)$_POST['id'] : null);
    
    if (!$id || $id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID inválido']);
        exit;
    }
    
    // Log antes de eliminar
    $logger->info("API: Eliminando spot", ['id' => $id, 'user_id' => $user['id'] ?? 'unknown']);
    
    // Obtener el spot para verificar propiedad
    $spot = DatabaseAdapter::getSpotById($id);
    
    if (!$spot || isset($spot['error'])) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Spot no encontrado']);
        exit;
    }
    
    // Verificar propiedad
    $isAdmin = isset($user['role']) && in_array($user['role'], ['admin', 'moderator']);
    $isOwner = isset($spot['user_id']) && isset($user['id']) && $spot['user_id'] === $user['id'];
    
    if (!$isAdmin && !$isOwner) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'No tienes permiso para eliminar este spot']);
        exit;
    }
    
    // Eliminar imágenes de Supabase si existen
    if (DatabaseAdapter::useSupabase()) {
        if (isset($spot['image_path']) && $spot['image_path']) {
            try {
                \SpotMap\SupabaseStorage::deleteIfBucketPath($spot['image_path']);
            } catch (\Throwable $e) {
                $logger->warning("No se pudo eliminar imagen", ['path' => $spot['image_path'] ?? 'unknown']);
            }
        }
        if (isset($spot['image_path_2']) && $spot['image_path_2']) {
            try {
                \SpotMap\SupabaseStorage::deleteIfBucketPath($spot['image_path_2']);
            } catch (\Throwable $e) {
                $logger->warning("No se pudo eliminar imagen 2", ['path' => $spot['image_path_2'] ?? 'unknown']);
            }
        }
    }
    
    // Eliminar de la base de datos
    $result = DatabaseAdapter::deleteSpot($id);
    
    if (isset($result['error'])) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $result['error']]);
        $logger->error("Error deleteting spot in DB", ['id' => $id, 'error' => $result['error']]);
        exit;
    }
    
    http_response_code(200);
    echo json_encode(['success' => true, 'id' => $id, 'message' => 'Spot eliminado correctamente']);
    $logger->info("Spot eliminado exitosamente", ['id' => $id, 'user_id' => $user['id'] ?? 'unknown']);
    
} catch (\Exception $e) {
    $logger->error("Error en delete.php", ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
