<?php
require_once 'config.php';

if (!$conexion) {
    die('Error de conexión: ' . mysqli_connect_error());
}

// Obtenemos las reservas con info de la habitacino
$sql = "SELECT r.id, r.habitacion_numero, r.fecha_entrada, r.fecha_salida, r.nombre_cliente, h.tipo
        FROM reservas r
        LEFT JOIN habitaciones h ON r.habitacion_numero = h.numero
        ORDER BY r.fecha_entrada";
$res = mysqli_query($conexion, $sql);

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Lista de Reservas</title>
    <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px}</style>
</head>
<body>
    <h1>Lista de Reservas</h1>

    <?php if ($res && mysqli_num_rows($res) > 0): ?>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nº Habitación</th>
                    <th>Tipo</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Cliente</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($row = mysqli_fetch_assoc($res)): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($row['id']); ?></td>
                        <td><?php echo htmlspecialchars($row['habitacion_numero']); ?></td>
                        <td><?php echo htmlspecialchars($row['tipo']); ?></td>
                        <td><?php echo htmlspecialchars($row['fecha_entrada']); ?></td>
                        <td><?php echo htmlspecialchars($row['fecha_salida']); ?></td>
                        <td><?php echo htmlspecialchars($row['nombre_cliente']); ?></td>
                    </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>No hay reservas registradas.</p>
    <?php endif; ?>

    <p><a href="nueva_reserva.php">Crear nueva reserva</a> | <a href="lista_habitaciones.php">Ver habitaciones</a></p>

    <?php if ($res) mysqli_free_result($res); mysqli_close($conexion); ?>
</body>
</html>