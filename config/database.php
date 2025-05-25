<?php
// Database configuration
$dbFile = __DIR__ . '/../database/study_portal.db';

function getDBConnection() {
    global $dbFile;
    
    try {
        // Create database directory if it doesn't exist
        if (!file_exists(dirname($dbFile))) {
            mkdir(dirname($dbFile), 0777, true);
        }
        
        // Check if SQLite3 class exists (should be available by default)
        if (!class_exists('SQLite3')) {
            throw new Exception('SQLite3 extension is not available');
        }
        
        // Connect to SQLite database using SQLite3
        $db = new SQLite3($dbFile);
        
        // Enable foreign key constraints
        $db->exec('PRAGMA foreign_keys = ON;');
        
        // Create tables if they don't exist
        createTables($db);
        
        return $db;
        
    } catch (Exception $e) {
        // If we can't use SQLite3, fall back to file-based storage
        return getFallbackConnection($e->getMessage());
    }
}

/**
 * Create database tables
 */
function createTables($db) {
    // Create videos table
    $db->exec('CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        video_id TEXT,
        thumbnail TEXT,
        subject TEXT NOT NULL,
        teacher TEXT NOT NULL,
        duration TEXT DEFAULT "0:00",
        views INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )');
    
    // Create teachers table
    $db->exec('CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        subjects TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )');
    
    // Create subjects table
    $db->exec('CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )');
    
    // Insert default data if tables are empty
    insertDefaultData($db);
}

/**
 * Insert default data
 */
function insertDefaultData($db) {
    // Default subjects
    $defaultSubjects = [
        ['history', 'History', 'Learn about historical events and civilizations'],
        ['geography', 'Geography', 'Study of places and the relationships between people and their environments'],
        ['mathematics', 'Mathematics', 'The abstract science of number, quantity, and space'],
        ['science', 'Science', 'The study of the natural and physical world through observation and experiment'],
        ['english', 'English', 'Study of the English language and literature'],
        ['gk', 'General Knowledge', 'General awareness and knowledge about various topics'],
        ['reasoning', 'Reasoning', 'Logical and analytical reasoning skills']
    ];
    
    $stmt = $db->prepare('INSERT OR IGNORE INTO subjects (id, name, description) VALUES (:id, :name, :description)');
    foreach ($defaultSubjects as $subject) {
        $stmt->bindValue(':id', $subject[0], SQLITE3_TEXT);
        $stmt->bindValue(':name', $subject[1], SQLITE3_TEXT);
        $stmt->bindValue(':description', $subject[2], SQLITE3_TEXT);
        $stmt->execute();
    }
    
    // Default teachers
    $defaultTeachers = [
        ['khan', 'Khan Sir', 'Experienced educator with expertise in history and general knowledge', '', 'history,gk'],
        ['sarah', 'Sarah Johnson', 'Passionate about making mathematics fun and accessible', '', 'mathematics,reasoning'],
        ['david', 'David Miller', 'Geography expert with field experience in various countries', '', 'geography'],
        ['priya', 'Priya Sharma', 'Science enthusiast with a focus on practical learning', '', 'science'],
        ['alex', 'Alex Chen', 'English language and literature specialist', '', 'english']
    ];
    
    $stmt = $db->prepare('INSERT OR IGNORE INTO teachers (id, name, description, image_url, subjects) VALUES (:id, :name, :description, :image_url, :subjects)');
    foreach ($defaultTeachers as $teacher) {
        $stmt->bindValue(':id', $teacher[0], SQLITE3_TEXT);
        $stmt->bindValue(':name', $teacher[1], SQLITE3_TEXT);
        $stmt->bindValue(':description', $teacher[2], SQLITE3_TEXT);
        $stmt->bindValue(':image_url', $teacher[3], SQLITE3_TEXT);
        $stmt->bindValue(':subjects', $teacher[4], SQLITE3_TEXT);
        $stmt->execute();
    }
}

/**
 * Fallback connection using file-based storage
 */
function getFallbackConnection($error) {
    // Log the error
    error_log("Database connection failed: $error");
    
    // For now, we'll just throw an exception
    throw new Exception('Database connection failed and no fallback available: ' . $error);
}

/**
 * Create SQLite tables if they don't exist
 */
function createSqliteTables($pdo) {
    // Create videos table
    $pdo->exec('CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        video_id TEXT,
        thumbnail TEXT,
        subject TEXT NOT NULL,
        teacher TEXT NOT NULL,
        duration TEXT DEFAULT "0:00",
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )');
    
    // Create teachers table
    $pdo->exec('CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        subjects TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )');
    
    // Create subjects table
    $pdo->exec('CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )');
    
    // Insert default subjects if they don't exist
    $defaultSubjects = [
        ['history', 'History', 'Learn about historical events and civilizations'],
        ['geography', 'Geography', 'Study of places and the relationships between people and their environments'],
        ['mathematics', 'Mathematics', 'The abstract science of number, quantity, and space'],
        ['science', 'Science', 'The study of the natural and physical world through observation and experiment'],
        ['english', 'English', 'Study of the English language and literature'],
        ['gk', 'General Knowledge', 'General awareness and knowledge about various topics'],
        ['reasoning', 'Reasoning', 'Logical and analytical reasoning skills']
    ];
    
    $stmt = $pdo->prepare('INSERT OR IGNORE INTO subjects (id, name, description) VALUES (?, ?, ?)');
    foreach ($defaultSubjects as $subject) {
        $stmt->execute($subject);
    }
    
    // Insert default teachers if they don't exist
    $defaultTeachers = [
        ['khan', 'Khan Sir', 'Experienced educator with expertise in history and general knowledge', '', 'history,gk'],
        ['sarah', 'Sarah Johnson', 'Passionate about making mathematics fun and accessible', '', 'mathematics,reasoning'],
        ['david', 'David Miller', 'Geography expert with field experience in various countries', '', 'geography'],
        ['priya', 'Priya Sharma', 'Science enthusiast with a focus on practical learning', '', 'science'],
        ['alex', 'Alex Chen', 'English language and literature specialist', '', 'english']
    ];
    
    $stmt = $pdo->prepare('INSERT OR IGNORE INTO teachers (id, name, description, image_url, subjects) VALUES (?, ?, ?, ?, ?)');
    foreach ($defaultTeachers as $teacher) {
        $stmt->execute($teacher);
    }
}
?>
