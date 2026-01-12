<?php
// Ejercicio 2 - Insertar usuario con prepared statements
// Ana con ana@example.com

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
    
    $nombre = "Ana";
    $email = "ana@example.com";
    
    $sql = "INSERT INTO usuarios (nombre, email) VALUES (?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nombre, $email]);
    
    $id = $pdo->lastInsertId();
    
    echo "<h2>✓ Usuario guardado</h2>";
    echo "<p><strong>ID:</strong> $id</p>";
    echo "<p><strong>Nombre:</strong> $nombre</p>";
    echo "<p><strong>Email:</strong> $email</p>";
    echo "<p><strong>Registros:</strong> " . $stmt->rowCount() . "</p>";
    
} catch (PDOException $e) {
    error_log('Insert error: ' . $e->getMessage(), 0);
    
    echo "<h2>✗ Error</h2>";
    echo "<p>No se pudo guardar el usuario.</p>";
    
    // debug:
    // echo $e->getMessage();
}
?>
