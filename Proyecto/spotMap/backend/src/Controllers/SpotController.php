<?php
namespace SpotMap\Controllers;

use SpotMap\DatabaseAdapter;
use SpotMap\ApiResponse;
use SpotMap\Validator;

class SpotController
{
    /**
     * GET /spots - Listar todos los spots con paginación
     */
    public function index(): void
    {
        try {
            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(100, (int)($_GET['limit'] ?? 50));
            $offset = ($page - 1) * $limit;

            // Usar DatabaseAdapter (funciona con Supabase o MySQL)
            $result = DatabaseAdapter::getAllSpots($limit, $offset);
            
            if (isset($result['error'])) {
                ApiResponse::error($result['error'], 500);
                return;
            }

            $spots = $result['spots'] ?? [];
            $total = $result['total'] ?? count($spots);

            // Procesar tags JSON si es string
            array_walk($spots, function(&$spot) {
                if (isset($spot['tags']) && is_string($spot['tags'])) {
                    $spot['tags'] = json_decode($spot['tags']) ?: [];
                } else if (!isset($spot['tags'])) {
                    $spot['tags'] = [];
                }
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
            
            $input = null;
        
            if (strpos($contentType, 'multipart/form-data') !== false) {
                $input = $_POST;
            } else {
                $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            }

            if (!is_array($input)) {
                ApiResponse::error('Invalid request data', 400);
                return;
            }
        
            // Parsear JSON fields si es necesario
            if (isset($input['tags']) && is_string($input['tags'])) {
                $tags = json_decode($input['tags'], true);
                $input['tags'] = is_array($tags) ? $tags : [];
            }

            // Validar
            $validator = new Validator();
            $validator->required($input['title'] ?? '', 'title');
            $validator->required($input['lat'] ?? '', 'lat');
            $validator->required($input['lng'] ?? '', 'lng');
            $validator->string($input['title'] ?? '', 'title', 1, 255);
            $validator->numeric($input['lat'] ?? '', 'lat');
            $validator->numeric($input['lng'] ?? '', 'lng');

            if (isset($input['lat']) && is_numeric($input['lat'])) {
                $validator->latitude($input['lat'], 'lat');
            }
            if (isset($input['lng']) && is_numeric($input['lng'])) {
                $validator->longitude($input['lng'], 'lng');
            }

            if ($validator->fails()) {
                ApiResponse::validation($validator->errors());
                return;
            }

            // Preparar datos
            $spotData = [
                'title' => trim($input['title']),
                'description' => trim($input['description'] ?? ''),
                'lat' => (float)$input['lat'],
                'lng' => (float)$input['lng'],
                'category' => isset($input['category']) ? trim($input['category']) : null,
                'tags' => isset($input['tags']) && is_array($input['tags']) ? $input['tags'] : []
            ];

            // Manejar foto si está presente
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $photo = $_FILES['photo'];
                
                // Validaciones
                $maxSize = 5 * 1024 * 1024; // 5MB
                $validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                
                if ($photo['size'] > $maxSize) {
                    ApiResponse::validation(['photo' => ['Photo cannot exceed 5MB']]);
                    return;
                }
                
                if (!in_array($photo['type'], $validTypes)) {
                    ApiResponse::validation(['photo' => ['Invalid photo format']]);
                    return;
                }
                
                // Guardar archivo
                $uploadDir = __DIR__ . '/../../public/uploads/spots/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                $ext = pathinfo($photo['name'], PATHINFO_EXTENSION);
                $filename = uniqid('spot_') . '.' . $ext;
                $uploadPath = $uploadDir . $filename;
                
                if (move_uploaded_file($photo['tmp_name'], $uploadPath)) {
                    $spotData['image_path'] = '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/backend/public/uploads/spots/' . $filename;
                }
            }

            // Crear spot usando DatabaseAdapter
            $result = DatabaseAdapter::createSpot($spotData);

            if (isset($result['error'])) {
                ApiResponse::error($result['error'], 500);
                return;
            }

            ApiResponse::success($result, 'Spot created successfully', 201);

        } catch (\Exception $e) {
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
                return;
            }

            $result = DatabaseAdapter::getSpotById($id);

            if (isset($result['error'])) {
                ApiResponse::notFound('Spot not found');
                return;
            }

            // Procesar tags
            if (isset($result['tags']) && is_string($result['tags'])) {
                $result['tags'] = json_decode($result['tags']) ?: [];
            }
            
            ApiResponse::success($result);

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
                return;
            }

            // Obtener spot para eliminar foto
            $spot = DatabaseAdapter::getSpotById($id);

            if (isset($spot['error'])) {
                ApiResponse::notFound('Spot not found');
                return;
            }

            // Eliminar archivo de imagen si existe
            if (isset($spot['image_path']) && $spot['image_path']) {
                $filePath = __DIR__ . '/../../public' . $spot['image_path'];
                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
            }

            // Eliminar de la base de datos
            $result = DatabaseAdapter::deleteSpot($id);

            if (isset($result['error'])) {
                ApiResponse::error($result['error'], 500);
                return;
            }

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
                return;
            }

            // Verificar que el spot existe
            $spot = DatabaseAdapter::getSpotById($id);
            if (isset($spot['error'])) {
                ApiResponse::notFound('Spot not found');
                return;
            }

            // Validar que hay archivo
            if (!isset($_FILES['photo'])) {
                ApiResponse::error('No file uploaded', 400);
                return;
            }

            $file = $_FILES['photo'];

            // Validar
            $validator = new Validator();
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $validator->mimeType($file, 'photo', $allowedMimes);
            $validator->fileSize($file, 'photo', 5 * 1024 * 1024);

            if ($validator->fails()) {
                ApiResponse::validation($validator->errors());
                return;
            }

            if ($file['error'] !== UPLOAD_ERR_OK) {
                ApiResponse::error('Upload error: ' . $file['error'], 400);
                return;
            }

            // Guardar archivo
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $filename = 'spot_' . $id . '_' . time() . '.' . $ext;
            $uploadDir = __DIR__ . '/../../public/uploads/spots/';

            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) {
                    ApiResponse::error('Failed to create upload directory', 500);
                    return;
                }
            }

            $filepath = $uploadDir . $filename;
            $relativePath = '/uploads/spots/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                ApiResponse::error('Failed to save file', 500);
                return;
            }

            // Eliminar archivo anterior si existe
            if (isset($spot['image_path']) && $spot['image_path']) {
                $oldPath = __DIR__ . '/../../public' . $spot['image_path'];
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Actualizar base de datos
            $result = DatabaseAdapter::updateSpot($id, ['image_path' => $relativePath]);

            if (isset($result['error'])) {
                ApiResponse::error($result['error'], 500);
                return;
            }

            ApiResponse::success($result, 'Photo uploaded successfully', 200);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }
}