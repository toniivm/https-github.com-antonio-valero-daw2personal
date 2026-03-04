<?php
// search_secure.php 
declare(strict_types=1);
header('Content-Type: text/html; charset=utf-8');

$q = $_GET['q'] ?? '';
$q_trim = is_string($q) ? trim($q) : '';
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Buscador (seguro)</title>
</head>
<body>
  <h1>Buscador (seguro)</h1>
  <form method="get" action="">
    <!-- input protegido -->
    <input name="q" value="<?= htmlspecialchars($q_trim, ENT_QUOTES, 'UTF-8') ?>" placeholder="buscar...">
    <button>Buscar</button>
  </form>

  <?php if ($q_trim !== ''): ?>
    <section>
      <!-- salida protegida: ya no ejecuta código -->
      <h2>Resultados para: <?= htmlspecialchars($q_trim, ENT_QUOTES, 'UTF-8') ?></h2>
      <p>Resultado simulado: "Se encontraron 0 coincidencias".</p>
    </section>
  <?php endif; ?>
</body>
</html>
