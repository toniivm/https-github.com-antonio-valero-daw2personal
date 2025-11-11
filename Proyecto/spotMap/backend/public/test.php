<?php
// Prueba de conexión a la BD
require __DIR__ . '/../src/Database.php';
use SpotMap\Database;

header('Content-Type: application/json');

try {
    Database::init();
    $pdo = Database::pdo();
    
    // Prueba 1: ¿Existe la tabla?
    $result = $pdo->query("SHOW TABLES FROM spotmap");
    $tables = $result->fetchAll();
    
    // Prueba 2: ¿Cuántos spots hay?
    $result = $pdo->query("SELECT COUNT(*) as total FROM spots");
    $count = $result->fetch();
    
    // Prueba 3: Obtener todos los spots
    $result = $pdo->query("SELECT * FROM spots ORDER BY created_at DESC");
    $spots = $result->fetchAll();
    
    echo json_encode([
        'status' => 'OK',
        'message' => 'BD conectada correctamente',
        'tablas' => count($tables),
        'total_spots' => $count['total'],
        'spots' => $spots
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'ERROR',
        'message' => $e->getMessage()
    ]);
}
?>
