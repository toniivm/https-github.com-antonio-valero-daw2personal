<?php
$_POST_TEST = print_r($_POST, true);
$_GET_TEST = print_r($_GET, true);
$_REQUEST_TEST = print_r($_REQUEST, true);

$headers = print_r(getallheaders(), true);

echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'NOT SET',
    'content_length' => $_SERVER['CONTENT_LENGTH'] ?? 'NOT SET',
    'post_data' => $_POST,
    'get_data' => $_GET,
    'request_data' => $_REQUEST,
    'headers' => getallheaders(),
    'raw_via_file' => @file_get_contents('php://input'),
], JSON_PRETTY_PRINT);
?>
