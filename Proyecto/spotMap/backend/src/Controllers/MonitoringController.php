<?php
/**
 * ⚠️ CÓDIGO PROPIETARIO - SPOTMAP ⚠️
 * Copyright (c) 2025 Antonio Valero
 * Endpoint para dashboard de monitoreo
 * Acceso: /admin/monitoring o /api/monitoring
 */
declare(strict_types=1);

namespace SpotMap\Controllers;

use SpotMap\Logger;
use SpotMap\ApiResponse;

class MonitoringController {
    private $logger;
    private $apiResponse;

    public function __construct() {
        $this->logger = Logger::getInstance();
        $this->apiResponse = new \SpotMap\ApiResponse();
    }

    /**
     * GET /api/monitoring/logs
     */
    public function getLogs() {
        // Require admin authentication
        if (!$this->isAdmin()) {
            return $this->apiResponse->error('Unauthorized', 403);
        }

        $limit = (int)($_GET['limit'] ?? 100);
        $level = $_GET['level'] ?? null;
        $logs = $this->logger->getLogs($limit, $level);

        return $this->apiResponse->success($logs);
    }

    /**
     * GET /api/monitoring/metrics
     */
    public function getMetrics() {
        if (!$this->isAdmin()) {
            return $this->apiResponse->error('Unauthorized', 403);
        }

        $metrics = $this->logger->getMetricsSummary();
        return $this->apiResponse->success($metrics);
    }

    /**
     * GET /api/monitoring/alerts
     */
    public function getAlerts() {
        if (!$this->isAdmin()) {
            return $this->apiResponse->error('Unauthorized', 403);
        }

        $limit = (int)($_GET['limit'] ?? 50);
        $alerts = $this->logger->getAlerts($limit);

        return $this->apiResponse->success($alerts);
    }

    /**
     * GET /api/monitoring/health
     */
    public function getHealth() {
        $health = [
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'uptime' => $this->getUptime(),
            'database' => $this->getDatabaseHealth(),
            'memory' => [
                'usage_mb' => round(memory_get_usage() / 1048576, 2),
                'peak_mb' => round(memory_get_peak_usage() / 1048576, 2),
                'limit_mb' => intval(ini_get('memory_limit'))
            ],
            'cpu' => [
                'load' => function_exists('sys_getloadavg') ? sys_getloadavg() : 'N/A',
                'count' => php_uname('s') === 'Linux' ? shell_exec('nproc') : 'N/A'
            ]
        ];

        return $this->apiResponse->success($health);
    }

    /**
     * Check database health
     */
    private function getDatabaseHealth() {
        try {
            $db = new \SpotMap\Database();
            $start = microtime(true);
            $db->query("SELECT 1");
            $time = (microtime(true) - $start) * 1000;

            return [
                'status' => 'connected',
                'response_time_ms' => round($time, 2)
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get server uptime
     */
    private function getUptime() {
        if (file_exists('/proc/uptime')) {
            $uptime = file_get_contents('/proc/uptime');
            list($seconds) = explode(' ', $uptime);
            return intval($seconds);
        }
        return 'N/A';
    }

    /**
     * Check if user is admin
     */
    private function isAdmin() {
        // Validate API key or session
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $adminToken = getenv('ADMIN_API_TOKEN');

        if (!$adminToken) {
            return false; // Admin token not configured
        }

        if (!$token || !str_starts_with($token, 'Bearer ')) {
            return false;
        }

        $token = substr($token, 7);
        return hash_equals($adminToken, $token);
    }
}

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$controller = new MonitoringController();

switch ($path) {
    case '/api/monitoring/logs':
        if ($method === 'GET') {
            echo json_encode($controller->getLogs());
        }
        break;

    case '/api/monitoring/metrics':
        if ($method === 'GET') {
            echo json_encode($controller->getMetrics());
        }
        break;

    case '/api/monitoring/alerts':
        if ($method === 'GET') {
            echo json_encode($controller->getAlerts());
        }
        break;

    case '/api/monitoring/health':
        if ($method === 'GET') {
            echo json_encode($controller->getHealth());
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
}
