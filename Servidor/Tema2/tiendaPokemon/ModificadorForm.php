<?php
require_once 'login.php'; // variables: $db_hostname, $db_username, $db_password, $db_database

// Conexión segura a la base de datos
$db = new mysqli($db_hostname, $db_username, $db_password, $db_database);
if ($db->connect_error) {
    die("No se puede conectar con MySQL: " . $db->connect_error);
}

// Variables para mensajes y para los valores actuales del registro seleccionado
$mensaje = '';
$registro = null;

// Recuperar lista de registros (id y campos) para el desplegable
$lista = [];
$sql = "SELECT id, nombre, tipo, familia FROM pokemon ORDER BY id ASC";
if ($stmt = $db->prepare($sql)) {
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $lista[] = $row; // id, nombre, tipo, familia
    }
    $stmt->close();
}

// Si el usuario ha seleccionado un id para editar (botón "Seleccionar")
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'seleccionar') {
    $id_seleccionado = intval($_POST['id_seleccionado'] ?? 0);
    if ($id_seleccionado > 0) {
        $sql = "SELECT id, nombre, tipo, familia FROM pokemon WHERE id = ?";
        if ($stmt = $db->prepare($sql)) {
            $stmt->bind_param("i", $id_seleccionado);
            $stmt->execute();
            $res = $stmt->get_result();
            $registro = $res->fetch_assoc(); // null si no existe
            $stmt->close();
            if (!$registro) {
                $mensaje = "No existe un registro con ID = $id_seleccionado.";
            }
        } else {
            $mensaje = "Error al preparar consulta: " . $db->error;
        }
    } else {
        $mensaje = "Selecciona un ID válido.";
    }
}

