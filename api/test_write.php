<?php
// Test script to check file writing permissions
$dataDir = __DIR__ . '/data';
$dbFile = $dataDir . '/videos.json';

// Test if we can write to the data directory
$testFile = $dataDir . '/test_write.txt';
if (file_put_contents($testFile, 'test') === false) {
    die("Failed to write to $testFile. Check directory permissions.\n");
} else {
    echo "Successfully wrote to $testFile\n";
    unlink($testFile); // Clean up
}

// Test if we can write to the videos.json file
$testData = ['videos' => []];
if (file_put_contents($dbFile, json_encode($testData, JSON_PRETTY_PRINT)) === false) {
    die("Failed to write to $dbFile. Check file permissions.\n");
} else {
    echo "Successfully wrote to $dbFile\n";
}

echo "All write tests passed successfully!\n";
?>
