<?php
require_once 'config.php';

if (!$conexion) {
    die('Error de conexión: ' . mysqli_connect_error());
}

// Obtenemos los números de habitación para el select
$habitaciones = [];
$q = "SELECT numero FROM habitaciones ORDER BY numero";
$r = mysqli_query($conexion, $q);
if ($r) {
    while ($row = mysqli_fetch_assoc($r)) {
        $habitaciones[] = $row['numero'];
    }
    mysqli_free_result($r);
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nueva Reserva</title>
</head>
<body>
    <h1>Crear nueva reserva</h1>
    <form action="procesar_reserva.php" method="POST">
        <label>Habitación:
            <select name="habitacion_numero" required>
                <?php if (count($habitaciones) > 0): ?>
                    <?php foreach ($habitaciones as $n): ?>
                        <option value="<?php echo htmlspecialchars($n); ?>"><?php echo htmlspecialchars($n); ?></option>
                    <?php endforeach; ?>
                <?php else: ?>
                    <option value="">(No hay habitaciones)</option>
                <?php endif; ?>
            </select>
        </label>
        <br>
        <label>Entrada: <input type="date" name="fecha_entrada" required></label>
        <label>Salida: <input type="date" name="fecha_salida" required></label>
        <br>
        <label>Nombre cliente: <input type="text" name="nombre_cliente" required></label>
        <br>
        <button type="submit">Reservar</button>
    </form>

    <p><a href="lista_reservas.php">Ver reservas</a></p>
</body>
</html>
