<?php
session_start();

// Configuración PDO (ajusta a tu entorno)
$dsn = 'mysql:host=127.0.0.1;dbname=practicas;charset=utf8mb4';
$dbUser = 'root';
$dbPass = '';
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $conn = new PDO($dsn, $dbUser, $dbPass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    exit('Error de conexión a BD');
}

// CSP header (opcional, segunda capa de defensa)
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-".base64_encode(random_bytes(8))."'");

// CSRF token simple
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(24));
}
$csrf = $_SESSION['csrf_token'];

// Manejo del POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postedCsrf = $_POST['csrf_token'] ?? '';
    if (!hash_equals($csrf, $postedCsrf)) {
        http_response_code(403);
        exit('Token CSRF inválido');
    }

    $comment = $_POST['comment'] ?? '';
    $comment = trim($comment);

    // Reglas: no vacío, longitud máxima razonable
    if ($comment === '') {
        $error = 'Comentario vacío';
    } elseif (mb_strlen($comment) > 2000) {
        $error = 'Comentario demasiado largo (máx 2000 caracteres)';
    } else {
        // Insertar con prepared statement
        $stmt = $conn->prepare("INSERT INTO comments (comment, created_at) VALUES (:comment, NOW())");
        $stmt->execute([':comment' => $comment]);
        // Redirección Post/Redirect/Get para evitar re-envíos
        header('Location: ' . $_SERVER['REQUEST_URI']);
        exit;
    }
}

// Recuperar comentarios (solo campos necesarios y ordenados)
$stmt = $conn->prepare("SELECT id, comment, created_at FROM comments ORDER BY created_at DESC LIMIT 200");
$stmt->execute();
$comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

?><!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Comentarios seguros</title>
</head>
<body>
<h1>Dejar un comentario</h1>
<?php if (!empty($error)): ?>
    <div role="alert" style="color:darkred"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
<?php endif; ?>
<form method="post" action="">
    <textarea name="comment" rows="4" cols="60" maxlength="2000" required></textarea><br>
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>">
    <button type="submit">Enviar</button>
</form>

<hr>
<h2>Comentarios</h2>
<?php foreach ($comments as $c): ?>
    <article>
        <time datetime="<?= htmlspecialchars($c['created_at'], ENT_QUOTES, 'UTF-8') ?>">
            <?= htmlspecialchars($c['created_at'], ENT_QUOTES, 'UTF-8') ?>
        </time>
        <p><?= nl2br(htmlspecialchars($c['comment'], ENT_QUOTES, 'UTF-8')) ?></p>
    </article>
    <hr>
<?php endforeach; ?>
</body>
</html>
