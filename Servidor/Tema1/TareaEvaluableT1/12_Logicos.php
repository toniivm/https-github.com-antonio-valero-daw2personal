<html>
<head>
<title>Ejemplo de operadores Lógicos</title>
</head>
<body>
<h1>Ejemplo de operaciones lógicas en PHP</h1>
<?php
$a = 8;
$b = 3;
$c = 3;
echo ($a == $b) & ($c > $b), "<br>";
echo ($a == $b) || ($b == $c), "<br>";
echo !($b <= $c), "<br>";
?>
</body>
</html>