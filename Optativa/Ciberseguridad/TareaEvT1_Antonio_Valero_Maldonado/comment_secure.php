<?php
// comment_secure.php — evita XSS almacenado y uso inseguro de SQL
declare(strict_types=1);
session_start();

$dsn = "mysql:host=localhost;dbname=practicas;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, 'root', '', $options);
} catch (PDOException $e) {
    http_response_code(500);
    exit('Error del servicio.');
}

$saved = null;
$message = $_POST['comment'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && trim($message) !== '') {
    try {
        // Prepared statement seguro para insertar
        $sql = 'INSERT INTO comments (comment, created_at) VALUES (:comment, NOW())';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':comment' => $message]);
        $saved = true;
    } catch (PDOException $e) {
        error_log('Insert comment error: ' . $e->getMessage());
        $saved = false;
    }
}

// Recuperar últimos comentarios (no hace falta proteger la consulta, pero sí la salida)
$comments = [];
try {
    $stmt = $pdo->query('SELECT id, comment, created_at FROM comments ORDER BY id DESC LIMIT 50');
    if ($stmt) $comments = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log('Fetch comments error: ' . $e->getMessage());
    $comments = [];
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Comentarios (seguro)</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <!-- Sugerencia de CSP básica (opcional, ver nota abajo) -->
  <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none';"> -->
</head>
<body>
  <h1>Comentarios (seguro)</h1>

  <?php if ($saved === true): ?><p>Comentario guardado.</p><?php elseif ($saved === false): ?><p>Error al guardar.</p><?php endif; ?>

  <form method="post" action="">
    <label>Comentario:<br>
      <textarea name="comment" rows="4" cols="60" required></textarea>
    </label><br>
    <button type="submit">Enviar</button>
  </form>

  <hr>
  <section>
    <h2>Últimos comentarios</h2>
    <?php if (empty($comments)): ?>
      <p>No hay comentarios aún.</p>
    <?php else: ?>
      <?php foreach ($comments as $c): ?>
        <article>
          <!-- SALIDA SEGURA: escapamos siempre al mostrar -->
          <p><?= htmlspecialchars($c['comment'], ENT_QUOTES, 'UTF-8') ?></p>
          <small><?= htmlspecialchars((string)($c['created_at'] ?? ''), ENT_QUOTES, 'UTF-8') ?></small>
        </article>
      <?php endforeach; ?>
    <?php endif; ?>
  </section>
</body>
</html>
