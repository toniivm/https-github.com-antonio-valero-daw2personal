<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contador de Acciones</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .contenedor {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 {
            color: #333;
        }
        .contador {
            font-size: 48px;
            color: #4CAF50;
            margin: 20px 0;
            font-weight: bold;
        }
        .info {
            color: #666;
            margin-top: 20px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 15px;
        }
        button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>

<?php
// compruebsi existe la cookie del contador
if (isset($_COOKIE['contador_acciones'])) {
    // si existe la cookie  le sumo 1 a su valor
    $contador = (int)$_COOKIE['contador_acciones'];
    $contador = $contador + 1;
} else {
    // si no existe, empiezo desde 1
    $contador = 1;
}

//  guardo el valor actualizado en la cookie para que dure 24 horas
$tiempo_expiracion = time() + 24 * 3600;
setcookie('contador_acciones', (string)$contador, $tiempo_expiracion);

?>

<div class="contenedor">
    <h1>Contador de Acciones</h1>
    <p>Has visitado esta página:</p>
    <div class="contador"><?php echo $contador; ?></div>
    <p>veces en las últimas 24 horas</p>
    
    <div class="info">
        <p>Recarga la página para incrementar el contador</p>
        <button onclick="location.reload()">Recargar página</button>
    </div>
</div>

</body>
</html> 