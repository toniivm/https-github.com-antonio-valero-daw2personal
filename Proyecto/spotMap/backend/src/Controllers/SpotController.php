<?php
namespace SpotMap\Controllers;

use SpotMap\Database;
use PDO;

class SpotController
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::pdo();
    }

    public function index(): void
    {
        $stmt = $this->pdo->query('SELECT * FROM spots ORDER BY created_at DESC LIMIT 1000');
        $rows = $stmt->fetchAll();
        array_walk($rows, fn(&$r) => $r['tags'] = $r['tags'] ? json_decode($r['tags']) : []);
        $this->json(200, $rows);
    }

    public function store(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) $this->json(400, ['error'=>'Invalid JSON']);

        // Aceptar tanto 'name'/'title', 'latitude'/'lat', 'longitude'/'lng'
        $title = $input['title'] ?? $input['name'] ?? '';
        $lat = $input['lat'] ?? $input['latitude'] ?? null;
        $lng = $input['lng'] ?? $input['longitude'] ?? null;
        $tags = isset($input['tags']) ? json_encode($input['tags']) : null;
        $category = $input['category'] ?? null;
        $description = $input['description'] ?? null;

        if (!$title || !$lat || !$lng) {
            $this->json(422, ['error'=>'title/name, lat/latitude and lng/longitude required']);
        }

        $stmt = $this->pdo->prepare('INSERT INTO spots (title, description, lat, lng, tags, category) VALUES (:title,:desc,:lat,:lng,:tags,:cat)');
        $stmt->execute([
            ':title'=>$title, 
            ':desc'=>$description, 
            ':lat'=>$lat, 
            ':lng'=>$lng, 
            ':tags'=>$tags, 
            ':cat'=>$category
        ]);

        $id = (int)$this->pdo->lastInsertId();

        $this->json(201, [
            'id'=>$id,
            'title'=>$title,
            'description'=>$description,
            'lat'=>(float)$lat,
            'lng'=>(float)$lng,
            'tags'=>$tags?json_decode($tags):[],
            'category'=>$category,
            'created_at'=>date('c')
        ]);
    }

    public function show(int $id): void
    {
        $stmt = $this->pdo->prepare('SELECT * FROM spots WHERE id=:id LIMIT 1');
        $stmt->execute([':id'=>$id]);
        $row = $stmt->fetch();
        if (!$row) $this->json(404,['error'=>'Spot not found']);
        $row['tags'] = $row['tags'] ? json_decode($row['tags']) : [];
        $this->json(200,$row);
    }

    public function destroy(int $id): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM spots WHERE id=:id');
        $stmt->execute([':id'=>$id]);
        $this->json(204,null);
    }

    private function json(int $status,$payload): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        if ($payload!==null) echo json_encode($payload);
        exit;
    }
}