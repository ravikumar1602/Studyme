<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    // Include database configuration
    require_once __DIR__ . '/config/database.php';
    
    // Test database connection
    $pdo = getDBConnection();
    
    // Test if videos table exists
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='videos'")->fetchAll();
    
    if (count($tables) === 0) {
        throw new Exception("Videos table does not exist");
    }
    
    // Get all videos
    $stmt = $pdo->query("SELECT * FROM videos ORDER BY created_at DESC");
    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format response
    $response = [
        'success' => true,
        'data' => array_map(function($video) {
            return [
                'id' => $video['id'],
                'title' => $video['title'],
                'description' => $video['description'],
                'url' => $video['url'],
                'video_id' => $video['video_id'],
                'thumbnail' => $video['thumbnail'] ?? "https://img.youtube.com/vi/{$video['video_id']}/hqdefault.jpg",
                'subject' => $video['subject'],
                'teacher' => $video['teacher'],
                'duration' => $video['duration'],
                'views' => (int)$video['views'],
                'created_at' => $video['created_at']
            ];
        }, $videos)
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    // Error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
