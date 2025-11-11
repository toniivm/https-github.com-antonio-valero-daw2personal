<?php
namespace SpotMap;

/**
 * Clase para respuestas estándar de la API
 * Compatible con REST estándar y fácil de migrar a Laravel
 */
class ApiResponse
{
    public static function success($data = null, $message = 'Success', $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'status' => $statusCode,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ]);
        exit;
    }

    public static function error($message = 'Error', $statusCode = 400, $errors = null)
    {
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'status' => $statusCode,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('c')
        ]);
        exit;
    }

    public static function notFound($message = 'Resource not found')
    {
        self::error($message, 404);
    }

    public static function unauthorized($message = 'Unauthorized')
    {
        self::error($message, 401);
    }

    public static function validation($errors = [])
    {
        self::error('Validation failed', 422, $errors);
    }

    public static function serverError($message = 'Internal server error')
    {
        self::error($message, 500);
    }
}
