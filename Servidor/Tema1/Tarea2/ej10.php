

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login Simulado</title>
</head>
<body>
    <h2>Iniciar sesión</h2>
    <?php if ($error) echo "<p style='color:red;'>$error</p>"; ?>
    <form method="post">
        Usuario: <input type="text" name="usuario" required><br>
        Contraseña: <input type="password" name="contrasena" required><br>
        <input type="submit" value="Entrar">
    </form>
    <?php
session_start();

// Array de usuarios y contraseñas
$usuarios = [
    "antonio" => "1234",
    "adriana" => "abcd",
    "juan" => "pass"
];

// Cerrar sesión
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: ej10.php");
    exit;
}

// Si ya está logueado
if (isset($_SESSION['usuario'])) {
    echo "<h2>Bienvenido, " . htmlspecialchars($_SESSION['usuario']) . "!</h2>";
    echo '<a href="?logout=1">Cerrar sesión</a>';
    exit;
}

// Procesar formulario de login
$error = "";
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
</body>
</html>