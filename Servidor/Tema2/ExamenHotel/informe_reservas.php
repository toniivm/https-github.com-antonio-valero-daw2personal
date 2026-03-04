<?php

require_once 'config.php';

if (!$conexion) {
    die('Error de conexión: ' . mysqli_connect_error());
}

$sql = "SELECT h.numero as habitacion_numero, COUNT(r.id) as total_reservas, MAX(r.fecha_entrada) as ultima_reserva
        FROM habitaciones h
        LEFT JOIN reservas r ON h.numero = r.habitacion_numero
        GROUP BY h.numero
        ORDER BY total_reservas DESC";

$res = mysqli_query($conexion, $sql);
if (!$res) {
    die('Error en la consulta: ' . mysqli_error($conexion));
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Reservas</title>
    <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px}</style>
</head>
<body>
    <h1>Informe de Reservas por Habitación</h1>

    <?php if (mysqli_num_rows($res) > 0): ?>
        <table>
            <tr><th>Habitación</th><th>Total Reservas</th><th>Última Reserva</th></tr>
            <?php while ($f = mysqli_fetch_assoc($res)): ?>
                <tr>
                    <td><?php echo htmlspecialchars($f['habitacion_numero']); ?></td>
                    <td><?php echo htmlspecialchars($f['total_reservas']); ?></td>
                    <td><?php echo $f['ultima_reserva'] ? htmlspecialchars($f['ultima_reserva']) : 'Sin reservas'; ?></td>
                </tr>
            <?php endwhile; ?>
        </table>
    <?php else: ?>
        <p>No hay datos de reservas.</p>
    <?php endif; ?>

    <p><a href="lista_habitaciones.php">Volver</a></p>

    <?php mysqli_free_result($res); mysqli_close($conexion); ?>
</body>
</html>