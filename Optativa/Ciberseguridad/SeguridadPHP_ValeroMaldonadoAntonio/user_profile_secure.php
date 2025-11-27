<?php
// user_profile_secure.php — versión segura
declare(strict_types=1);

$dsn = "mysql:host=localhost;dbname=practicas;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, 'root', '', $options);
} catch (PDOException $e) {
    // Mensaje genérico en producción
    http_response_code(500);
    exit('Error del servicio.');
}

// Validar id recibido via GET como entero
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1] // id debe ser >= 1
]);

if ($id === false || $id === null) {
    // Entrada inválida: responder 400 Bad Request y mostrar mensaje claro
    http_response_code(400);
    echo '<p>Parámetro `id` inválido. Proporcione un identificador numérico válido.</p>';
    exit;
}

try {
    // Prepared statement: el parámetro se liga como entero
    $sql = 'SELECT id, username, email FROM users WHERE id = :id LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch();
} catch (PDOException $e) {
    http_response_code(500);
    error_log('DB error: ' . $e->getMessage());
    exit('Error en el servicio.');
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Perfil</title>
</head>
<body>
<?php if ($user): ?>
  <h1>Perfil usuario</h1>
  <p>ID: <?= htmlspecialchars((string)$user['id'], ENT_QUOTES, 'UTF-8') ?></p>
  <p>Usuario: <?= htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8') ?></p>
  <p>Email: <?= htmlspecialchars($user['email'] ?? '', ENT_QUOTES, 'UTF-8') ?></p>
<?php else: ?>
  <p>Usuario no encontrado.</p>
<?php endif; ?>
</body>
</html>
