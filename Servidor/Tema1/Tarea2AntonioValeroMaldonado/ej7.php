<?php
session_start();

if (isset($_POST['reinicio'])) {
    $_SESSION['carrito'] = array();
}

if (!isset($_SESSION['carrito'])) {
    $_SESSION['carrito'] = array();
}

if (isset($_POST['producto'])) {
    $_SESSION['carrito'][] = $_POST['producto'];
}

$productos = array(
    "Camiseta" => 15,
    "Pantalón" => 25,
    "Zapatillas" => 40
);

$total = 0;
for ($i = 0; $i < count($_SESSION['carrito']); $i++) {
    $nombre = $_SESSION['carrito'][$i];
    $total = $total + $productos[$nombre];
}

echo "<h1>Carrito</h1>";

if (count($_SESSION['carrito']) == 0) {
    echo "<p>Carrito vacío</p>";
} else {
    for ($i = 0; $i < count($_SESSION['carrito']); $i++) {
        $nombre = $_SESSION['carrito'][$i];
        echo "<p>$nombre - " . $productos[$nombre] . " €</p>";
    }
    echo "<h3>Total: $total €</h3>";
}
?>
<form method="post">
    <select name="producto">
        <option value="Camiseta">Camiseta - 15€</option>
        <option value="Pantalón">Pantalón - 25€</option>
        <option value="Zapatillas">Zapatillas - 40€</option>
    </select>
    <button type="submit">Añadir</button>
</form>

<form method="post">
    <button type="submit" name="reinicio">Vaciar carrito</button>
</form>