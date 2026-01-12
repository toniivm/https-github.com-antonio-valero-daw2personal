<?php
// Ejercicio 3 - Buscar usuario por email (consulta segura)

try {
    $host = 'localhost';
    $db = 'empresa_db';
    $user = 'root';
    $password = '';
    $charset = 'utf8mb4';
    
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];
    
    $pdo = new PDO($dsn, $user, $password, $options);
    
    $email = "ana@example.com";
    
    $sql = "SELECT id, nombre, email FROM usuarios WHERE email = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email]);
    
    $usuario = $stmt->fetch();
    
    if ($usuario) {
        echo "<h2>✓ Usuario encontrado</h2>";
        echo "<p><strong>ID:</strong> " . htmlspecialchars($usuario['id']) . "</p>";
        echo "<p><strong>Nombre:</strong> " . htmlspecialchars($usuario['nombre']) . "</p>";
        echo "<p><strong>Email:</strong> " . htmlspecialchars($usuario['email']) . "</p>";
    } else {
        echo "<h2>ℹ No encontrado</h2>";
        echo "<p>No existe usuario con email: " . htmlspecialchars($email) . "</p>";
    }
    
} catch (PDOException $e) {
    error_log('Query error: ' . $e->getMessage(), 0);
    echo "<h2>✗ Error</h2>";
    echo "<p>Problema al buscar.</p>";
}
?>
