<?php
// auth-login.php - Endpoint de login local (fallback cuando Supabase no está disponible)

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Constants.php';

use SpotMap\Database;
use SpotMap\Config;
use SpotMap\Constants;

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
    $stmt = $pdo->prepare("SELECT id, email, username, full_name, role FROM users WHERE email = ? LIMIT 1");
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
            'full_name' => explode('@', $email)[0],
            'role' => Constants::DEFAULT_ROLE,
        ];
    }

    $role = $user['role'] ?? Constants::DEFAULT_ROLE;

    // JWT-like token para fallback local de Auth::fetchUser
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload = [
        'sub' => $user['id'],
        'email' => $user['email'],
        'role' => $role,
        'user_metadata' => ['name' => $user['full_name'] ?? $user['username'] ?? 'User'],
        'iat' => time(),
        'exp' => time() + 86400,
    ];

    $base64UrlEncode = static function (array $data): string {
        return rtrim(strtr(base64_encode(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)), '+/', '-_'), '=');
    };

    $jwtHeader = $base64UrlEncode($header);
    $jwtPayload = $base64UrlEncode($payload);
    $secret = Config::get('JWT_SECRET', 'spotmap-local-secret');
    $signature = rtrim(strtr(base64_encode(hash_hmac('sha256', $jwtHeader . '.' . $jwtPayload, $secret, true)), '+/', '-_'), '=');
    $token = $jwtHeader . '.' . $jwtPayload . '.' . $signature;
    
    echo json_encode([
        'success' => true,
        'user' => array_merge($user, ['role' => $role]),
        'session' => [
            'access_token' => $token,
            'user' => array_merge($user, ['role' => $role])
        ]
    ]);
    
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
