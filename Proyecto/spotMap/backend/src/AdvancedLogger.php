<?php
/**
 * ⚠️ SPOTMAP - ADVANCED MONITORING & LOGGING SYSTEM
 * Copyright (c) 2025 Antonio Valero. Todos los derechos reservados.
 * PROHIBIDA SU COPIA, MODIFICACIÓN O DISTRIBUCIÓN SIN AUTORIZACIÓN.
 */

namespace SpotMap;

class AdvancedLogger {
    const LOG_DEBUG = 'DEBUG';
    const LOG_INFO = 'INFO';
    const LOG_WARNING = 'WARNING';
    const LOG_ERROR = 'ERROR';
    const LOG_CRITICAL = 'CRITICAL';
    const LOG_SECURITY = 'SECURITY';

    private static $instance = null;
    private $logFile;
    private $metricsFile;
    private $alertsFile;
    private $logLevel = self::LOG_DEBUG;
    private $enableFileLogging = true;
    private $enableDatabaseLogging = false;
    private $maxLogSize = 10485760; // 10MB
    private $maxLogFiles = 10;
    private $sensitivePatterns = [
        '/password\s*=\s*[^\s]+/i',
        '/apikey\s*=\s*[^\s]+/i',
        '/token\s*=\s*[^\s]+/i',
        '/authorization\s*:\s*[^\s]+/i',
        '/credit.?card|cvv|ssn/i',
        '/"password":"[^"]*"/i'
    ];

    /**
     * Singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $logDir = dirname(__DIR__) . '/logs';
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $this->logFile = $logDir . '/application.log';
        $this->metricsFile = $logDir . '/metrics.json';
        $this->alertsFile = $logDir . '/alerts.log';
        
        // Set log level from env
        $this->logLevel = getenv('LOG_LEVEL') ?: self::LOG_INFO;
        $this->enableDatabaseLogging = getenv('LOG_TO_DATABASE') === 'true';
    }

    /**
     * Log a message
     */
    public function log($level, $message, $context = []) {
        // Check if should log based on level
        if (!$this->shouldLog($level)) {
            return;
        }

        // Sanitize sensitive data
        $message = $this->sanitizeSensitiveData($message);
        $context = $this->sanitizeContext($context);

        // Create log entry
        $logEntry = $this->createLogEntry($level, $message, $context);

        // Write to file
        if ($this->enableFileLogging) {
            $this->writeToFile($this->logFile, $logEntry);
        }

        // Write to database
        if ($this->enableDatabaseLogging) {
            $this->writeToDatabaseAsync($logEntry);
        }

        // Check if should alert
        if ($this->shouldAlert($level, $context)) {
            $this->createAlert($level, $message, $context);
        }

        // Log to system error log
        if ($level === self::LOG_ERROR || $level === self::LOG_CRITICAL) {
            error_log(json_encode($logEntry));
        }
    }

    /**
     * Log with debug level
     */
    public function debug($message, $context = []) {
        $this->log(self::LOG_DEBUG, $message, $context);
    }

    /**
     * Log with info level
     */
    public function info($message, $context = []) {
        $this->log(self::LOG_INFO, $message, $context);
    }

    /**
     * Log with warning level
     */
    public function warning($message, $context = []) {
        $this->log(self::LOG_WARNING, $message, $context);
    }

    /**
     * Log with error level
     */
    public function error($message, $context = []) {
        $this->log(self::LOG_ERROR, $message, $context);
    }

    /**
     * Log with critical level
     */
    public function critical($message, $context = []) {
        $this->log(self::LOG_CRITICAL, $message, $context);
    }

