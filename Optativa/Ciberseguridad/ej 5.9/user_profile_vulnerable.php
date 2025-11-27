<?php
// user_profile_vulnerable.php
try {
    $conn = new PDO("mysql:host=localhost;dbname=practicas;charset=utf8mb4", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("DB error");
}

$id = $_GET['id'] ?? 0;

// VULNERABLE: se inyecta directamente en la consulta
$sql = "SELECT * FROM users WHERE id=$id";
$stmt = $conn->query($sql);

$user = $stmt->fetch(PDO::FETCH_ASSOC);
if ($user) {
    echo "Usuario: " . htmlspecialchars($user['username'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8');
} else {
    echo "Usuario no encontrado";
}
