<?php
// Include database configuration
require_once __DIR__ . '/config/database.php';

// Read the SQL file
$sql = file_get_contents(__DIR__ . '/database/schema.sql');

// Split the SQL file into individual queries
$queries = array_filter(array_map('trim', explode(';', $sql)));

try {
    // Get database connection
    $pdo = getDBConnection();
    
    // Set PDO to throw exceptions on error
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Execute each query
    foreach ($queries as $query) {
        if (!empty($query)) {
            try {
                $pdo->exec($query);
            } catch (PDOException $e) {
                // Skip duplicate key errors (for INSERT IGNORE)
                if (strpos($e->getMessage(), '1062') === false) {
                    throw $e;
                }
            }
        }
    }
    
    // Commit the transaction
    $pdo->commit();
    
    echo "Database setup completed successfully!\n";
    
} catch (PDOException $e) {
    // Rollback the transaction if something failed
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    echo "Error setting up database: " . $e->getMessage() . "\n";
    exit(1);
}
?>
