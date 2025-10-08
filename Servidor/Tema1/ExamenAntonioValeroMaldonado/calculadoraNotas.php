<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Calculadora de Notas</title>
</head>
<body>
    <h1>Calculadora de Notas</h1>
    <form method="post">
        <label>Nota 1: <input type="number" name="nota1" step="0.01" required></label><br>
        <label>Nota 2: <input type="number" name="nota2" step="0.01" required></label><br>
        <label>Nota 3: <input type="number" name="nota3" step="0.01" required></label><br>
        <label>Nota 4: <input type="number" name="nota4" step="0.01" required></label><br>
        <label>Nota 5: <input type="number" name="nota5" step="0.01" required></label><br>
        <button type="submit">Calcular</button>
    </form>
    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recoge las notas del formulario
        $n1 = (float)$_POST['nota1'];
        $n2 = (float)$_POST['nota2'];
        $n3 = (float)$_POST['nota3'];
        $n4 = (float)$_POST['nota4'];
        $n5 = (float)$_POST['nota5'];

        // Calcula media, máxima y mínima
        $media = ($n1 + $n2 + $n3 + $n4 + $n5) / 5;
        $maxima = max($n1, $n2, $n3, $n4, $n5);
        $minima = min($n1, $n2, $n3, $n4, $n5);

        // Muestra los resultados
        echo "<h2>Resultados</h2>";
        echo "<ul>";
        echo "<li>Media: " . number_format($media, 2) . "</li>";
        echo "<li>Nota máxima: $maxima</li>";
        echo "<li>Nota mínima: $minima</li>";
        echo "</ul>";
    }
    ?>
</body>
</html>