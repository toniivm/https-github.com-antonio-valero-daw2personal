<?php
// Ejercicio 5 - Borrar usuario por ID (seguro)

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
    
    $idUsuario = 1;
    
    $sql = "DELETE FROM usuarios WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$idUsuario]);
    
    $filas = $stmt->rowCount();
    
    echo "<h2>✓ Borrado</h2>";
    echo "<p><strong>ID Usuario:</strong> $idUsuario</p>";
    echo "<p><strong>Filas eliminadas:</strong> $filas</p>";
    
    if ($filas == 0) {
        echo "<p>No había usuario con ID $idUsuario</p>";
    } else {
        echo "<p>Usuario eliminado.</p>";
    }
    
} catch (PDOException $e) {
    error_log('Delete error: ' . $e->getMessage(), 0);
    echo "<h2>✗ Error</h2>";
    echo "<p>No se pudo borrar.</p>";
}
?>
