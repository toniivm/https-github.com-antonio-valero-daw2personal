<?php
session_start();

// usuarios y contraseñas
$usuarios = [
    'admin' => '1234',
    'usuario1' => 'clave1',
    'usuario2' => 'clave2'
];

// login
if (isset($_POST['usuario']) && isset($_POST['contrasena'])) {
    $user = $_POST['usuario'];
    $pass = $_POST['contrasena'];

    // Verificar
    if (isset($usuarios[$user]) && $usuarios[$user] === $pass) {
        $_SESSION['usuario'] = $user;
    }
}

// Cerrar sesión
if (isset($_POST['cerrar_sesion'])) {
    session_destroy();
    $_SESSION = [];
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Inicio de Sesión</title>
</head>
<body>
    <?php if (isset($_SESSION['usuario'])): ?>
        <h2>Bienvenido, <?= $_SESSION['usuario'] ?>!</h2>
        <form method="post" action="">
            <input type="submit" name="cerrar_sesion" value="Cerrar Sesión">
        </form>
    <?php else: ?>
        <h2>Iniciar Sesión</h2>
        <form method="post" action="">
            <label for="usuario">Usuario:</label>
            <input type="text" id="usuario" name="usuario"><br><br>

            <label for="contrasena">Contraseña:</label>
            <input type="password" id="contrasena" name="contrasena"><br><br>

            <input type="submit" value="Iniciar Sesión">
        </form>
        <?php if (isset($_POST['usuario'])): ?>
            <p>Usuario o contraseña incorrectos.</p>
        <?php endif; ?>
    <?php endif; ?>
</body>
</html>