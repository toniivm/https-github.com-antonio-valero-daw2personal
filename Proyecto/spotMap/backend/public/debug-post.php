<?php
// Debug: Ver qué está recibiendo el backend cuando se crea un spot
header('Content-Type: application/json');

echo json_encode([
    'POST' => $_POST,
    'FILES' => array_map(function($file) {
        return [
            'name' => $file['name'] ?? null,
            'type' => $file['type'] ?? null,
            'size' => $file['size'] ?? null,
            'error' => $file['error'] ?? null,
            'tmp_name' => $file['tmp_name'] ?? null
        ];
    }, $_FILES),
    'CONTENT_TYPE' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'not set'
], JSON_PRETTY_PRINT);
