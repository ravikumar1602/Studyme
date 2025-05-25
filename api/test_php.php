<?php
// Simple PHP test page
header('Content-Type: text/plain');
echo "PHP is working!\n";
echo "PHP Version: " . phpversion() . "\n";

// Test file writing
$testFile = __DIR__ . '/test_write.txt';
if (file_put_contents($testFile, 'test') !== false) {
    echo "File writing is working\n";
    unlink($testFile); // Clean up
} else {
    echo "File writing failed. Check permissions.\n";
}

// Test JSON encoding
$testData = ['test' => 'data'];
echo "JSON: " . json_encode($testData) . "\n";
?>
