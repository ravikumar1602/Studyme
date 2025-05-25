<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>PHP Environment Test</h1>";

// Check if SQLite3 is available
echo "<h2>SQLite3 Extension</h2>";
if (extension_loaded('sqlite3')) {
    echo "<p style='color:green'>✓ SQLite3 extension is loaded</p>";
    
    // Test SQLite3 version
    echo "<p>SQLite3 Library Version: " . SQLite3::version()['versionString'] . "</p>";
    
} else {
    echo "<p style='color:red'>✗ SQLite3 extension is NOT loaded</p>";
}

// Check database directory
$dbDir = __DIR__ . '/database';
$dbFile = $dbDir . '/study_portal.db';

echo "<h2>Database Directory</h2>";
if (!file_exists($dbDir)) {
    echo "<p>Creating database directory...</p>";
    if (mkdir($dbDir, 0777, true)) {
        echo "<p style='color:green'>✓ Created database directory: $dbDir</p>";
    } else {
        echo "<p style='color:red'>✗ Failed to create database directory: $dbDir</p>";
        exit;
    }
} else {
    echo "<p style='color:green'>✓ Database directory exists: $dbDir</p>";
}

// Check if database file exists
if (!file_exists($dbFile)) {
    echo "<p>Database file does not exist. It will be created when needed.</p>";
} else {
    echo "<p style='color:green'>✓ Database file exists: $dbFile</p>";
    
    // Check file permissions
    $permissions = fileperms($dbFile);
    $permissions = substr(sprintf('%o', $permissions), -4);
    echo "<p>Database file permissions: $permissions</p>";
    
    if (!is_writable($dbFile)) {
        echo "<p style='color:red'>✗ Database file is not writable</p>";
    } else {
        echo "<p style='color:green'>✓ Database file is writable</p>";
    }
}

// Test database connection
echo "<h2>Database Connection Test</h2>";
try {
    $db = new SQLite3($dbFile);
    if ($db) {
        echo "<p style='color:green'>✓ Successfully connected to SQLite database</p>";
        
        // Check if tables exist
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
        $tableCount = 0;
        
        echo "<h3>Database Tables:</h3>";
        echo "<ul>";
        while ($table = $tables->fetchArray(SQLITE3_ASSOC)) {
            echo "<li>" . htmlspecialchars($table['name']) . "</li>";
            $tableCount++;
        }
        echo "</ul>";
        
        if ($tableCount === 0) {
            echo "<p style='color:orange'>⚠ No tables found in the database. Tables will be created when needed.</p>";
        }
        
    } else {
        echo "<p style='color:red'>✗ Failed to connect to database</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>✗ Database error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// PHP Info
if (isset($_GET['phpinfo'])) {
    phpinfo();
} else {
    echo "<p><a href='?phpinfo=1'>Show PHP Info</a></p>";
}
?>
