<?php
/**
 * ⚠️ SPOTMAP - ERROR TRACKING & REPORTING
 * Copyright (c) 2025 Antonio Valero. Todos los derechos reservados.
 */

namespace SpotMap;

class ErrorTracker {
    private static $errors = [];
    private static $instance = null;
    private $logger;

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->logger = AdvancedLogger::getInstance();
        
        // Register error handler
        set_error_handler([$this, 'handleError']);
        
        // Register exception handler
        set_exception_handler([$this, 'handleException']);
        
        // Register fatal error handler
        register_shutdown_function([$this, 'handleFatalError']);
    }

    /**
     * Handle errors
     */
    public function handleError($errno, $errstr, $errfile, $errline) {
        $errorType = $this->getErrorType($errno);
        
        $context = [
            'file' => $errfile,
            'line' => $errline,
            'errno' => $errno,
            'type' => $errorType
        ];

        // Log based on severity
        if ($errno === E_ERROR || $errno === E_PARSE) {
            $this->logger->critical($errstr, $context);
        } elseif ($errno === E_WARNING || $errno === E_USER_ERROR) {
            $this->logger->error($errstr, $context);
        } elseif ($errno === E_NOTICE || $errno === E_USER_WARNING) {
            $this->logger->warning($errstr, $context);
        } else {
            $this->logger->debug($errstr, $context);
        }

        // Store error
        self::$errors[] = [
            'type' => $errorType,
            'message' => $errstr,
            'file' => $errfile,
            'line' => $errline,
            'timestamp' => time()
        ];

        return true; // Don't use PHP's default error handler
    }

    /**
     * Handle exceptions
     */
    public function handleException(\Throwable $e) {
        $context = [
            'exception' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ];

        $this->logger->error($e->getMessage(), $context);

        // Store error
        self::$errors[] = [
            'type' => 'Exception',
            'message' => $e->getMessage(),
            'class' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'timestamp' => time()
        ];

        // Send error response
        http_response_code(500);
        echo json_encode([
            'error' => 'Internal Server Error',
            'code' => 500,
            'message' => getenv('APP_DEBUG') === 'true' ? $e->getMessage() : null
        ]);
    }

    /**
     * Handle fatal errors
     */
    public function handleFatalError() {
        $error = error_get_last();
        
        if ($error === null) {
            return;
        }

        if ($error['type'] === E_FATAL_ERROR || $error['type'] === E_PARSE) {
            $this->handleError(
                $error['type'],
                $error['message'],
                $error['file'],
                $error['line']
            );
        }
    }

    /**
     * Get error type name
     */
    private function getErrorType($errno) {
        $types = [
            E_ERROR => 'Error',
            E_WARNING => 'Warning',
            E_PARSE => 'Parse Error',
            E_NOTICE => 'Notice',
            E_CORE_ERROR => 'Core Error',
            E_CORE_WARNING => 'Core Warning',
            E_COMPILE_ERROR => 'Compile Error',
            E_COMPILE_WARNING => 'Compile Warning',
            E_USER_ERROR => 'User Error',
            E_USER_WARNING => 'User Warning',
            E_USER_NOTICE => 'User Notice',
            E_STRICT => 'Strict',
            E_RECOVERABLE_ERROR => 'Recoverable Error',
            E_DEPRECATED => 'Deprecated',
            E_USER_DEPRECATED => 'User Deprecated'
        ];

        return $types[$errno] ?? 'Unknown Error';
    }

    /**
     * Report error to external service
     */
    public static function reportError($error, $context = []) {
        $errorService = getenv('ERROR_TRACKING_SERVICE');
        if (!$errorService) {
            return;
        }

        $payload = [
            'timestamp' => date('Y-m-d H:i:s'),
            'environment' => getenv('APP_ENV') ?: 'production',
            'error' => $error,
            'context' => $context,
            'request' => [
                'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
                'path' => $_SERVER['REQUEST_URI'] ?? 'UNKNOWN',
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN'
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $errorService);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
        curl_close($ch);
    }

    /**
     * Get all errors
     */
    public static function getErrors() {
        return self::$errors;
    }

    /**
     * Clear errors
     */
    public static function clearErrors() {
        self::$errors = [];
    }
}

// Auto-initialize
ErrorTracker::getInstance();
