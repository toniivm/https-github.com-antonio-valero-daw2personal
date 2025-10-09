<?php
session_start();
if (!isset($_SESSION['votos'])) {
    $_SESSION['votos'] = [
        'PHP' => 0,
        'JavaScript' => 0,
        'Python' => 0
    ];
}
if (isset($_POST['lenguaje'])) {
    $lenguaje = $_POST['lenguaje'];
    $_SESSION['votos'][$lenguaje]++;
}

if (isset($_POST['reiniciar'])) {
    unset($_SESSION['votos']);
    $_SESSION['votos'] = [
        'PHP' => 0,
        'JavaScript' => 0,
        'Python' => 0
    ];
}

$votos = $_SESSION['votos'];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Encuesta con Resultados</title>
</head>
<body>
    <h2>¿Cuál es tu lenguaje favorito?</h2>

    <form method="post">
        <input type="submit" name="lenguaje" value="PHP">
        <input type="submit" name="lenguaje" value="JavaScript">
        <input type="submit" name="lenguaje" value="Python">
        <br><br>
        <input type="submit" name="reiniciar" value="Reiniciar votos">
    </form>

    <h3>Resultados:</h3>
    <ul>
        <li>PHP: <?= $votos['PHP'] ?> votos</li>
        <li>JavaScript: <?= $votos['JavaScript'] ?> votos</li>
        <li>Python: <?= $votos['Python'] ?> votos</li>
    </ul>
</body>
</html>