// Si el usuario envía la actualización (botón "Actualizar")
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'actualizar') {
    $id = intval($_POST['id'] ?? 0);
    $nombre_nuevo = trim($_POST['nombre'] ?? '');
    $tipo_nuevo = trim($_POST['tipo'] ?? '');
    $familia_nuevo = trim($_POST['familia'] ?? '');

    if ($id <= 0) {
        $mensaje = "ID no válido.";
    } elseif ($nombre_nuevo === '' && $tipo_nuevo === '' && $familia_nuevo === '') {
        $mensaje = "Introduce al menos un valor para actualizar.";
    } else {
        // Recuperamos los valores actuales para no dejar campos a NULL si el usuario deja alguno vacío
        $sqlGet = "SELECT nombre, tipo, familia FROM pokemon WHERE id = ?";
        if ($stmtGet = $db->prepare($sqlGet)) {
            $stmtGet->bind_param("i", $id);
            $stmtGet->execute();
            $resGet = $stmtGet->get_result();
            $current = $resGet->fetch_assoc();
            $stmtGet->close();

            if (!$current) {
                $mensaje = "No existe un registro con ID = $id.";
            } else {
                // Si el usuario dejó un campo vacío, mantenemos el valor actual
                $nombre_final = ($nombre_nuevo !== '') ? $nombre_nuevo : $current['nombre'];
                $tipo_final = ($tipo_nuevo !== '') ? $tipo_nuevo : $current['tipo'];
                $familia_final = ($familia_nuevo !== '') ? $familia_nuevo : $current['familia'];

                // Consulta preparada para actualizar los tres campos del registro con ese id
                $sqlUpd = "UPDATE pokemon SET nombre = ?, tipo = ?, familia = ? WHERE id = ?";
                if ($stmtUpd = $db->prepare($sqlUpd)) {
                    $stmtUpd->bind_param("sssi", $nombre_final, $tipo_final, $familia_final, $id);
                    if ($stmtUpd->execute()) {
                        if ($stmtUpd->affected_rows > 0) {
                            $mensaje = "✅ Registro ID $id actualizado correctamente.";
                        } else {
                            // Puede ser que no se haya cambiado ningún valor
                            $mensaje = "ℹ️ No se han detectado cambios (los valores son iguales a los actuales).";
                        }
                    } else {
                        $mensaje = "Error al ejecutar actualización: " . $stmtUpd->error;
                    }
                    $stmtUpd->close();
                    // Recargamos el registro actualizado para volver a mostrar los valores
                    $sqlReload = "SELECT id, nombre, tipo, familia FROM pokemon WHERE id = ?";
                    if ($stmtR = $db->prepare($sqlReload)) {
                        $stmtR->bind_param("i", $id);
                        $stmtR->execute();
                        $resR = $stmtR->get_result();
                        $registro = $resR->fetch_assoc();
                        $stmtR->close();
                    }
                } else {
                    $mensaje = "Error al preparar actualización: " . $db->error;
                }
            }
        } else {
            $mensaje = "Error al preparar lectura: " . $db->error;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Editar Pokémon por ID</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 20px auto; line-height: 1.4; }
        label { display: inline-block; width: 100px; }
        input[type="text"] { width: 300px; padding: 6px; }
        select { padding: 6px; }
        .mensaje { margin: 12px 0; padding: 8px; border-radius: 6px; }
        .ok { background:#e6ffea; border:1px solid #8fde95; color:#116a2a; }
        .info { background:#fff7e6; border:1px solid #f1c36a; color:#6f4f00; }
        .err { background:#ffe6e6; border:1px solid #f0a0a0; color:#7a0b0b; }
        table { border-collapse: collapse; margin-top: 8px; width:100%; }
        th, td { border:1px solid #ddd; padding:8px; text-align:left; }
        th { background:#f5f5f5; }
    </style>
</head>
<body>
    <h2>Editar Pokémon (por ID)</h2>

    <?php if ($mensaje !== ''): ?>
        <div class="mensaje <?= (strpos($mensaje, 'Error') !== false || strpos($mensaje, 'no válido') !== false) ? 'err' : ((strpos($mensaje, 'actualizado') !== false) ? 'ok' : 'info') ?>">
            <?= htmlspecialchars($mensaje) ?>
        </div>
    <?php endif; ?>

    <!-- Formulario para seleccionar el ID -->
    <form method="post" action="">
        <label for="id_seleccionado">Seleccionar ID:</label>
        <select name="id_seleccionado" id="id_seleccionado" required>
            <option value="">-- Elige un registro --</option>
            <?php foreach ($lista as $fila): 
                $optLbl = $fila['id'] . " - " . $fila['nombre'] . " (" . $fila['tipo'] . " / " . $fila['familia'] . ")";
                // Si actualmente hemos cargado $registro y coincide con esta id, marcar selected
                $selected = (isset($registro['id']) && $registro['id'] == $fila['id']) ? 'selected' : '';
            ?>
                <option value="<?= (int)$fila['id'] ?>" <?= $selected ?>><?= htmlspecialchars($optLbl) ?></option>
            <?php endforeach; ?>
        </select>
        <input type="hidden" name="accion" value="seleccionar">
        <input type="submit" value="Seleccionar">
    </form>

    <?php if ($registro): ?>
        <hr>
        <h3>Valores actuales para ID <?= (int)$registro['id'] ?></h3>
        <table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Familia</th></tr></thead>
            <tbody>
                <tr>
                    <td><?= (int)$registro['id'] ?></td>
                    <td><?= htmlspecialchars($registro['nombre']) ?></td>
                    <td><?= htmlspecialchars($registro['tipo']) ?></td>
                    <td><?= htmlspecialchars($registro['familia']) ?></td>
                </tr>
            </tbody>
        </table>

        <h3>Editar campos (deja un campo vacío para mantener su valor actual)</h3>
        <form method="post" action="">
            <input type="hidden" name="id" value="<?= (int)$registro['id'] ?>">
            <label for="nombre">Nombre:</label>
            <input type="text" name="nombre" id="nombre" value="<?= htmlspecialchars($registro['nombre']) ?>"><br><br>

            <label for="tipo">Tipo:</label>
            <input type="text" name="tipo" id="tipo" value="<?= htmlspecialchars($registro['tipo']) ?>"><br><br>

            <label for="familia">Familia:</label>
            <input type="text" name="familia" id="familia" value="<?= htmlspecialchars($registro['familia']) ?>"><br><br>

            <input type="hidden" name="accion" value="actualizar">
            <input type="submit" value="Actualizar">
        </form>
    <?php endif; ?>

    <hr>
    <h3>Vista rápida: todos los registros</h3>
    <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Familia</th></tr></thead>
        <tbody>
            <?php foreach ($lista as $fila): ?>
                <tr>
                    <td><?= (int)$fila['id'] ?></td>
                    <td><?= htmlspecialchars($fila['nombre']) ?></td>
                    <td><?= htmlspecialchars($fila['tipo']) ?></td>
                    <td><?= htmlspecialchars($fila['familia']) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

</body>
</html>

<?php
$db->close();
?>
