<?php
/* 
Explicar qué es lo que hace el código.
Explicar qué hace la sentencia <td><font color...;
¿Para qué sirve <table border="1">? ¿Se necesita?
¿Qué muestra la última línea?
*/
function muestra($valor) {
if ($valor < 0.5)
$color = "red";
else
$color = "blue";
echo "<td><font color='$color'>$valor</font></td>\n";
}
?>
<table border="1">
<?
for ($x=0; $x<=2; $x+=0.01){
    echo "<tr>";
    muestra($x);
    muestra(sin($x));
    muestra(cos($x));
    echo "</tr>";
}
?>