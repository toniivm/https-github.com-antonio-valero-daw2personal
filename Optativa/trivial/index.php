<?php
// Simple router to serve the SPA and static assets
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/api/#', $uri)) {
  require __DIR__ . '/api/index.php';
  exit;
}
header('Content-Type: text/html; charset=utf-8');
?><!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Trivial Pro — Sorprendentemente Currado</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
  <div id="app">
    <header class="app-header">
      <h1>Trivial Pro</h1>
      <nav>
        <button id="btn-home" class="ghost">Inicio</button>
        <button id="btn-leaderboard" class="ghost">Ranking</button>
      </nav>
    </header>
    <main id="view-root"></main>
    <footer class="app-footer">Trivial Pro — juega, aprende y compite</footer>
  </div>
  <script src="assets/js/app.js"></script>
</body>
</html>
