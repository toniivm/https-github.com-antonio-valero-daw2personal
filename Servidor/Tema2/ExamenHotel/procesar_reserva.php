<?php
require_once 'config.php';

if (!$conexion) {
    die('Error de conexión: ' . mysqli_connect_error());
}

// Recogemos datos  desde POST
$habitacion_numero = isset($_POST['habitacion_numero']) ? trim($_POST['habitacion_numero']) : '';
$fecha_entrada = isset($_POST['fecha_entrada']) ? trim($_POST['fecha_entrada']) : '';
$fecha_salida = isset($_POST['fecha_salida']) ? trim($_POST['fecha_salida']) : '';
$nombre_cliente = isset($_POST['nombre_cliente']) ? trim($_POST['nombre_cliente']) : '';

$errores = [];

if ($habitacion_numero === '' || $fecha_entrada === '' || $fecha_salida === '' || $nombre_cliente === '') {
    $errores[] = 'Todos los campos son obligatorios.';
}
if ($fecha_entrada !== '' && $fecha_salida !== '' && $fecha_entrada >= $fecha_salida) {
    $errores[] = 'Fecha entrada debe ser anterior a fecha salida.';
}

$habit_esc = mysqli_real_escape_string($conexion, $habitacion_numero);
// Compruebo que la habitación existe (citar el valor para evitar errores de sintaxis si está vacío)
$q = "SELECT numero FROM habitaciones WHERE numero = '$habit_esc'";
$r = mysqli_query($conexion, $q);
if (!$r || mysqli_num_rows($r) === 0) {
    $errores[] = 'La habitación no existe.';
}
if ($r) mysqli_free_result($r);

// Comprueb reservas
if (empty($errores)) {
    $fe1 = mysqli_real_escape_string($conexion, $fecha_entrada);
    $fe2 = mysqli_real_escape_string($conexion, $fecha_salida);
    // Citar habitacion_numero también en esta consulta
    $q2 = "SELECT id FROM reservas WHERE habitacion_numero = '$habit_esc' AND fecha_salida > '$fe1' AND fecha_entrada < '$fe2'";
    $r2 = mysqli_query($conexion, $q2);
    if ($r2 && mysqli_num_rows($r2) > 0) {
        $errores[] = 'Ya existe una reserva que solapa con esas fechas.';
    }
    if ($r2) mysqli_free_result($r2);
}

if (!empty($errores)) {
    echo '<h2>Errores</h2>';
    foreach ($errores as $e) echo '<p>' . htmlspecialchars($e) . '</p>';
    echo '<p><a href="nueva_reserva.php">Volver</a></p>';
    mysqli_close($conexion);
    exit;
}

// Inserto la reserva 
$nombre_esc = mysqli_real_escape_string($conexion, $nombre_cliente);
$insert = "INSERT INTO reservas (habitacion_numero, fecha_entrada, fecha_salida, nombre_cliente) VALUES ('$habit_esc', '$fe1', '$fe2', '$nombre_esc')";
if (mysqli_query($conexion, $insert)) {
    echo '<h2>Reserva creada</h2>';
    echo '<p><a href="lista_reservas.php">Ver reservas</a></p>';
} else {
    echo '<h2>Error al crear la reserva</h2>';
    echo '<p>' . htmlspecialchars(mysqli_error($conexion)) . '</p>';
}

mysqli_close($conexion);
?>
