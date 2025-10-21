<?php
// user_profile_vulnerable_debug.php
// Versión de debug: vulnerable intencionadamente (NO usar en producción).
// Muestra todas las filas devueltas para visualizar efectos de inyección.

try {
    $conn = new PDO("mysql:host=localhost;dbname=practicas;charset=utf8mb4", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // En entorno de desarrollo está bien mostrar el error,
    // pero no lo hagas en producción.
    die("Error DB: " . $e->getMessage());
}

$id = $_GET['id'] ?? 0;

// Vulnerable: inyecta directamente el parámetro en la consulta
$sql = "SELECT id, username, email FROM users WHERE id=$id";

// Ejecutar con query (vulnerable)
try {
    $stmt = $conn->query($sql);
} catch (PDOException $e) {
    // Si la consulta falla, mostrar el SQL para debugging (sólo local)
    echo "<h3>Error en la consulta</h3>";
    echo "<pre>" . htmlspecialchars($sql) . "</pre>";
    echo "<pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
    exit;
}

// Si la consulta devolvió múltiples filas, las mostramos todas
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($rows) === 0) {
    echo "Usuario no encontrado";
} else {
    echo "<h2>Resultados devueltos (vulnerable)</h2>";
    foreach ($rows as $user) {
        echo "ID: " . htmlspecialchars($user['id'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "<br>";
        echo "Usuario: " . htmlspecialchars($user['username'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "<br>";
        echo "Email: " . htmlspecialchars($user['email'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "<br>";
        echo "<hr>";
    }
}
