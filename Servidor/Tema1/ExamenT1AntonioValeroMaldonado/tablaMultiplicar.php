<!DOCTYPE html> 
<html lang="es"> 
<head>
    <meta charset="UTF-8"> 
    <title>Tabla de Multiplicar</title> 
</head>
<body>
    <h1>Tabla de Multiplicar</h1> 
    <form method="post"> <!-- Formulario que envía datos por POST -->
        <label for="numero">Introduce un número entero:</label> 
        <input type="number" name="numero" id="numero" required> 
        <button type="submit">Mostrar tabla</button> 
    </form>

    <?php
    if ($_SERVER["REQUEST_METHOD"] === "POST") { // Comprobar si el formulario fue enviado por POST
        $numero = intval($_POST["numero"]); // Obtener y convertir el número introducido a entero
        echo "<h2>Tabla del $numero</h2>"; 
        echo "<table border='1' cellpadding='5'>"; 
        for ($i = 1; $i <= 10; $i++) { 
            $resultado = $numero * $i; // Calcular el resultado de la multiplicación
            echo "<tr><td>$numero x $i</td><td>$resultado</td></tr>"; 
        }
        echo "</table>"; // Cerrar la tabla
    }
    ?>
</body>
</html>