<?php
session_start();

// Inicializar variable de error
$error = "";

// Array de usuarios y contraseñas
$usuarios = [
    "paco" => "1234",
    "juana" => "abcd",
    "juan" => "pass"
];

// Cerrar sesión
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: ej10.php");
    exit;
}

// Si ya está logueado mostramos bienvenida y link para cerrar sesión
if (isset($_SESSION['usuario'])) {
    echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Bienvenido</title>
</head>
<body>
    <h2>Bienvenido, " . htmlspecialchars($_SESSION['usuario']) . "!</h2>
    <a href='?logout=1'>Cerrar sesión</a>
</body>
</html>";
    exit;
}

// Procesar formulario de login
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = $_POST['usuario'] ?? '';
    $pass = $_POST['contrasena'] ?? '';
    if (isset($usuarios[$user]) && $usuarios[$user] === $pass) {
        $_SESSION['usuario'] = $user;
        header("Location: ej10.php");
        exit;
    } else {
        $error = "Usuario o contraseña incorrectos.";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login Simulado</title>
</head>
<body>
    <h2>Iniciar sesión</h2>
    <?php if (!empty($error)) echo "<p style='color:red;'>" . htmlspecialchars($error) . "</p>"; ?>
    <form method="post">
        Usuario: <input type="text" name="usuario" required><br>
        Contraseña: <input type="password" name="contrasena" required><br>
        <input type="submit" value="Entrar">
    </form>
</body>
</html>
