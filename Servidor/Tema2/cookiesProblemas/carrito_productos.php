<?php
/**
 * Ejercicio 4: Carrito de compras simple - Página de Productos
 * Muestra una lista de productos que se pueden agregar al carrito.
 */

// Función para obtener el carrito desde las cookies
function obtenerCarrito() {
    if (isset($_COOKIE['carrito'])) {
        return json_decode($_COOKIE['carrito'], true);
    }
    return [];
}

// Función para guardar el carrito en cookies
function guardarCarrito($carrito) {
    setcookie('carrito', json_encode($carrito), time() + (86400 * 7), "/"); // 7 días
}

// Productos disponibles
$productos = [
    1 => ['nombre' => 'Laptop HP', 'precio' => 799.99, 'imagen' => '💻'],
    2 => ['nombre' => 'Mouse Inalámbrico', 'precio' => 29.99, 'imagen' => '🖱️'],
    3 => ['nombre' => 'Teclado Mecánico', 'precio' => 89.99, 'imagen' => '⌨️'],
    4 => ['nombre' => 'Monitor 24"', 'precio' => 199.99, 'imagen' => '🖥️'],
    5 => ['nombre' => 'Auriculares Bluetooth', 'precio' => 59.99, 'imagen' => '🎧'],
    6 => ['nombre' => 'Webcam HD', 'precio' => 49.99, 'imagen' => '📷'],
    7 => ['nombre' => 'Disco Duro 1TB', 'precio' => 69.99, 'imagen' => '💾'],
    8 => ['nombre' => 'USB 64GB', 'precio' => 19.99, 'imagen' => '🔌']
];

// Procesar agregar al carrito
if (isset($_POST['agregar'])) {
    $id_producto = intval($_POST['id_producto']);
    
    if (isset($productos[$id_producto])) {
        $carrito = obtenerCarrito();
        
        // Si el producto ya está en el carrito, incrementar cantidad
        if (isset($carrito[$id_producto])) {
            $carrito[$id_producto]['cantidad']++;
        } else {
            // Agregar nuevo producto
            $carrito[$id_producto] = [
                'nombre' => $productos[$id_producto]['nombre'],
                'precio' => $productos[$id_producto]['precio'],
                'cantidad' => 1
            ];
        }
        
        guardarCarrito($carrito);
        $mensaje = "✓ Producto agregado al carrito";
    }
}

// Obtener carrito actual para mostrar el contador
$carrito = obtenerCarrito();
$total_items = 0;
foreach ($carrito as $item) {
    $total_items += $item['cantidad'];
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tienda - Carrito de Compras</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .navbar {
            background: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .navbar h1 {
            color: #333;
            font-size: 28px;
        }
        
        .carrito-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 25px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
            position: relative;
        }
        
        .carrito-link:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
        
        .badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #f44336;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .mensaje {
            background: #4caf50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
            animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .productos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 25px;
        }
        
        .producto-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.3s;
        }
        
        .producto-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .producto-imagen {
            font-size: 70px;
            margin-bottom: 15px;
        }
        
        .producto-nombre {
            color: #333;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .producto-precio {
            color: #667eea;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .btn-agregar {
            width: 100%;
            padding: 12px;
            background: #4caf50;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-agregar:hover {
            background: #45a049;
            transform: scale(1.05);
        }
        
        .info {
            background: white;
            padding: 20px;
            border-radius: 15px;
            margin-top: 30px;
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <h1>🛒 Tienda Online</h1>
        <a href="carrito_ver.php" class="carrito-link">
            🛍️ Ver Carrito
            <?php if ($total_items > 0): ?>
                <span class="badge"><?php echo $total_items; ?></span>
            <?php endif; ?>
        </a>
    </div>
    
    <div class="container">
        <?php if (isset($mensaje)): ?>
            <div class="mensaje"><?php echo $mensaje; ?></div>
        <?php endif; ?>
        
        <div class="productos-grid">
            <?php foreach ($productos as $id => $producto): ?>
                <div class="producto-card">
                    <div class="producto-imagen"><?php echo $producto['imagen']; ?></div>
                    <div class="producto-nombre"><?php echo $producto['nombre']; ?></div>
                    <div class="producto-precio">$<?php echo number_format($producto['precio'], 2); ?></div>
                    <form method="POST">
                        <input type="hidden" name="id_producto" value="<?php echo $id; ?>">
                        <button type="submit" name="agregar" class="btn-agregar">
                            ➕ Agregar al carrito
                        </button>
                    </form>
                </div>
            <?php endforeach; ?>
        </div>
        
        <div class="info">
            <strong>ℹ️ Ejercicio 4 - Carrito de Compras con Cookies</strong><br>
            Los productos que agregues se guardarán en cookies y permanecerán durante 7 días.
        </div>
    </div>
</body>
</html>
