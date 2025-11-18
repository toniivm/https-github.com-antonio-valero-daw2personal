<?php
use PHPUnit\Framework\TestCase;
require_once __DIR__ . '/../src/Security.php';

class SecurityHeadersTest extends TestCase
{
    public function testSecurityHeadersSet()
    {
        SpotMap\Security::setSecurityHeaders();
        $this->assertTrue(headers_list() !== []); // Simple sanity
    }
}
