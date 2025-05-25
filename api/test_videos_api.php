<?php
// Test script for videos API

// Test GET all videos
echo "Testing GET /api/videos.php\n";
$response = file_get_contents('http://localhost/TestBook/Study/api/videos.php');
$data = json_decode($response, true);

echo "Response: " . print_r($data, true) . "\n\n";

// Test POST a new video
echo "Testing POST /api/videos.php\n";
$postData = [
    'title' => 'Test Video ' . time(),
    'description' => 'This is a test video',
    'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'subject' => 'history'
];

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-type: application/json\r\n",
        'content' => json_encode($postData)
    ]
]);

$response = file_get_contents('http://localhost/TestBook/Study/api/videos.php', false, $context);
$data = json_decode($response, true);

echo "Response: " . print_r($data, true) . "\n\n";

// Test GET the newly created video
if (isset($data['data']['id'])) {
    $videoId = $data['data']['id'];
    echo "Testing GET /api/videos.php?id=$videoId\n";
    $response = file_get_contents("http://localhost/TestBook/Study/api/videos.php?id=$videoId");
    $data = json_decode($response, true);
    echo "Response: " . print_r($data, true) . "\n\n";
}

// List all videos again
echo "Listing all videos again:\n";
$response = file_get_contents('http://localhost/TestBook/Study/api/videos.php');
$data = json_decode($response, true);
echo "Response: " . print_r($data, true) . "\n\n";

echo "API tests completed.\n";
?>
