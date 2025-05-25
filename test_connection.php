<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Connection Test</h1>";

try {
    // Test database connection
    require_once __DIR__ . '/config/database.php';
    $pdo = getDBConnection();
    
    echo "<p style='color: green;'>✓ Successfully connected to the database!</p>";
    
    // Test if videos table exists
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='videos'")->fetchAll();
    
    if (count($tables) > 0) {
        echo "<p style='color: green;'>✓ Videos table exists</p>";
        
        // Test selecting from videos table
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM videos");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "<p>Found $count videos in the database</p>";
    } else {
        echo "<p style='color: red;'>✗ Videos table does not exist</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
?>
