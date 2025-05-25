<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include storage configuration
require_once __DIR__ . '/../config/storage.php';

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Create storage instance
    $storage = new JsonStorage(__DIR__ . '/../data/storage.json');
    
    // Only allow GET requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendJsonResponse(['error' => 'Method not allowed'], 405);
    }
    
    // Get all subjects
    $subjects = $storage->getSubjects();
    
    // Return subjects
    sendJsonResponse($subjects);
    
} catch (Exception $e) {
    error_log('Subjects API Error: ' . $e->getMessage());
    sendJsonResponse(['error' => 'Internal server error: ' . $e->getMessage()], 500);
}
