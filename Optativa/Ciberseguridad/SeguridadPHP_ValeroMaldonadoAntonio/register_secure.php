<?php
// register_secure.php — VERSIÓN SEGURA con password_hash() y prepared statements
declare(strict_types=1);

$dsn = "mysql:host=localhost;dbname=practicas;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    exit('Error BD.');
}

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';
$email = trim($_POST['email'] ?? '');
$msg = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validación de campos vacíos
    if ($username === '' || $password === '') {
        $msg = "Rellena usuario y contraseña.";
    } 
    // SEGURIDAD: Validar longitud mínima de contraseña
    elseif (strlen($password) < 8) {
        $msg = "La contraseña debe tener al menos 8 caracteres.";
    } 
    // Validación adicional de complejidad (opcional pero recomendada)
    elseif (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/', $password)) {
        $msg = "La contraseña debe contener al menos una mayúscula, una minúscula y un número.";
    }
    else {
        try {
            // SEGURIDAD: Verificar si el usuario ya existe
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
            $stmt->execute(['username' => $username]);
            
            if ($stmt->fetch()) {
                $msg = "El nombre de usuario ya está registrado.";
            } else {
                // SEGURIDAD: Usar password_hash() con algoritmo seguro
                // PASSWORD_DEFAULT usa bcrypt actualmente (puede cambiar en futuras versiones de PHP)
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                
                // SEGURIDAD: Usar prepared statements para prevenir SQL injection
                $sql = "INSERT INTO users (username, password_hash, email) VALUES (:username, :password_hash, :email)";
                $stmt = $pdo->prepare($sql);
                
                $stmt->execute([
                    'username' => $username,
                    'password_hash' => $hashedPassword,
                    'email' => $email
                ]);
                
                $msg = "Usuario creado correctamente de forma segura.";
                
                // Limpiar el formulario tras registro exitoso
                $username = '';
                $email = '';
            }
        } catch (PDOException $e) {
            // No revelar detalles del error en producción
            $msg = "Error al crear usuario. Inténtalo de nuevo.";
            // En desarrollo, puedes usar: $msg = $e->getMessage();
        }
    }
}
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Seguro</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #28a745;
            margin-top: 0;
        }
        .message {
            padding: 10px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .message.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 14px;
        }
        input:focus {
            outline: none;
            border-color: #28a745;
        }
        button {
            width: 100%;
            padding: 12px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
        }
        button:hover {
            background-color: #218838;
        }
        .security-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #e7f3ff;
            border-left: 4px solid #2196F3;
            font-size: 13px;
        }
        .security-info h3 {
            margin-top: 0;
            color: #1976D2;
        }
        .security-info ul {
            margin: 10px 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Registro Seguro</h1>
        
        <?php if ($msg): ?>
            <div class="message <?= strpos($msg, 'correctamente') !== false ? 'success' : 'error' ?>">
                <?= htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') ?>
            </div>
        <?php endif; ?>
        
        <form method="post" action="">
            <label for="username">Usuario:</label>
            <input type="text" 
                   id="username" 
                   name="username" 
                   value="<?= htmlspecialchars($username, ENT_QUOTES, 'UTF-8') ?>" 
                   required 
                   minlength="3"
                   maxlength="50">
            
            <label for="password">Contraseña:</label>
            <input type="password" 
                   id="password" 
                   name="password" 
                   required 
                   minlength="8"
                   placeholder="Mínimo 8 caracteres">
            
            <label for="email">Email:</label>
            <input type="email" 
                   id="email" 
                   name="email" 
                   value="<?= htmlspecialchars($email, ENT_QUOTES, 'UTF-8') ?>"
                   placeholder="ejemplo@email.com">
            
            <button type="submit">Registrar Usuario</button>
        </form>
        
        <div class="security-info">
            <h3>🛡️ Medidas de Seguridad Implementadas:</h3>
            <ul>
                <li><strong>Password Hashing:</strong> Usa <code>password_hash()</code> con bcrypt</li>
                <li><strong>Prepared Statements:</strong> Previene SQL injection</li>
                <li><strong>Validación de contraseña:</strong> Mínimo 8 caracteres con complejidad</li>
                <li><strong>Validación de duplicados:</strong> Evita usuarios repetidos</li>
                <li><strong>Sanitización de salida:</strong> Usa <code>htmlspecialchars()</code></li>
            </ul>
        </div>
    </div>
</body>
</html>
