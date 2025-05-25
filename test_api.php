<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test database connection
try {
    require_once __DIR__ . '/config/database.php';
    $db = getDBConnection();
    
    if ($db) {
        echo "<h1>Database Connection Test</h1>";
        echo "<p style='color: green;'>✓ Successfully connected to the database!</p>";
        
        // Test if tables exist
        $tables = ['videos', 'teachers', 'subjects'];
        foreach ($tables as $table) {
            $result = $db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='$table'");
            if ($result) {
                echo "<p>✓ Table '$table' exists</p>";
            } else {
                echo "<p style='color: red;'>✗ Table '$table' does not exist</p>";
            }
        }
        
        // Test API endpoint
        echo "<h2>Testing API Endpoint</h2>";
        $apiUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/api/videos.php';
        
        // Test GET request
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => 'Content-type: application/json'
            ]
        ]);
        
        $response = @file_get_contents($apiUrl, false, $context);
        
        if ($response === false) {
            $error = error_get_last();
            throw new Exception("API request failed: " . $error['message']);
        }
        
        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON response from API: " . json_last_error_msg());
        }
        
        echo "<p>✓ API is responding</p>";
        echo "<h3>API Response:</h3>";
        echo "<pre>" . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT)) . "</pre>";
        
    } else {
        throw new Exception("Failed to connect to database");
    }
    
} catch (Exception $e) {
    echo "<h1>Error</h1>";
    echo "<p style='color: red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    
    // Show PHP info for debugging
    if (isset($_GET['phpinfo'])) {
        phpinfo();
    } else {
        echo "<p><a href='?phpinfo=1'>Show PHP Info</a></p>";
    }
}
