<?php

require_once 'config.php';

if (!$conexion) {
    die('Error de conexión: ' . mysqli_connect_error());
}

// Seleccionamos las columnas que pide el enunciado
$sql = "SELECT numero, tipo, precio_por_noche, estado FROM habitaciones ORDER BY numero";
$res = mysqli_query($conexion, $sql);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Lista de Habitaciones</title>
    <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px}</style>
</head>
<body>
    <h1>Listado de Habitaciones</h1>

    <!--  mostramos en una tabla sencilla -->
    <?php if ($res && mysqli_num_rows($res) > 0): ?>
        <table>
            <thead>
                <tr>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Precio por Noche</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($fila = mysqli_fetch_assoc($res)): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($fila['numero']); ?></td>
                        <td><?php echo htmlspecialchars($fila['tipo']); ?></td>
                        <td><?php echo htmlspecialchars($fila['precio_por_noche']); ?></td>
                        <td><?php echo htmlspecialchars($fila['estado']); ?></td>
                    </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>No hay habitaciones registradas.</p>
    <?php endif; ?>

    <p><a href="nueva_reserva.php">Crear reserva</a> | <a href="buscar_habitaciones.php">Buscar</a> | <a href="informe_reservas.php">Informe</a></p>

    <?php
    if ($res) mysqli_free_result($res);
    mysqli_close($conexion);
    ?>
</body>
</html>