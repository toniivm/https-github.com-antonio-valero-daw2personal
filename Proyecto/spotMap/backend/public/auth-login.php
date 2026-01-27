<?php
// auth-login.php - Endpoint de login local (fallback cuando Supabase no está disponible)

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';

use SpotMap\Database;

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email y contraseña requeridos']);
        exit;
    }
    
    Database::init();
    $pdo = Database::pdo();
    
    // Buscar usuario
    $stmt = $pdo->prepare("SELECT id, email, username, full_name FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(\PDO::FETCH_ASSOC);
    
    if (!$user) {
        // Crear usuario de prueba si no existe
        $userId = 'local-' . uniqid();
        $stmt = $pdo->prepare("
            INSERT INTO users (id, email, username, full_name, provider, is_verified)
            VALUES (?, ?, ?, ?, 'local', true)
        ");
        $stmt->execute([$userId, $email, $email, explode('@', $email)[0]]);
        $user = [
            'id' => $userId,
            'email' => $email,
            'username' => $email,
            'full_name' => explode('@', $email)[0]
        ];
    }
    
    // Retornar token simple (no es JWT real, solo para demo local)
    $token = base64_encode(json_encode([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'exp' => time() + 86400
    ]));
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'session' => [
            'access_token' => $token,
            'user' => $user
        ]
    ]);
    
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
