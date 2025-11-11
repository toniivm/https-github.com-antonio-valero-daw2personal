<?php
namespace SpotMap\Controllers;

use SpotMap\Database;
use SpotMap\ApiResponse;
use SpotMap\Validator;
use PDO;

class SpotController
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::pdo();
    }

    /**
     * GET /spots - Listar todos los spots con paginación
     */
    public function index(): void
    {
        try {
            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(100, (int)($_GET['limit'] ?? 50));
            $offset = ($page - 1) * $limit;

            // Contar total
            $stmt = $this->pdo->query('SELECT COUNT(*) as total FROM spots');
            $total = $stmt->fetch()['total'];

            // Obtener spots con paginación
            $stmt = $this->pdo->prepare('
                SELECT * FROM spots 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset
            ');
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $spots = $stmt->fetchAll();

            // Procesar tags JSON
            array_walk($spots, function(&$spot) {
                $spot['tags'] = $spot['tags'] ? json_decode($spot['tags']) : [];
            });

            ApiResponse::success([
                'spots' => $spots,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * POST /spots - Crear nuevo spot con validación robusta
     * Soporta tanto JSON como FormData (para upload de fotos)
     */
    public function store(): void
    {
        try {
            // Obtener datos: JSON o FormData
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            // Debug log
            error_log('[DEBUG] Content-Type: ' . $contentType);
            $input = null;
        
            if (strpos($contentType, 'multipart/form-data') !== false) {
                // FormData (multipart)
                $input = $_POST;
            } else {
                // JSON o vacío (por defecto JSON)
                $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            }

            if (!is_array($input)) {
                ApiResponse::error('Invalid request data', 400);
                return;
            }
        
            // Parsear JSON fields si es necesario (para FormData con tags JSON)
            if (isset($input['tags']) && is_string($input['tags'])) {
                $tags = json_decode($input['tags'], true);
                $input['tags'] = is_array($tags) ? $tags : [];
            }
    // Crear validador
    $validator = new Validator();

            // Validar campos requeridos
            $validator->required($input['title'] ?? '', 'title');
            $validator->required($input['lat'] ?? '', 'lat');
            $validator->required($input['lng'] ?? '', 'lng');

            // Validar tipos y rangos
            $validator->string($input['title'] ?? '', 'title', 1, 255);
            $validator->numeric($input['lat'] ?? '', 'lat');
            $validator->numeric($input['lng'] ?? '', 'lng');

            if (isset($input['lat']) && is_numeric($input['lat'])) {
                $validator->latitude($input['lat'], 'lat');
            }
            if (isset($input['lng']) && is_numeric($input['lng'])) {
                $validator->longitude($input['lng'], 'lng');
            }

            // Si hay errores, responder con validación
            if ($validator->fails()) {
                error_log('[DEBUG] Validation errors: ' . json_encode($validator->errors()));
                ApiResponse::validation($validator->errors());
                return;
            }

            // Preparar datos
            $title = trim($input['title']);
            $description = trim($input['description'] ?? '');
            $lat = (float)$input['lat'];
            $lng = (float)$input['lng'];
            $category = $input['category'] ?? null;
            $category = $category ? trim($category) : null;
            
            // Parsear tags
            $tags = null;
            if (isset($input['tags'])) {
                if (is_string($input['tags'])) {
                    $tagsArray = json_decode($input['tags'], true);
                    if (is_array($tagsArray)) {
                        $tags = json_encode($tagsArray);
                    }
                } else if (is_array($input['tags'])) {
                    $tags = json_encode($input['tags']);
                }
            }

            // Manejar foto si está presente
            $imagePath = null;
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $photo = $_FILES['photo'];
                
                // Validaciones de foto
                $maxSize = 5 * 1024 * 1024; // 5MB
                $validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                
                if ($photo['size'] > $maxSize) {
                    ApiResponse::validation(['photo' => ['Photo cannot exceed 5MB']]);
                    return;
                }
                
                if (!in_array($photo['type'], $validTypes)) {
                    ApiResponse::validation(['photo' => ['Invalid photo format. Use: JPEG, PNG, WebP, GIF']]);
                    return;
                }
                
                // Crear directorio si no existe
                $uploadDir = __DIR__ . '/../../public/uploads/spots/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                // Generar nombre único para la foto
                $ext = pathinfo($photo['name'], PATHINFO_EXTENSION);
                $filename = uniqid('spot_') . '.' . $ext;
                $uploadPath = $uploadDir . $filename;
                
                // Mover archivo
                if (move_uploaded_file($photo['tmp_name'], $uploadPath)) {
                    $imagePath = '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/uploads/spots/' . $filename;
                } else {
                    ApiResponse::error('Failed to upload photo', 500);
                    return;
                }
            }

            // Insertar en BD
            $stmt = $this->pdo->prepare('
                INSERT INTO spots (title, description, lat, lng, tags, category, image_path)
                VALUES (:title, :desc, :lat, :lng, :tags, :cat, :image_path)
            ');
            
            $result = $stmt->execute([
                ':title' => $title,
                ':desc' => $description ?: null,
                ':lat' => $lat,
                ':lng' => $lng,
                ':tags' => $tags,
                ':cat' => $category,
                ':image_path' => $imagePath
            ]);

            if (!$result) {
                error_log('[DEBUG] Insert failed');
                ApiResponse::error('Failed to create spot', 500);
                return;
            }

            $id = (int)$this->pdo->lastInsertId();

            error_log('[DEBUG] Spot created with ID: ' . $id);

            ApiResponse::success([
                'id' => $id,
                'title' => $title,
                'description' => $description ?: null,
                'lat' => $lat,
                'lng' => $lng,
                'tags' => $tags ? json_decode($tags) : [],
                'category' => $category,
                'image_path' => $imagePath,
                'created_at' => date('c'),
                'updated_at' => date('c')
            ], 'Spot created successfully', 201);

        } catch (\Exception $e) {
            error_log('[DEBUG] Exception: ' . $e->getMessage());
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * GET /spots/{id} - Obtener un spot específico
     */
    public function show(int $id): void
    {
        try {
            if ($id <= 0) {
                ApiResponse::error('Invalid ID', 400);
            }

            $stmt = $this->pdo->prepare('SELECT * FROM spots WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $spot = $stmt->fetch();

            if (!$spot) {
                ApiResponse::notFound('Spot not found');
            }

            $spot['tags'] = $spot['tags'] ? json_decode($spot['tags']) : [];
            
            ApiResponse::success($spot);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * DELETE /spots/{id} - Eliminar un spot y su foto asociada
     */
    public function destroy(int $id): void
    {
        try {
            if ($id <= 0) {
                ApiResponse::error('Invalid ID', 400);
            }

            // Verificar que existe y obtener ruta de imagen
            $stmt = $this->pdo->prepare('SELECT id, image_path FROM spots WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $spot = $stmt->fetch();

            if (!$spot) {
                ApiResponse::notFound('Spot not found');
            }

            // Eliminar archivo de imagen si existe
            if ($spot['image_path']) {
                $filePath = __DIR__ . '/../../public' . $spot['image_path'];
                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
            }

            // Eliminar de la base de datos
            $stmt = $this->pdo->prepare('DELETE FROM spots WHERE id = :id');
            $stmt->execute([':id' => $id]);

            ApiResponse::success(null, 'Spot deleted successfully', 204);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * POST /spots/{id}/photo - Subir foto a un spot con validación robusta
     */
    public function uploadPhoto(int $id): void
    {
        try {
            if ($id <= 0) {
                ApiResponse::error('Invalid ID', 400);
            }

            // Verificar que el spot existe
            $stmt = $this->pdo->prepare('SELECT id FROM spots WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            if (!$stmt->fetch()) {
                ApiResponse::notFound('Spot not found');
            }

            // Validar que hay archivo
            if (!isset($_FILES['photo'])) {
                ApiResponse::error('No file uploaded', 400);
            }

            $file = $_FILES['photo'];

            // Crear validador para archivo
            $validator = new Validator();
            
            // Validar MIME type
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $validator->mimeType($file, 'photo', $allowedMimes);
            
            // Validar tamaño (máx 5MB)
            $validator->fileSize($file, 'photo', 5 * 1024 * 1024);

            if ($validator->fails()) {
                ApiResponse::validation($validator->errors());
            }

            if ($file['error'] !== UPLOAD_ERR_OK) {
                ApiResponse::error('Upload error: ' . $file['error'], 400);
            }

            // Generar nombre seguro para archivo
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $filename = 'spot_' . $id . '_' . time() . '.' . $ext;
            $uploadDir = __DIR__ . '/../../public/uploads/spots/';

            // Crear directorio si no existe
            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) {
                    ApiResponse::error('Failed to create upload directory', 500);
                }
            }

            $filepath = $uploadDir . $filename;
            $relativePath = '/uploads/spots/' . $filename;

            // Guardar archivo
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                ApiResponse::error('Failed to save file', 500);
            }

            // Obtener ruta anterior (para limpiar si existe)
            $stmt = $this->pdo->prepare('SELECT image_path FROM spots WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $oldSpot = $stmt->fetch();
            
            // Eliminar archivo anterior si existe
            if ($oldSpot['image_path']) {
                $oldPath = __DIR__ . '/../../public' . $oldSpot['image_path'];
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Actualizar base de datos con nueva ruta
            $stmt = $this->pdo->prepare('UPDATE spots SET image_path = :path, updated_at = NOW() WHERE id = :id');
            $stmt->execute([':path' => $relativePath, ':id' => $id]);

            // Obtener y retornar spot actualizado
            $stmt = $this->pdo->prepare('SELECT * FROM spots WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $spot = $stmt->fetch();
            $spot['tags'] = $spot['tags'] ? json_decode($spot['tags']) : [];

            ApiResponse::success($spot, 'Photo uploaded successfully', 200);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }
}