    /**
     * Log security event
     */
    public function security($message, $context = []) {
        $context['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
        $context['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN';
        $this->log(self::LOG_SECURITY, $message, $context);
    }

    /**
     * Log API metrics
     */
    public function logMetric($endpoint, $method, $statusCode, $responseTime, $memoryUsage) {
        $metric = [
            'timestamp' => microtime(true),
            'endpoint' => $endpoint,
            'method' => $method,
            'status' => $statusCode,
            'response_time_ms' => round($responseTime * 1000, 2),
            'memory_mb' => round($memoryUsage / 1048576, 2),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN'
        ];

        $this->writeMetric($metric);
    }

    /**
     * Sanitize sensitive data from message
     */
    private function sanitizeSensitiveData(&$message) {
        foreach ($this->sensitivePatterns as $pattern) {
            $message = preg_replace($pattern, '[REDACTED]', $message);
        }
        return $message;
    }

    /**
     * Sanitize context array
     */
    private function sanitizeContext($context) {
        $sensitiveKeys = ['password', 'token', 'apikey', 'secret', 'key', 'authorization'];
        
        foreach ($context as $key => &$value) {
            if (in_array(strtolower($key), $sensitiveKeys)) {
                $value = '[REDACTED]';
            } elseif (is_string($value)) {
                $value = $this->sanitizeSensitiveData($value);
            }
        }

        return $context;
    }

    /**
     * Create log entry array
     */
    private function createLogEntry($level, $message, $context) {
        return [
            'timestamp' => date('Y-m-d H:i:s.') . substr((string)microtime(true), -4),
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'file' => $this->getCallerFile(),
            'line' => $this->getCallerLine(),
            'trace' => $this->getBacktrace(),
            'request_id' => $this->getRequestId(),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN',
            'user_id' => $_SESSION['user_id'] ?? null
        ];
    }

    /**
     * Write log to file
     */
    private function writeToFile($filePath, $logEntry) {
        // Check file size and rotate if needed
        if (file_exists($filePath) && filesize($filePath) > $this->maxLogSize) {
            $this->rotateLog($filePath);
        }

        // Write log entry as JSON
        $line = json_encode($logEntry) . PHP_EOL;
        
        if (!file_put_contents($filePath, $line, FILE_APPEND | LOCK_EX)) {
            error_log("Failed to write to log file: $filePath");
        }
    }

    /**
     * Rotate log files
     */
    private function rotateLog($filePath) {
        $dir = dirname($filePath);
        $basename = basename($filePath);
        
        // Remove oldest file if we've reached the limit
        for ($i = $this->maxLogFiles; $i >= 1; $i--) {
            $oldFile = "$dir/$basename.$i";
            if (file_exists($oldFile)) {
                if ($i === $this->maxLogFiles) {
                    unlink($oldFile);
                } else {
                    rename($oldFile, "$dir/$basename." . ($i + 1));
                }
            }
        }

        // Rotate current file
        rename($filePath, "$dir/$basename.1");
    }

    /**
     * Write metric to metrics file
     */
    private function writeMetric($metric) {
        // Check if metrics file exists and load existing metrics
        $metrics = [];
        if (file_exists($this->metricsFile)) {
            $content = file_get_contents($this->metricsFile);
            $metrics = json_decode($content, true) ?? [];
        }

        // Keep last 1000 metrics
        $metrics[] = $metric;
        if (count($metrics) > 1000) {
            array_shift($metrics);
        }

        // Write back
        file_put_contents($this->metricsFile, json_encode($metrics, JSON_PRETTY_PRINT), LOCK_EX);
    }

    /**
     * Create alert
     */
    private function createAlert($level, $message, $context) {
        $alert = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => $level,
            'message' => $message,
            'context' => $context
        ];

        $alertLine = json_encode($alert) . PHP_EOL;
        file_put_contents($this->alertsFile, $alertLine, FILE_APPEND | LOCK_EX);

        // Send email alert for critical issues
        if ($level === self::LOG_CRITICAL) {
            $this->sendEmailAlert($alert);
        }

        // Send webhook alert
        $this->sendWebhookAlert($alert);
    }

    /**
     * Send email alert
     */
    private function sendEmailAlert($alert) {
        $alertEmail = getenv('ALERT_EMAIL');
        if (!$alertEmail) return;

        $subject = "🚨 SpotMap Alert: {$alert['level']}";
        $body = "Critical Alert!\n\n";
        $body .= "Message: {$alert['message']}\n";
        $body .= "Time: {$alert['timestamp']}\n";
        $body .= "Context: " . json_encode($alert['context'], JSON_PRETTY_PRINT);

        $headers = "From: noreply@spotmap.local\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        mail($alertEmail, $subject, $body, $headers);
    }

    /**
     * Send webhook alert
     */
    private function sendWebhookAlert($alert) {
        $webhookUrl = getenv('ALERT_WEBHOOK_URL');
        if (!$webhookUrl) return;

        $payload = json_encode([
            'type' => 'spotmap_alert',
            'level' => $alert['level'],
            'message' => $alert['message'],
            'timestamp' => $alert['timestamp'],
            'details' => $alert['context']
        ]);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $webhookUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
        curl_close($ch);
    }

    /**
     * Write to database asynchronously
     */
    private function writeToDatabaseAsync($logEntry) {
        // This would be implemented with a background job queue
        // For now, we'll skip database logging in production
    }

    /**
     * Check if should log based on level
     */
    private function shouldLog($level) {
        $levels = [
            self::LOG_DEBUG => 0,
            self::LOG_INFO => 1,
            self::LOG_WARNING => 2,
            self::LOG_ERROR => 3,
            self::LOG_CRITICAL => 4,
            self::LOG_SECURITY => 4
        ];

        $currentLevel = $levels[$this->logLevel] ?? 1;
        $messageLevel = $levels[$level] ?? 1;

        return $messageLevel >= $currentLevel;
    }

    /**
     * Check if should create alert
     */
    private function shouldAlert($level, $context) {
        // Always alert on critical
        if ($level === self::LOG_CRITICAL || $level === self::LOG_SECURITY) {
            return true;
        }

        // Alert on errors from external services
        if ($level === self::LOG_ERROR && isset($context['external_service'])) {
            return true;
        }

        // Alert on suspicious activity
        if ($level === self::LOG_SECURITY) {
            return true;
        }

        return false;
    }

    /**
     * Get caller file
     */
    private function getCallerFile() {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 4);
        return $trace[3]['file'] ?? 'UNKNOWN';
    }

