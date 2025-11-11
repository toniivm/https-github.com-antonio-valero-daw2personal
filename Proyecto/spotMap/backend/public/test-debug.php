<?php
// Debug POST request
error_log('[API-DEBUG] Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('[API-DEBUG] Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'NOT SET'));
error_log('[API-DEBUG] POST data: ' . json_encode($_POST));
error_log('[API-DEBUG] Raw input: ' . file_get_contents('php://input'));

$input = json_decode(file_get_contents('php://input'), true);
error_log('[API-DEBUG] Decoded input: ' . json_encode($input));

header('Content-Type: application/json');
echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'NOT SET',
    'post_data' => $_POST,
    'decoded_input' => $input
]);
?>
