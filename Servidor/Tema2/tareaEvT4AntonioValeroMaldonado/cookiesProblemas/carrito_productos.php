<?php
// Ejercicio 4: Carrito de compras

// Obtener carrito
function getCarrito() {
    if (isset($_COOKIE['carrito'])) {
        return json_decode($_COOKIE['carrito'], true);
    }
    return array();
}

// Guardar carrito
function saveCarrito($carr) {
    setcookie('carrito', json_encode($carr), time() + 604800, "/");
}

// Lista de productos
$prods = array(
    1 => array('nom' => 'Laptop', 'precio' => 799.99),
    2 => array('nom' => 'Mouse', 'precio' => 29.99),
    3 => array('nom' => 'Teclado', 'precio' => 89.99),
    4 => array('nom' => 'Monitor', 'precio' => 199.99)
);

$msg = '';

// Agregar producto
if (isset($_POST['add'])) {
    $id = intval($_POST['id']);
    
    if (isset($prods[$id])) {
        $carr = getCarrito();
        
        if (isset($carr[$id])) {
            $carr[$id]['cant']++;
        } else {
            $carr[$id] = array(
                'nom' => $prods[$id]['nom'],
                'precio' => $prods[$id]['precio'],
                'cant' => 1
            );
        }
        
        saveCarrito($carr);
        $msg = 'Producto agregado';
    }
}

// Contar items
$carr = getCarrito();
$items = 0;
foreach ($carr as $it) {
    if(isset($it['cant'])) {
        $items += $it['cant'];
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tienda</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .header {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        h2 {
            margin: 0;
        }
        .vercarrito {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        .productos {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .prod {
            background: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .prod h3 {
            color: #333;
            margin: 10px 0;
        }
        .precio {
            color: #28a745;
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        button {
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .msg {
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Tienda Online</h2>
        <a href="carrito_ver.php" class="vercarrito">
            Ver Carrito (<?php echo $items; ?>)
        </a>
    </div>
    
    <?php if ($msg != ''): ?>
        <div class="msg"><?php echo $msg; ?></div>
    <?php endif; ?>
    
    <div class="productos">
        <?php foreach ($prods as $id => $p): ?>
            <div class="prod">
                <h3><?php echo $p['nom']; ?></h3>
                <div class="precio">$<?php echo number_format($p['precio'], 2); ?></div>
                <form method="POST">
                    <input type="hidden" name="id" value="<?php echo $id; ?>">
                    <button type="submit" name="add">Agregar</button>
                </form>
            </div>
        <?php endforeach; ?>
    </div>
</body>
</html>
