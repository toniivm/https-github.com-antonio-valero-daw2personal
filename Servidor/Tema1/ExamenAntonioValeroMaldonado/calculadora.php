<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Calculadora Simple</title>
</head>

<body>
    <!-- Formulario para introducir los números y la operación -->
    <form method="get">
        <!-- Primer numer -->
        <input type="number" name="num1" required>
        <!-- Selector de operación -->
        <select name="op">
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">*</option>
            <option value="/">/</option>
        </select>
        <!-- Segundo nuumero -->
        <input type="number" name="num2" required>
        <!-- Botón para enviar el formulario -->
        <button type="submit">=</button>
    </form>

    <?php
    // Comprobar si se han enviado los datos q necesite
    if (isset($_GET['num1'], $_GET['num2'], $_GET['op'])) {
        $a = $_GET['num1']; 
        $b = $_GET['num2']; 
        $op = $_GET['op'];  // Operación seleccionada

        // Comprobar división por cero
        if ($op == '/' && $b == 0) {
            echo "Error: División por cero.";
        } else {
            // Calcular el resultado usando eval
            eval ("\$res = $a $op $b;");
            echo "Resultado: $res"; // Muestro el resultado
        }
    }
    ?>
</body>

</html>