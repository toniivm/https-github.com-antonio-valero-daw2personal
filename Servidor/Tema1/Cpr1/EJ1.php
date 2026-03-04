<?php
$a = 5;
$b = 4;
$c = ($a * 2 > $b + 5) && !($b <> 4);
echo "<pre>";
var_dump($c);
echo "$c";
?>