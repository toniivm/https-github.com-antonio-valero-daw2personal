<?php
require_once 'login.php';

// Conexión a la base de datos
$db_server = new mysqli($db_hostname, $db_username, $db_password, $db_database);
if ($db_server->connect_error) {
    die("No se puede conectar a MySQL: " . $db_server->connect_error);
}

// Si el formulario fue enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pokemon = [
        'id'       => $_POST['id'] ?? null,
        'tipo'     => $_POST['tipo'] ?? '',
        'familia'  => $_POST['familia'] ?? '',
        'nombre'   => $_POST['nombre'] ?? ''
    ];

    $query = "INSERT INTO pokemon (id, tipo, familia, nombre) VALUES (?, ?, ?, ?)";
    $stmt = $db_server->prepare($query);
    $stmt->bind_param("isss", $pokemon['id'], $pokemon['tipo'], $pokemon['familia'], $pokemon['nombre']);

    if ($stmt->execute()) {
        echo "<p>Registro insertado exitosamente.</p>";
    } else {
        echo "<p>Error al insertar el registro: " . $stmt->error . "</p>";
    }

    $stmt->close();
    $db_server->close();
} else {
    // Mostrar el formulario
    echo <<<HTML
    <form method="POST">
        <label>ID:</label><br>
        <input type="number" name="id" required><br>
        <label>Tipo:</label><br>
        <input type="text" name="tipo" required><br>
        <label>Familia:</label><br>
        <input type="text" name="familia" required><br>
        <label>Nombre:</label><br>
        <input type="text" name="nombre" required><br><br>
        <button type="submit">Insertar Pokémon</button>
    </form>
HTML;
}
?>
