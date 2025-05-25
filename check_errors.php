<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to get the last PHP error
function getLastError() {
    $error = error_get_last();
    if ($error) {
        return $error;
    }
    return ['message' => 'No PHP errors found', 'type' => 0, 'file' => '', 'line' => 0];
}

// Test database connection
try {
    require_once __DIR__ . '/config/database.php';
    
    echo "<h1>PHP Error Check</h1>";
    
    // Test if SQLite3 class exists
    if (!class_exists('SQLite3')) {
        throw new Exception('SQLite3 extension is not available');
    }
    
    // Try to connect to the database
    $dbFile = __DIR__ . '/database/study_portal.db';
    
    if (!file_exists(dirname($dbFile))) {
        mkdir(dirname($dbFile), 0777, true);
    }
    
    $db = new SQLite3($dbFile);
    
    if (!$db) {
        throw new Exception('Failed to open database: ' . SQLite3::lastErrorMsg());
    }
    
    echo "<p style='color: green;'>✓ Successfully connected to SQLite database</p>";
    
    // Test if tables exist
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
    $tableList = [];
    
    while ($table = $tables->fetchArray(SQLITE3_ASSOC)) {
        $tableList[] = $table['name'];
    }
    
    echo "<h2>Tables in database:</h2>";
    if (count($tableList) > 0) {
        echo "<ul>";
        foreach ($tableList as $table) {
            echo "<li>$table</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No tables found in the database.</p>";
    }
    
    // Test API endpoint directly
    echo "<h2>Testing API Endpoint</h2>";
    
    ob_start();
    require __DIR__ . '/api/videos.php';
    $output = ob_get_clean();
    
    echo "<h3>API Output:</h3>";
    echo "<pre>" . htmlspecialchars($output) . "</pre>";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>";
    echo "<p style='color: red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<h3>Stack Trace:</h3>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

// Show PHP info
if (isset($_GET['phpinfo'])) {
    phpinfo();
} else {
    echo "<p><a href='?phpinfo=1'>Show PHP Info</a></p>";
}
?>
