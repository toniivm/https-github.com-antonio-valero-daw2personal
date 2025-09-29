<!DOCTYPE html>
<html>
<head>
 <title>Número Aleatorio</title>
</head>
<body>
 <h1>Número Aleatorio</h1>
 <?php
 // Generar número aleatorio entre 1 y 100
 $num = rand(1, 100);

 // Mostrar el número generado
 echo "El número generado es: $num<br>";

 // Comprobar si es menor o igual a 50 o mayor
 if ($num <= 50) {
     echo "El número es menor o igual a 50";
 } else {
     echo "El número es mayor a 50";
 }
 ?>
</body>
</html>
