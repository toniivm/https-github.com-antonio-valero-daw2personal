<!DOCTYPE html>
<html>
<head>
    <title>Contador de Visitas</title>
</head>
<body>
    <h1>Has visitado esta página <?php echo $_SESSION['visitas']; ?> veces en esta sesión.</h1>
    <form method="post">
        <button type="submit" name="reiniciar">Reiniciar contador</button>
    </form>


    <?php
// Iniciar la sesión
session_start();

// Si se ha pulsado el botón de reiniciar, se borra el contador
if (isset($_POST['reiniciar'])) {
    unset($_SESSION['visitas']);
}

// Comprobar si existe la variable que cuenta visitas
if (isset($_SESSION['visitas'])) {
    // Si existe, incrementar el contador
    $_SESSION['visitas']++;
} else {
    // Si no existe, inicializar el contador a 1
    $_SESSION['visitas'] = 1;
}
?>

</body>

</html>