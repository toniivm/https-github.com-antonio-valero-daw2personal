<?php
require_once 'config.php';

if (!$conexion) {
    die('Error de conexión: ' . mysqli_connect_error());
}

// Leo los filtros porGET
$tipo = isset($_GET['tipo']) ? trim($_GET['tipo']) : '';
$precio_max = isset($_GET['precio_max']) ? trim($_GET['precio_max']) : '';

// Normalizar la entrada de precio: aceptar comas como decimal, quitar espacios y símbolos
$precio_normalizado = '';
if ($precio_max !== '') {
    // Cambiar coma por punto y eliminar cualquier carácter no numérico salvo el punto y el signo negativo
    $tmp = str_replace(',', '.', $precio_max);
    $tmp = preg_replace('/[^0-9.\-]/', '', $tmp);
    $precio_normalizado = $tmp;
}

$cond = ["estado = 'libre'"];
if ($tipo !== '') {
    $tipo_esc = mysqli_real_escape_string($conexion, $tipo);
  
    $cond[] = "LOWER(tipo) LIKE LOWER('%" . $tipo_esc . "%')";
}
if ($precio_normalizado !== '' && is_numeric($precio_normalizado)) {
    $precio_num = floatval($precio_normalizado);
    $cond[] = "precio_por_noche <= $precio_num";
}


$sql = "SELECT numero, tipo, precio_por_noche, estado FROM habitaciones";
if (count($cond) > 0) $sql .= " WHERE " . implode(' AND ', $cond);
$sql .= " ORDER BY numero";

$res = mysqli_query($conexion, $sql);
if (!$res) die('Error en la consulta: ' . mysqli_error($conexion));
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Buscar Habitaciones</title>
</head>
<body>
    <h1>Buscar Habitaciones</h1>

    <!-- Formulario -->
    <form method="get">
        <label>Tipo: <input name="tipo" value="<?php echo htmlspecialchars($tipo); ?>" placeholder="ej. solo, doble, familia"></label>
            <label> Precio máx: <input type="number" name="precio_max" min="0" step="0.01" value="<?php echo htmlspecialchars($precio_max); ?>" placeholder="200"></label>
        <button type="submit">Buscar</button>
    </form>

    <h2>Resultados</h2>
    <?php if (mysqli_num_rows($res) > 0): ?>
        <table border="1" cellpadding="6">
            <tr><th>Número</th><th>Tipo</th><th>Precio</th><th>Estado</th></tr>
            <?php while ($fila = mysqli_fetch_assoc($res)): ?>
                <tr>
                    <td><?php echo htmlspecialchars($fila['numero']); ?></td>
                    <td><?php echo htmlspecialchars($fila['tipo']); ?></td>
                    <td><?php echo htmlspecialchars($fila['precio_por_noche']); ?></td>
                    <td><?php echo htmlspecialchars($fila['estado']); ?></td>
                </tr>
            <?php endwhile; ?>
        </table>
    <?php else: ?>
        <p>No se encontraron habitaciones.</p>
    <?php endif; ?>

    <?php mysqli_free_result($res); mysqli_close($conexion); ?>
</body>
</html>