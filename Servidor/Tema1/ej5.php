<?php 
 do{
    $dado=rand(1,6);
    echo "Tirando el dado...";
    echo "Ha salido un ".$dado.".";
    echo "<br>";
 }while($dado !=5);
 echo "¡Enhorabuena, ha salido un 5!";
 echo "<br>";
 ?>