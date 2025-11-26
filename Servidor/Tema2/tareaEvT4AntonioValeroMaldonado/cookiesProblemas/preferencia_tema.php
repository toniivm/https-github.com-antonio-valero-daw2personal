<?php
// Ejercicio 2: Tema claro/oscuro con cookies

// Cambiar tema
if (isset($_POST['tema'])) {
    $t = $_POST['tema'];
    setcookie('tema_preferido', $t, time() + 31536000, "/");
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Leer cookie
$tema = 'claro';
if(isset($_COOKIE['tema_preferido'])) {
    $tema = $_COOKIE['tema_preferido'];
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tema Claro/Oscuro</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 50px;
            text-align: center;
        }
        <?php if($tema == 'claro'): ?>
        body {
            background-color: #ffffff;
            color: #000000;
        }
        .caja {
            background: #f8f9fa;
            border: 2px solid #dee2e6;
        }
        button {
            background-color: #007bff;
            color: white;
        }
        <?php else: ?>
        body {
            background-color: #212529;
            color: #ffffff;
        }
        .caja {
            background: #343a40;
            border: 2px solid #495057;
        }
        button {
            background-color: #6c757d;
            color: white;
        }
        <?php endif; ?>
        
        .caja {
            max-width: 500px;
            margin: 0 auto;
            padding: 30px;
            border-radius: 8px;
        }
        h2 {
            margin-bottom: 20px;
        }
        .opciones {
            margin-top: 30px;
        }
        button {
            padding: 12px 25px;
            margin: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .activo {
            text-decoration: underline;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="caja">
        <h2>Preferencia de Tema</h2>
        <p>Tema activo: <span class="activo"><?php echo $tema; ?></span></p>
        
        <div class="opciones">
            <form method="POST" style="display: inline;">
                <input type="hidden" name="tema" value="claro">
                <button type="submit">Tema Claro</button>
            </form>
            
            <form method="POST" style="display: inline;">
                <input type="hidden" name="tema" value="oscuro">
                <button type="submit">Tema Oscuro</button>
            </form>
        </div>
        
        <p style="margin-top: 30px; font-size: 14px;">
            Tu preferencia se guarda en una cookie
        </p>
    </div>
</body>
</html>