    /**
     * Get caller line
     */
    private function getCallerLine() {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 4);
        return $trace[3]['line'] ?? 0;
    }

    /**
     * Get backtrace for debugging
     */
    private function getBacktrace($limit = 3) {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, $limit + 2);
        $result = [];

        for ($i = 2; $i < count($trace) && $i < $limit + 2; $i++) {
            if (isset($trace[$i])) {
                $result[] = [
                    'file' => $trace[$i]['file'] ?? 'UNKNOWN',
                    'line' => $trace[$i]['line'] ?? 0,
                    'function' => $trace[$i]['function'] ?? 'UNKNOWN'
                ];
            }
        }

        return $result;
    }

    /**
     * Get request ID or generate one
     */
    private function getRequestId() {
        if (isset($_SERVER['HTTP_X_REQUEST_ID'])) {
            return $_SERVER['HTTP_X_REQUEST_ID'];
        }

        $requestId = uniqid('req_', true);
        $_SERVER['HTTP_X_REQUEST_ID'] = $requestId;
        return $requestId;
    }

    /**
     * Get logs for dashboard
     */
    public function getLogs($limit = 100, $level = null) {
        if (!file_exists($this->logFile)) {
            return [];
        }

        $lines = file($this->logFile, FILE_IGNORE_NEW_LINES);
        $logs = [];

        foreach (array_reverse($lines) as $line) {
            if (count($logs) >= $limit) break;
            
            $log = json_decode($line, true);
            if ($log === null) continue;

            if ($level && $log['level'] !== $level) continue;

            $logs[] = $log;
        }

        return array_reverse($logs);
    }

    /**
     * Get metrics summary
     */
    public function getMetricsSummary() {
        if (!file_exists($this->metricsFile)) {
            return [];
        }

        $content = file_get_contents($this->metricsFile);
        $metrics = json_decode($content, true) ?? [];

        if (empty($metrics)) {
            return [];
        }

        $summary = [
            'total_requests' => count($metrics),
            'avg_response_time_ms' => 0,
            'avg_memory_mb' => 0,
            'error_count' => 0,
            'status_codes' => []
        ];

        $totalTime = 0;
        $totalMemory = 0;

        foreach ($metrics as $metric) {
            $totalTime += $metric['response_time_ms'];
            $totalMemory += $metric['memory_mb'];

            if ($metric['status'] >= 400) {
                $summary['error_count']++;
            }

            $code = $metric['status'];
            $summary['status_codes'][$code] = ($summary['status_codes'][$code] ?? 0) + 1;
        }

        $summary['avg_response_time_ms'] = round($totalTime / count($metrics), 2);
        $summary['avg_memory_mb'] = round($totalMemory / count($metrics), 2);

        return $summary;
    }

    /**
     * Get alerts
     */
    public function getAlerts($limit = 50) {
        if (!file_exists($this->alertsFile)) {
            return [];
        }

        $lines = file($this->alertsFile, FILE_IGNORE_NEW_LINES);
        $alerts = [];

        foreach (array_reverse($lines) as $line) {
            if (count($alerts) >= $limit) break;
            
            $alert = json_decode($line, true);
            if ($alert !== null) {
                $alerts[] = $alert;
            }
        }

        return array_reverse($alerts);
    }
}
