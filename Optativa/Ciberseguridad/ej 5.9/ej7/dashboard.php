<?php
// dashboard.php
require 'session_start_config.php';

// Protección mínima - redirige si no está logeado
if (empty($_SESSION['user_id'])) {
    header('Location: index.html');
    exit;
}

// Control simple de timeout de inactividad (30 min)
$timeout = 30 * 60;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
    // limpiar y redirigir
    $_SESSION = [];
    session_destroy();
    header('Location: index.html?timeout=1');
    exit;
}
$_SESSION['last_activity'] = time();
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dashboard</title>
  <style>
    body{ font-family: Arial, Helvetica, sans-serif; padding: 24px; background:#f4f6fb; }
    .box{ background:#fff; padding:20px; border-radius:8px; box-shadow:0 6px 16px rgba(10,10,30,0.06); max-width:800px; margin:40px auto; }
    a{ color:#0b76ef }
  </style>
</head>
<body>
  <div class="box">
    <h1>Panel</h1>
    <p>Bienvenido, <strong><?php echo htmlspecialchars($_SESSION['username'] ?? 'Usuario'); ?></strong>.</p>
    <ul>
      <li>ID de sesión: <code><?php echo session_id(); ?></code></li>
      <li>Rol: <?php echo htmlspecialchars($_SESSION['role'] ?? '—'); ?></li>
      <li>Última actividad: <?php echo date('Y-m-d H:i:s', $_SESSION['last_activity']); ?></li>
    </ul>
    <p><a href="logout.php">Cerrar sesión</a></p>
  </div>
</body>
</html>
