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
// Función para calcular media, máxima y mínima
function calcularNotas($notas): array {
    // Convertir cada nota a float
    $notas = array_map('floatval', $notas);

    // Calcular media
    $media = array_sum($notas) / count($notas);

    // Calcular máxima y mínima
    $maxima = max($notas);
    $minima = min($notas);

    // Devolver resultados como array asociativ
    return [
        'media' => $media,
        'maxima' => $maxima,
        'minima' => $minima
    ];
}

// Si el formulario se ha enviado
$resultado = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoger las notas del fomulario
    $notas = [
        $_POST['nota1'] ?? 0,
        $_POST['nota2'] ?? 0,
        $_POST['nota3'] ?? 0,
        $_POST['nota4'] ?? 0,
        $_POST['nota5'] ?? 0
    ];

    // Calcular resultado
    $resultado = calcularNotas($notas);
}
?>

    <?php if ($resultado): ?>
        <h2>Resultados</h2>
        <ul>
            <li>Media: <?php echo number_format($resultado['media'], 2); ?></li>
            <li>Nota máxima: <?php echo $resultado['maxima']; ?></li>
            <li>Nota mínima: <?php echo $resultado['minima']; ?></li>
        </ul>
    <?php endif; ?>
</body>
</html>