<?php
session_start();
require_once 'login.php'; // Debe definir $db_hostname, $db_username, $db_password, $db_database

// Conexión a la base de datos utilizando mysqli
$db_server = new mysqli($db_hostname, $db_username, $db_password, $db_database);
if ($db_server->connect_error) {
    die("No se puede conectar con MySQL: " . $db_server->connect_error);
}

// Procesar el envío del formulario (eliminar por nombre seleccionado)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['nombre_seleccionado'])) {
    $nombre = trim($_POST['nombre_seleccionado']);

    if ($nombre === '') {
        $_SESSION['mensaje'] = ['tipo' => 'error', 'texto' => 'Selecciona un nombre válido.'];
    } else {
        $stmt = $db_server->prepare("DELETE FROM pokemon WHERE nombre = ?");
        if ($stmt === false) {
            $_SESSION['mensaje'] = ['tipo' => 'error', 'texto' => 'Error al preparar la consulta: ' . $db_server->error];
        } else {
            $stmt->bind_param("s", $nombre);
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $_SESSION['mensaje'] = ['tipo' => 'ok', 'texto' => "Se han eliminado {$stmt->affected_rows} registro(s) con el nombre '" . htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') . "'."];
                } else {
                    $_SESSION['mensaje'] = ['tipo' => 'info', 'texto' => "No se encontraron registros con el nombre '" . htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') . "'."];
                }
            } else {
                $_SESSION['mensaje'] = ['tipo' => 'error', 'texto' => 'Fallo al ejecutar la consulta: ' . $stmt->error];
            }
            $stmt->close();
        }
    }

    // Cerrar conexión y redirigir para evitar reenvío del formulario (POST -> GET)
    $db_server->close();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// En GET: recuperamos la lista de nombres disponibles para el desplegable
$nombres = [];
$sql = "SELECT DISTINCT nombre FROM pokemon WHERE nombre IS NOT NULL AND nombre <> '' ORDER BY nombre ASC";
if ($stmt = $db_server->prepare($sql)) {
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $nombres[] = $row['nombre'];
    }
    $stmt->close();
} else {
    // Si falla la recuperación, mostraremos el error en la página
    $_SESSION['mensaje'] = ['tipo' => 'error', 'texto' => 'Error al obtener la lista de nombres: ' . $db_server->error];
    // intentar continuar para mostrar el mensaje
}

$mensaje = $_SESSION['mensaje'] ?? null;
unset($_SESSION['mensaje']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Eliminar Pokémon (selección por nombre)</title>
    <style>
        body { font-family: Arial, sans-serif; max-width:700px; margin:20px auto; }
        .ok { background:#e6ffea; border:1px solid #8fde95; padding:8px; color:#116a2a; border-radius:6px; }
        .info { background:#fff7e6; border:1px solid #f1c36a; padding:8px; color:#6f4f00; border-radius:6px; }
        .err { background:#ffe6e6; border:1px solid #f0a0a0; padding:8px; color:#7a0b0b; border-radius:6px; }
        form { margin-top:12px; }
        label { display:block; margin-bottom:6px; }
        select, input[type="text"] { padding:6px; width:320px; }
        input[type="submit"] { padding:8px 12px; margin-top:8px; }
    </style>
</head>
<body>
    <h2>Eliminar Pokémon (selecciona por nombre)</h2>

    <?php if ($mensaje): ?>
        <div class="<?= $mensaje['tipo'] === 'ok' ? 'ok' : ($mensaje['tipo'] === 'error' ? 'err' : 'info') ?>">
            <?= htmlspecialchars($mensaje['texto'], ENT_QUOTES, 'UTF-8') ?>
        </div>
    <?php endif; ?>

    <?php if (empty($nombres)): ?>
        <p>No hay nombres disponibles en la tabla <code>pokemon</code>.</p>
    <?php else: ?>
        <form method="post" action="">
            <label for="nombre_seleccionado">Selecciona el Pokémon a eliminar:</label>
            <select name="nombre_seleccionado" id="nombre_seleccionado" required>
                <option value="">-- Elige un nombre --</option>
                <?php foreach ($nombres as $nombre): ?>
                    <option value="<?= htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($nombre) ?></option>
                <?php endforeach; ?>
            </select>
            <br>
            <input type="submit" value="Eliminar">
        </form>
    <?php endif; ?>

    <hr>
</body>
</html>
<?php
$db_server->close();
?>
