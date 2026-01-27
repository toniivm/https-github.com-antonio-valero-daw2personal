<?php
// debug-api.php - Verificar qué retorna la API de spots

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/DatabaseAdapter.php';
require __DIR__ . '/../src/ApiResponse.php';
require __DIR__ . '/../src/Controllers/SpotController.php';

use SpotMap\Database;
use SpotMap\Controllers\SpotController;

header('Content-Type: application/json');

try {
    Database::init();
    $pdo = Database::pdo();
    
    // Verificar spots en BD
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM spots");
    $total = $stmt->fetch()['total'];
    
    // Obtener spots directamente
    $spots = $pdo->query("SELECT id, title, description, lat, lng, category, image_path, created_at FROM spots LIMIT 10")
        ->fetchAll(\PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'total_spots_in_db' => $total,
        'spots_retrieved' => count($spots),
        'sample_spots' => $spots
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>
