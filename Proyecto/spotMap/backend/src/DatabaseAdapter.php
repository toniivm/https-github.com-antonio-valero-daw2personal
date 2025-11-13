<?php
namespace SpotMap;

/**
 * Detecta y usa automáticamente Supabase o MySQL
 */
class DatabaseAdapter
{
    private static $useSupabase = null;
    private static $supabase = null;

    public static function useSupabase(): bool
    {
        if (self::$useSupabase === null) {
            $url = Config::get('SUPABASE_URL');
            $key = Config::get('SUPABASE_KEY');
            self::$useSupabase = !empty($url) && !empty($key);
        }
        return self::$useSupabase;
    }

    public static function getClient()
    {
        if (self::useSupabase()) {
            if (self::$supabase === null) {
                self::$supabase = new SupabaseClient();
            }
            return self::$supabase;
        }
        return Database::pdo();
    }

    public static function getAllSpots(int $limit = 100, int $offset = 0): array
    {
        if (self::useSupabase()) {
            $spots = self::getClient()->getAllSpots($limit, $offset);
            $total = count($spots);
            
            // Parsear tags JSONB
            array_walk($spots, function(&$spot) {
                if (isset($spot['tags']) && is_string($spot['tags'])) {
                    $spot['tags'] = json_decode($spot['tags'], true) ?? [];
                }
            });
            
            return ['spots' => $spots, 'total' => $total];
        } else {
            $pdo = self::getClient();
            
            // Contar total
            $stmt = $pdo->query('SELECT COUNT(*) as total FROM spots');
            $total = (int)$stmt->fetch()['total'];
            
            // Obtener spots
            $stmt = $pdo->prepare('SELECT * FROM spots ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
            $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
            $stmt->execute();
            $spots = $stmt->fetchAll();
            
            array_walk($spots, function(&$spot) {
                $spot['tags'] = $spot['tags'] ? json_decode($spot['tags']) : [];
            });
            
            return ['spots' => $spots, 'total' => $total];
        }
    }

    public static function getSpotById(int $id): array
    {
        if (self::useSupabase()) {
            $spot = self::getClient()->getSpot($id);
            if (!$spot) {
                return ['error' => 'Not found'];
            }
            if (isset($spot['tags']) && is_string($spot['tags'])) {
                $spot['tags'] = json_decode($spot['tags'], true) ?? [];
            }
            return $spot;
        } else {
            $pdo = self::getClient();
            $stmt = $pdo->prepare('SELECT * FROM spots WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $spot = $stmt->fetch();
            if (!$spot) {
                return ['error' => 'Not found'];
            }
            $spot['tags'] = $spot['tags'] ? json_decode($spot['tags']) : [];
            return $spot;
        }
    }

    public static function createSpot(array $data): array
    {
        if (self::useSupabase()) {
            return self::getClient()->createSpot($data);
        } else {
            $pdo = self::getClient();
            $stmt = $pdo->prepare('
                INSERT INTO spots (title, description, lat, lng, tags, category, image_path)
                VALUES (:title, :desc, :lat, :lng, :tags, :cat, :image_path)
            ');
            $stmt->execute([
                ':title' => $data['title'],
                ':desc' => $data['description'] ?? null,
                ':lat' => $data['lat'],
                ':lng' => $data['lng'],
                ':tags' => isset($data['tags']) ? json_encode($data['tags']) : null,
                ':cat' => $data['category'] ?? null,
                ':image_path' => $data['image_path'] ?? null
            ]);
            $id = (int)$pdo->lastInsertId();
            return array_merge(['id' => $id], $data);
        }
    }

    public static function updateSpot(int $id, array $data): array
    {
        if (self::useSupabase()) {
            $result = self::getClient()->updateSpot($id, $data);
            if (!$result) {
                return ['error' => 'Update failed'];
            }
            return self::getSpotById($id);
        } else {
            $pdo = self::getClient();
            $stmt = $pdo->prepare('UPDATE spots SET image_path = :path, updated_at = NOW() WHERE id = :id');
            $success = $stmt->execute([':path' => $data['image_path'], ':id' => $id]);
            if (!$success) {
                return ['error' => 'Update failed'];
            }
            return self::getSpotById($id);
        }
    }

    public static function deleteSpot(int $id): array
    {
        if (self::useSupabase()) {
            $success = self::getClient()->deleteSpot($id);
            return $success ? ['success' => true] : ['error' => 'Delete failed'];
        } else {
            $pdo = self::getClient();
            $stmt = $pdo->prepare('DELETE FROM spots WHERE id = :id');
            $success = $stmt->execute([':id' => $id]);
            return $success ? ['success' => true] : ['error' => 'Delete failed'];
        }
    }
}
