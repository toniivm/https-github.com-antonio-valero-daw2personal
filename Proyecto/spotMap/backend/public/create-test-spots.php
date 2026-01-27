<?php
// create-test-spots.php - Insertar spots de prueba en la BD

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/DatabaseAdapter.php';

use SpotMap\Database;
use SpotMap\DatabaseAdapter;

try {
    // Inicializar BD
    Database::init();
    $pdo = Database::pdo();
    
    // Primero, verificar estructura de la tabla
    $columns = $pdo->query("DESCRIBE spots")->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'Field');
    
    echo "<!-- Columnas de la tabla spots:\n";
    print_r($columnNames);
    echo "-->\n";
    
    // Insertar 5 spots de prueba - usar columnas correctas
    $spots = [
        [
            'title' => 'Playa de la Malva',
            'description' => 'Una hermosa playa tranquila con vistas al atardecer',
            'lat' => 40.4168,
            'lng' => -3.7038,
            'category' => 'beach',
            'image_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
            'user_id' => 'anonymous-user-001',
            'status' => 'approved'
        ],
        [
            'title' => 'Mirador del Cerro',
            'description' => 'Punto con vista panorámica de la ciudad',
            'lat' => 40.4200,
            'lng' => -3.7000,
            'category' => 'viewpoint',
            'image_url' => 'https://images.unsplash.com/photo-1500375592092-40eb6168df21',
            'user_id' => 'anonymous-user-001',
            'status' => 'approved'
        ],
        [
            'title' => 'Restaurante Antojo',
            'description' => 'Comida tradicional con ingredientes frescos',
            'lat' => 40.4150,
            'lng' => -3.7050,
            'category' => 'food',
            'image_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
            'user_id' => 'anonymous-user-001',
            'status' => 'approved'
        ],
        [
            'title' => 'Parque Natural Bosque',
            'description' => 'Zona verde con senderos y fauna local',
            'lat' => 40.4100,
            'lng' => -3.6980,
            'category' => 'nature',
            'image_url' => 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
            'user_id' => 'anonymous-user-001',
            'status' => 'approved'
        ],
        [
            'title' => 'Mercado de Arte Callejero',
            'description' => 'Zona de arte urbano y galerías independientes',
            'lat' => 40.4180,
            'lng' => -3.7080,
            'category' => 'art',
            'image_url' => 'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa',
            'user_id' => 'anonymous-user-001',
            'status' => 'approved'
        ]
    ];
    
    $inserted = 0;
    foreach ($spots as $spot) {
        try {
            // Construir query dinámicamente basado en columnas existentes
            $fields = [];
            $values = [];
            $params = [];
            
            foreach (['title', 'description', 'category', 'image_url', 'user_id', 'status'] as $field) {
                if (in_array($field, $columnNames)) {
                    $fields[] = $field;
                    $values[] = '?';
                    $params[] = $spot[$field];
                }
            }
            
            // Agregar lat/lng con los nombres correctos
            if (in_array('lat', $columnNames)) {
                $fields[] = 'lat';
                $values[] = '?';
                $params[] = $spot['lat'];
            }
            if (in_array('lng', $columnNames)) {
                $fields[] = 'lng';
                $values[] = '?';
                $params[] = $spot['lng'];
            }
            
            $fieldStr = implode(', ', $fields);
            $valueStr = implode(', ', $values);
            $query = "INSERT INTO spots ($fieldStr) VALUES ($valueStr)";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $inserted++;
        } catch (\Exception $e) {
            echo "Error insertando '{$spot['title']}': " . $e->getMessage() . "\n";
        }
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => "✓ $inserted spots de prueba insertados correctamente",
        'spots_inserted' => $inserted,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
    
} catch (\Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
