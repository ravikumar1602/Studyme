<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Test data to return
$testData = [
    'success' => true,
    'data' => [
        [
            'id' => 'test_video_1',
            'title' => 'Test Video 1',
            'description' => 'This is a test video',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'subject' => 'history',
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]
];

echo json_encode($testData, JSON_PRETTY_PRINT);
?>
