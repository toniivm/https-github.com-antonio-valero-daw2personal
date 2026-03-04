<?php
//Comprobación de operadores
// Definición de variables
$a = 10;
$b = 5;
$c = true;
$d = false;

// Operadores aritméticos
echo "Operadores aritméticos:<br>";
echo "Suma: $a + $b = " . ($a + $b) . "<br>";
echo "Resta: $a - $b = " . ($a - $b) . "<br>";
echo "Multiplicación: $a * $b = " . ($a * $b) . "<br>";
echo "División: $a / $b = " . ($a / $b) . "<br>";
echo "Módulo: $a % $b = " . ($a % $b) . "<br>";
echo "Exponenciación: $a ** $b = " . ($a ** $b) . "<br><br>";

// Operadores de comparación
echo "Operadores de comparación:<br>";
echo "Igual (==): $a == $b es " . var_export($a == $b, true) . "<br>";
echo "Idéntico (===): $a === $b es " . var_export($a === $b, true) . "<br>";
echo "Diferente (!=): $a != $b es " . var_export($a != $b, true) . "<br>";
echo "Mayor que (>): $a > $b es " . var_export($a > $b, true) . "<br>";
echo "Menor que (<): $a < $b es " . var_export($a < $b, true) . "<br>";
echo "Mayor o igual que (>=): $a >= $b es " . var_export($a >= $b, true) . "<br>";
echo "Menor o igual que (<=): $a <= $b es " . var_export($a <= $b, true) . "<br><br>";

// Operadores lógicos
echo "Operadores lógicos:<br>";
echo "AND (&&): $c && $d es " . var_export($c && $d, true) . "<br>";
echo "OR (||): $c || $d es " . var_export($c || $d, true) . "<br>";
echo "NOT (!): !$c es " . var_export(!$c, true) . "<br><br>";

// Operadores de incremento/decremento
echo "Operadores de incremento/decremento:<br>";
$x = $a;
echo "Pre-incremento: ++$x = " . (++$x) . "<br>";
$x = $a;
echo "Post-incremento: $x++ = " . ($x++) . ", después $x = $x<br>";
$x = $a;
echo "Pre-decremento: --$x = " . (--$x) . "<br>";
$x = $a;
echo "Post-decremento: $x-- = " . ($x--) . ", después $x = $x<br><br>";

// Operadores de asignación
echo "Operadores de asignación:<br>";
$x = $a;
echo "Asignación con suma: $x += $b es " . ($x += $b) . "<br>";
$x = $a;
echo "Asignación con resta: $x -= $b es " . ($x -= $b) . "<br>";
$x = $a;
echo "Asignación con multiplicación: $x *= $b es " . ($x *= $b) . "<br>";
$x = $a;
echo "Asignación con división: $x /= $b es " . ($x /= $b) . "<br>";

// Operador ternario
echo "<br>Operador ternario:<br>";
$resultado = ($a > $b) ? "a es mayor que b" : "a no es mayor que b";
echo "($a > $b) ? 'a es mayor que b' : 'a no es mayor que b' resulta en: $resultado<br>";
?>