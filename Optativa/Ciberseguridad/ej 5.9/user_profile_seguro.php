<?php
// user_profile_secure.php
// Versión segura: valida y usa prepared statement con PDO::PARAM_INT

try {
    $conn = new PDO("mysql:host=localhost;dbname=practicas;charset=utf8mb4", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    exit('Error interno de BD');
}

// Validar que 'id' sea un entero válido
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === false || $id === null) {
    http_response_code(400);
    exit('ID inválido');
}

// Prepared statement, bind como entero
$stmt = $conn->prepare("SELECT id, username, email FROM users WHERE id = :id LIMIT 1");
$stmt->bindValue(':id', $id, PDO::PARAM_INT);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);
if ($user) {
    echo "<h2>Usuario (seguro)</h2>";
    echo "ID: " . htmlspecialchars($user['id'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "<br>";
    echo "Usuario: " . htmlspecialchars($user['username'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "<br>";
    echo "Email: " . htmlspecialchars($user['email'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') . "<br>";
} else {
    echo "Usuario no encontrado";
}
