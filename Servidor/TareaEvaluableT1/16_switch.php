<html>
<head>
<title>Condicional Switch</title>
</head>
<body>
<h1>Condicional Switch. Ejemplo</h1>
<?php
$posicion = "arriba";
echo "La variable posicion es ", $posicion;
echo "<br>";
switch ($posicion) {
 case "arriba":
 echo "La variable contiene el valor de arriba";
 break;
 case "abajo":
 echo "La variable contiene el valor de abajo";
 break;
 default:
 echo "La variable contiene otro valor distinto arriba y abajo";
}
?>
</body>
</html>