<?php
// Ejercicio 4 - Actualizar precio de producto (id=5 a 19.99)

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
    
    $idProducto = 5;
    $nuevoPrecio = 19.99;
    
    $sql = "UPDATE productos SET precio = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nuevoPrecio, $idProducto]);
    
    $filas = $stmt->rowCount();
    
    echo "<h2>✓ Actualizado</h2>";
    echo "<p><strong>Producto ID:</strong> $idProducto</p>";
    echo "<p><strong>Nuevo precio:</strong> €" . number_format($nuevoPrecio, 2, ',', '.') . "</p>";
    echo "<p><strong>Filas modificadas:</strong> $filas</p>";
    
    if ($filas == 0) {
        echo "<p><em>No había producto con ID $idProducto</em></p>";
    }
    
} catch (PDOException $e) {
    error_log('Update error: ' . $e->getMessage(), 0);
    echo "<h2>✗ Error</h2>";
    echo "<p>No se pudo actualizar.</p>";
}
?>
