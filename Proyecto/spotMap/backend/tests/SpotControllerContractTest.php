<?php

use PHPUnit\Framework\TestCase;
use SpotMap\Cache;
use SpotMap\DatabaseAdapter;
use SpotMap\Controllers\SpotController;

require_once __DIR__ . '/../src/DatabaseAdapter.php';
require_once __DIR__ . '/../src/Controllers/SpotController.php';

class FakeSupabaseClientForContract
{
    public function getAllSpots(int $limit = 100, int $offset = 0, array $filters = []): array
    {
        $spots = [
            [
                'id' => 101,
                'title' => 'Amanecer Sierra',
                'category' => 'naturaleza',
                'schedule' => 'sunrise',
                'difficulty' => 'easy',
                'season' => 'spring',
                'tags' => json_encode(['sunrise', 'spring', 'mountain']),
                'lat' => 40.1,
                'lng' => -3.1,
                'created_at' => '2026-03-01 08:00:00',
            ],
            [
                'id' => 102,
                'title' => 'Blue Hour Costa',
                'category' => 'naturaleza',
                'schedule' => 'blue_hour',
                'difficulty' => 'medium',
                'season' => 'summer',
                'tags' => json_encode(['blue_hour', 'sea']),
                'lat' => 41.1,
                'lng' => -2.1,
                'created_at' => '2026-03-01 07:00:00',
            ],
            [
                'id' => 103,
                'title' => 'Sunrise Urbano',
                'category' => 'urbano',
                'schedule' => 'sunrise',
                'difficulty' => 'hard',
                'season' => 'winter',
                'tags' => json_encode(['sunrise', 'city']),
                'lat' => 42.1,
                'lng' => -1.1,
                'created_at' => '2026-03-01 06:00:00',
            ],
        ];

        if (!empty($filters['category'])) {
            $spots = array_values(array_filter($spots, static fn($spot) => ($spot['category'] ?? null) === $filters['category']));
        }

        return array_slice($spots, $offset, $limit);
    }

    public function getPopularity(): array
    {
        return [];
    }
}

class SpotControllerContractTest extends TestCase
{
    protected function setUp(): void
    {
        Cache::flushPattern('spots_*');
        $this->setDatabaseAdapterStatic('useSupabase', true);
        $this->setDatabaseAdapterStatic('supabase', new FakeSupabaseClientForContract());
    }

    protected function tearDown(): void
    {
        Cache::flushPattern('spots_*');
        $this->setDatabaseAdapterStatic('useSupabase', null);
        $this->setDatabaseAdapterStatic('supabase', null);
        $_GET = [];
        $_SERVER = [];
    }

    public function testIndexResponseContractIncludesSpotsPaginationAndFilters(): void
    {
        $_GET = [
            'page' => '1',
            'limit' => '2',
            'category' => 'naturaleza',
            'fields' => 'id,title,category,schedule,difficulty,season,tags',
        ];

        $controller = new SpotController();
        ob_start();
        $controller->index();
        $json = ob_get_clean();

        $payload = json_decode($json, true);

        $this->assertIsArray($payload);
        $this->assertTrue($payload['success']);
        $this->assertArrayHasKey('data', $payload);
        $this->assertArrayHasKey('spots', $payload['data']);
        $this->assertArrayHasKey('pagination', $payload['data']);
        $this->assertArrayHasKey('filters', $payload['data']);

        $this->assertCount(2, $payload['data']['spots']);
        $this->assertSame(2, $payload['data']['pagination']['limit']);
        $this->assertSame(2, $payload['data']['pagination']['total']);
        $this->assertSame('naturaleza', $payload['data']['filters']['category']);
    }

    public function testIndexBestTimeAliasAppliesScheduleFilterAndStableTotals(): void
    {
        $_GET = [
            'page' => '1',
            'limit' => '1',
            'best_time' => 'sunrise',
            'fields' => 'id,title,schedule,difficulty,season,tags',
        ];

        $controller = new SpotController();
        ob_start();
        $controller->index();
        $json = ob_get_clean();

        $payload = json_decode($json, true);

        $this->assertTrue($payload['success']);
        $this->assertSame(1, $payload['data']['pagination']['limit']);
        $this->assertSame(2, $payload['data']['pagination']['total']);
        $this->assertEquals(2, $payload['data']['pagination']['pages']);
        $this->assertCount(1, $payload['data']['spots']);
        $this->assertSame('sunrise', $payload['data']['filters']['schedule']);
    }

    private function setDatabaseAdapterStatic(string $property, $value): void
    {
        $ref = new ReflectionClass(DatabaseAdapter::class);
        $prop = $ref->getProperty($property);
        $prop->setAccessible(true);
        $prop->setValue(null, $value);
    }
}
