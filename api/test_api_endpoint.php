<?php
// Test script to verify API endpoint functionality

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test data directory
$dataDir = __DIR__ . '/data';
$dbFile = $dataDir . '/videos.json';

// Test 1: Check if data directory exists and is writable
echo "=== Test 1: Data Directory Check ===\n";
if (!is_dir($dataDir)) {
    echo "- Data directory does not exist. Attempting to create...\n";
    if (!mkdir($dataDir, 0777, true)) {
        die("Failed to create data directory. Please check permissions.\n");
    }
    echo "✓ Data directory created successfully.\n";
} else {
    echo "✓ Data directory exists.\n";
}

// Test 2: Check if directory is writable
if (!is_writable($dataDir)) {
    die("✗ Data directory is not writable. Please check permissions.\n");
}
echo "✓ Data directory is writable.\n";

// Test 3: Check if videos.json exists and is writable
if (!file_exists($dbFile)) {
    echo "- Database file does not exist. Creating...\n";
    $initialData = ['videos' => []];
    if (file_put_contents($dbFile, json_encode($initialData, JSON_PRETTY_PRINT)) === false) {
        die("✗ Failed to create database file.\n");
    }
    echo "✓ Database file created successfully.\n";
} else {
    echo "✓ Database file exists.\n";
}

if (!is_writable($dbFile)) {
    die("✗ Database file is not writable. Please check permissions.\n");
}
echo "✓ Database file is writable.\n";

// Test 4: Test reading from the database
echo "\n=== Test 2: Database Read Test ===\n";
$content = file_get_contents($dbFile);
if ($content === false) {
    die("✗ Failed to read database file.\n");
}
$data = json_decode($content, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die("✗ Invalid JSON in database file: " . json_last_error_msg() . "\n");
}
echo "✓ Successfully read database file. Found " . count($data['videos'] ?? []) . " videos.\n";

// Test 5: Test writing to the database
echo "\n=== Test 3: Database Write Test ===\n";
$testData = [
    'videos' => [
        [
            'id' => 'test_' . time(),
            'title' => 'Test Video',
            'description' => 'This is a test video',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'subject' => 'test',
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]
];

if (file_put_contents($dbFile, json_encode($testData, JSON_PRETTY_PRINT)) === false) {
    die("✗ Failed to write to database file.\n");
}
echo "✓ Successfully wrote to database file.\n";

// Test 6: Verify the write operation
$content = file_get_contents($dbFile);
if ($content === false) {
    die("✗ Failed to verify database write.\n");
}
$data = json_decode($content, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die("✗ Invalid JSON after write: " . json_last_error_msg() . "\n");
}
echo "✓ Verified database write operation. Found " . count($data['videos'] ?? []) . " videos.\n";

// Test 7: Test including the videos.php file
echo "\n=== Test 4: API Include Test ===\n";
ob_start();
include 'videos.php';
$output = ob_get_clean();

if (!empty($output)) {
    echo "✓ API file included successfully. Output: " . substr($output, 0, 200) . "...\n";
} else {
    echo "✗ No output from API file. Check for PHP errors.\n";
}

echo "\n=== All Tests Completed ===\n";
echo "Please check the following files for errors:\n";
echo "- " . __DIR__ . "/api_errors.log\n";
echo "- " . __DIR__ . "/api_debug.log\n";

// Clean up test data
file_put_contents($dbFile, json_encode(['videos' => []], JSON_PRETTY_PRINT));
?>
