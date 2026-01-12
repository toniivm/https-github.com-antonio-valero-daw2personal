<?php
// Ejercicio 1 - Conexión a BD y manejo de errores
// Conectar a empresa_db con UTF8MB4 y excepciones

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
    
    echo "<h2>✓ Conectado a $db</h2>";
    echo "<p>Base de datos: <strong>$db</strong></p>";
    echo "<p>Charset: <strong>$charset</strong></p>";
    
} catch (PDOException $e) {
    error_log('DB Error: ' . $e->getMessage(), 0);
    
    echo "<h2>✗ Error de conexión</h2>";
    echo "<p>Error conectando a la BD. Intenta más tarde.</p>";
    
    // DEBUG (comentar en producción):
    // echo $e->getMessage();
}
?>
