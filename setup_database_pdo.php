<?php
// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'study_portal';

try {
    // Create a connection without selecting a database first
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create the database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$database`");
    
    // Read the SQL file
    $sql = file_get_contents(__DIR__ . '/database/schema.sql');
    
    // Split the SQL file into individual queries
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Execute each query
    foreach ($queries as $query) {
        if (!empty($query)) {
            try {
                $pdo->exec($query);
                echo "Executed: " . substr($query, 0, 100) . "...\n";
            } catch (PDOException $e) {
                // Skip duplicate key errors (for INSERT IGNORE)
                if (strpos($e->getMessage(), '1062') === false) {
                    throw $e;
                }
                echo "Skipped (duplicate): " . substr($query, 0, 100) . "...\n";
            }
        }
    }
    
    // Commit the transaction
    $pdo->commit();
    
    echo "\nDatabase setup completed successfully!\n";
    
} catch (PDOException $e) {
    // Rollback the transaction if something failed
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    echo "\nError setting up database: " . $e->getMessage() . "\n";
    exit(1);
}
?>
