<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include storage configuration
require_once __DIR__ . '/../config/storage.php';

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Helper function to get request data
function getRequestData() {
    $json = file_get_contents('php://input');
    return json_decode($json, true) ?? [];
}

// Global storage instance
$storage = new JsonStorage(__DIR__ . '/../data/storage.json');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    
    // Remove 'api' from path parts
    if (isset($pathParts[0]) && $pathParts[0] === 'api') {
        array_shift($pathParts);
    }
    
    $resource = $pathParts[0] ?? '';
    $id = $pathParts[1] ?? null;
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // GET /api/videos/{id}
                $video = $storage->getVideo($id);
                if ($video) {
                    sendJsonResponse($video);
                } else {
                    sendJsonResponse(['error' => 'Video not found'], 404);
                }
            } else {
                // GET /api/videos
                $subject = $_GET['subject'] ?? null;
                $teacher = $_GET['teacher'] ?? null;
                $videos = $storage->getVideos($subject, $teacher);
                sendJsonResponse($videos);
            }
            break;
            
        case 'POST':
            // POST /api/videos
            $data = getRequestData();
            
            // Validate required fields
            $required = ['title', 'url', 'subject', 'teacher'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    sendJsonResponse(['error' => "Missing required field: $field"], 400);
                }
            }
            
            $video = $storage->addVideo($data);
            sendJsonResponse($video, 201);
            break;
            
        case 'PUT':
            // PUT /api/videos/{id}
            if (!$id) {
                sendJsonResponse(['error' => 'Video ID is required'], 400);
            }
            
            $data = getRequestData();
            $video = $storage->updateVideo($id, $data);
            
            if ($video) {
                sendJsonResponse($video);
            } else {
                sendJsonResponse(['error' => 'Video not found'], 404);
            }
            break;
            
        case 'DELETE':
            // DELETE /api/videos/{id}
            if (!$id) {
                sendJsonResponse(['error' => 'Video ID is required'], 400);
            }
            
            if ($storage->deleteVideo($id)) {
                sendJsonResponse(['success' => true]);
            } else {
                sendJsonResponse(['error' => 'Video not found'], 404);
            }
            break;
            
        default:
            sendJsonResponse(['error' => 'Method not allowed'], 405);
    }
    
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Internal server error: ' . $e->getMessage()], 500);
}
