<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Tabla de Multiplicar</title>
</head>
<body>
    <h1>Tabla de Multiplicar</h1>

    <!-- Formulario POST -->
    <form method="post" action="">
        Número (POST): <input type="number" name="numero_post" required>
        <button type="submit">Calcular</button>
    </form>

    <br>

    <!-- Formulario GET -->
    <form method="get" action="">
        Número (GET): <input type="number" name="numero_get" required>
        <button type="submit">Calcular</button>
    </form>

    <hr>

    <?php
    // Revisar si se envió por POST
    if (isset($_POST['numero_post'])) {
        $num = $_POST['numero_post'];
        echo "<h2>Tabla del $num (POST)</h2>";
    }
    // Revisar si se envió por GET
    elseif (isset($_GET['numero_get'])) {
        $num = $_GET['numero_get'];
        echo "<h2>Tabla del $num (GET)</h2>";
    }

    // Mostrar tabla de multiplicar
    if (isset($num)) {
        for ($i = 1; $i <= 10; $i++) {
            $resultado = $num * $i;
            echo "$num x $i = $resultado<br>";
        }
    }
    ?>
</body>
</html>
