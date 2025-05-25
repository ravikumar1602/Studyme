<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

// Set content type
header('Content-Type: application/json; charset=utf-8');

// Database configuration
$dataDir = __DIR__ . '/data';
$dbFile = $dataDir . '/teachers.json';

// Create data directory if it doesn't exist
if (!file_exists($dataDir)) {
    if (!mkdir($dataDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create data directory']);
        exit();
    }
}

// Initialize database if it doesn't exist
if (!file_exists($dbFile)) {
    file_put_contents($dbFile, json_encode(['teachers' => []], JSON_PRETTY_PRINT));
}

// Helper function to read teachers from the database
function readTeachers() {
    global $dbFile;
    
    if (!file_exists($dbFile)) {
        return ['teachers' => []];
    }
    
    $content = file_get_contents($dbFile);
    return json_decode($content, true) ?: ['teachers' => []];
}

// Helper function to save teachers to the database
function saveTeachers($data) {
    global $dbFile;
    
    // Ensure the data has the correct structure
    if (!isset($data['teachers'])) {
        $data = ['teachers' => $data];
    }
    
    return file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT)) !== false;
}

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request data
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?: [];
$id = $_GET['id'] ?? $input['id'] ?? null;
$action = $input['action'] ?? '';

$response = [
    'success' => false, 
    'message' => 'Invalid request',
    'method' => $method,
    'action' => $action,
    'id' => $id,
    'input' => $input
];

try {
    $data = readTeachers();
    
    switch ($method) {
        case 'GET':
            // Get all teachers or a specific teacher by ID
            if ($id) {
                $teacher = array_filter($data['teachers'], function($t) use ($id) {
                    return $t['id'] === $id;
                });
                
                if (empty($teacher)) {
                    http_response_code(404);
                    $response = ['success' => false, 'message' => 'Teacher not found'];
                } else {
                    $response = ['success' => true, 'teacher' => reset($teacher)];
                }
            } else {
                $response = ['success' => true, 'teachers' => $data['teachers']];
            }
            break;
            
        case 'POST':
            // Handle different actions
            switch ($action) {
                case 'create':
                    // Add a new teacher
                    if (empty($input['name']) || empty($input['subject'])) {
                        http_response_code(400);
                        $response = ['success' => false, 'message' => 'Name and subject are required'];
                        break 2;
                    }
                    
                    $newTeacher = [
                        'id' => 'teacher_' . uniqid(),
                        'name' => $input['name'],
                        'email' => $input['email'] ?? '',
                        'subject' => $input['subject'],
                        'createdAt' => date('Y-m-d H:i:s')
                    ];
                    
                    $data['teachers'][] = $newTeacher;
                    
                    if (saveTeachers($data)) {
                        $response = ['success' => true, 'teacher' => $newTeacher];
                    } else {
                        throw new Exception('Failed to save teacher');
                    }
                    break;
                    
                case 'update':
                    // Update an existing teacher
                    if (!$id) {
                        http_response_code(400);
                        $response = ['success' => false, 'message' => 'Teacher ID is required'];
                        break 2;
                    }
                    
                    $found = false;
                    foreach ($data['teachers'] as &$teacher) {
                        if ($teacher['id'] === $id) {
                            $teacher['name'] = $input['name'] ?? $teacher['name'];
                            $teacher['email'] = $input['email'] ?? $teacher['email'];
                            $teacher['subject'] = $input['subject'] ?? $teacher['subject'];
                            $teacher['updatedAt'] = date('Y-m-d H:i:s');
                            $found = true;
                            
                            if (saveTeachers($data)) {
                                $response = ['success' => true, 'teacher' => $teacher];
                            } else {
                                throw new Exception('Failed to update teacher');
                            }
                            break;
                        }
                    }
                    
                    if (!$found) {
                        http_response_code(404);
                        $response = ['success' => false, 'message' => 'Teacher not found'];
                    }
                    break;
                    
                default:
                    http_response_code(400);
                    $response = ['success' => false, 'message' => 'Invalid action'];
                    break 2;
            }
            break;
            
        case 'PUT':
            // Redirect PUT to POST with action=update
            $input['action'] = 'update';
            $input['id'] = $input['id'] ?? $id;
            // Fall through to POST handler
            $_SERVER['REQUEST_METHOD'] = 'POST';
            $action = 'update';
            // No break, continue to POST handler
            
        case 'POST':
            
        case 'DELETE':
            // Delete a teacher
            if (!$id) {
                http_response_code(400);
                $response = ['success' => false, 'message' => 'Teacher ID is required'];
                break;
            }
            
            $initialCount = count($data['teachers']);
            $data['teachers'] = array_filter($data['teachers'], function($t) use ($id) {
                return $t['id'] !== $id;
            });
            
            if (count($data['teachers']) < $initialCount) {
                if (saveTeachers($data)) {
                    $response = ['success' => true];
                } else {
                    throw new Exception('Failed to delete teacher');
                }
            } else {
                http_response_code(404);
                $response = ['success' => false, 'message' => 'Teacher not found'];
            }
            break;
            
        default:
            http_response_code(405);
            $response = ['success' => false, 'message' => 'Method not allowed'];
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    $response = [
        'success' => false, 
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ];
}

// Send the response
echo json_encode($response);
?>
