<?php
session_start();

if (isset($_POST['guardar'])) {
    $_SESSION['nombre'] = $_POST['nombre'];
    $_SESSION['correo'] = $_POST['correo'];
}

if (isset($_POST['borrar'])) {
    unset($_SESSION['nombre']);
    unset($_SESSION['correo']);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Formulario con Sesión</title>
</head>
<body>
    <h2>Formulario con Datos Guardados</h2>

    <form method="post">
        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" name="nombre"
               value="<?php echo $_SESSION['nombre'] ?? ''; ?>"><br><br>

        <label for="correo">Correo:</label>
        <input type="email" id="correo" name="correo"
               value="<?php echo $_SESSION['correo'] ?? ''; ?>"><br><br>

        <input type="submit" name="guardar" value="Guardar">
        <input type="submit" name="borrar" value="Borrar">
    </form>
</body>
</html>