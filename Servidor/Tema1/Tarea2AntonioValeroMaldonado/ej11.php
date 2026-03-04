 <?php
session_start();

// Función generar contraseña
function generarContrasena($longitud) {
    // arrays de caracteres
    $letras_minus = range('a', 'z');
    $letras_mayus = range('A', 'Z');
    $numeros = range(0, 9);
    $simbolos = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
    $caracteres = array_merge($letras_minus, $letras_mayus, $numeros, $simbolos);

    // Genero contraseña
    $contrasena = '';
    for ($i = 0; $i < $longitud; $i++) {
        $contrasena .= $caracteres[array_rand($caracteres)];
    }

    return $contrasena;
}

// Proceso formulario
if (isset($_POST['longitud'])) {
    $longitud = (int)$_POST['longitud'];
    if ($longitud > 0) {
        $_SESSION['contrasena'] = generarContrasena($longitud);
    } else {
        $_SESSION['contrasena'] = '';
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de Contraseñas</title>
</head>
<body>
    <h2>Generador de Contraseñas</h2>
    <form method="post" action="">
        <label for="longitud">Longitud de la contraseña:</label>
        <input type="number" id="longitud" name="longitud" min="1" value="<?= isset($_POST['longitud']) ? $_POST['longitud'] : '' ?>">
        <input type="submit" value="Generar">
    </form>

    <?php if (isset($_SESSION['contrasena']) && $_SESSION['contrasena'] !== ''): ?>
        <h3>Contraseña Generada:</h3>
        <p><?= $_SESSION['contrasena'] ?></p>
    <?php elseif (isset($_POST['longitud']) && $longitud <= 0): ?>
        <p>Por favor, ingrese una longitud válida mayor a 0.</p>
    <?php endif; ?>
</body>
</html>