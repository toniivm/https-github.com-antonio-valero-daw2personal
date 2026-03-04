<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <?php
    $resultado = ''; // Inicializo como cadena vacía
    if (!empty($_POST['valor']) && !empty($_POST['tipo'])) { // Compruebo si llegaro los datos del formulario
        $valor = floatval($_POST['valor']); // Convierto a número decimal
        if ($_POST['tipo'] === 'celAfar') { // Si se seleccionó convertir de Celsius a Fahrenheit
            $resultado = round($valor * 9 / 5 + 32, 2) . " °F"; // añado el símbolo °F
        } else { // Si se seleccionó convertir de Fahrenheit a Celsius
            $resultado = round(($valor - 32) * 5 / 9, 2) . " °C"; // Realiza la conversión y añade°C
        }
    }
    // Muestro el formulario para introducir valor
    ?>
    <form method="POST">
        <input type="number" name="valor"  required>
        <select name="tipo">
            <option value="celAfar">Celsius a Fahrenheit</option>
            <option value="farAcel">Fahrenheit a Celsius</option>
        </select>
        <button type="submit">Convertir</button>
    </form>
    <?php
    // Si hay un resultado, lo muestro
    if ($resultado): ?>
        <p>Resultado: <?php echo $resultado; ?></p>
    <?php endif; ?>

</body>

</html>