<?php
// Include database configuration
require_once __DIR__ . '/config/database.php';

// Test database connection
try {
    $pdo = getDBConnection();
    
    // Test query to check if tables exist
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h1>Database Connection Test</h1>";
    echo "<p>Connected to SQLite database successfully!</p>";
    
    echo "<h2>Tables in database:</h2>";
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>$table</li>";
    }
    echo "</ul>";
    
    // Test inserting a sample video
    echo "<h2>Testing Video Insertion</h2>";
    
    $sampleVideo = [
        'id' => 'test_' . uniqid(),
        'title' => 'Test Video',
        'description' => 'This is a test video',
        'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'subject' => 'history',
        'teacher' => 'khan',
        'duration' => '10:30',
        'views' => 0
    ];
    
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO videos (id, title, description, url, subject, teacher, duration, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $result = $stmt->execute([
        $sampleVideo['id'],
        $sampleVideo['title'],
        $sampleVideo['description'],
        $sampleVideo['url'],
        $sampleVideo['subject'],
        $sampleVideo['teacher'],
        $sampleVideo['duration'],
        $sampleVideo['views']
    ]);
    
    if ($result) {
        echo "<p style='color: green;'>✓ Successfully inserted test video!</p>";
        
        // Fetch and display the inserted video
        $video = $pdo->query("SELECT * FROM videos WHERE id = '{$sampleVideo['id']}'")->fetch(PDO::FETCH_ASSOC);
        echo "<pre>" . print_r($video, true) . "</pre>";
    } else {
        echo "<p style='color: red;'>✗ Failed to insert test video.</p>";
    }
    
    // List all videos
    echo "<h2>All Videos</h2>";
    $videos = $pdo->query("SELECT id, title, subject, teacher, created_at FROM videos")->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($videos) > 0) {
        echo "<table border='1' cellpadding='8' cellspacing='0' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>Title</th><th>Subject</th><th>Teacher</th><th>Created At</th></tr>";
        foreach ($videos as $video) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars(substr($video['id'], 0, 8) . '...') . "</td>";
            echo "<td>" . htmlspecialchars($video['title']) . "</td>";
            echo "<td>" . htmlspecialchars($video['subject']) . "</td>";
            echo "<td>" . htmlspecialchars($video['teacher']) . "</td>";
            echo "<td>" . htmlspecialchars($video['created_at']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No videos found in the database.</p>";
    }
    
} catch (Exception $e) {
    echo "<h1>Database Connection Error</h1>";
    echo "<p style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
?>
