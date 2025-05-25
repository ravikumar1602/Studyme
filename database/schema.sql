-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS study_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE study_portal;

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    video_id VARCHAR(50),
    thumbnail VARCHAR(500),
    subject VARCHAR(100) NOT NULL,
    teacher VARCHAR(100) NOT NULL,
    duration VARCHAR(20) DEFAULT '0:00',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_videos_subject ON videos(subject);
CREATE INDEX idx_videos_teacher ON videos(teacher);
CREATE INDEX idx_videos_created_at ON videos(created_at);

-- Create a table to store teacher information
CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    subjects TEXT, -- Comma-separated list of subjects this teacher teaches
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a table for subjects
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some default subjects if they don't exist
INSERT IGNORE INTO subjects (id, name, description) VALUES
('history', 'History', 'Learn about historical events and civilizations'),
('geography', 'Geography', 'Study of places and the relationships between people and their environments'),
('mathematics', 'Mathematics', 'The abstract science of number, quantity, and space'),
('science', 'Science', 'The study of the natural and physical world through observation and experiment'),
('english', 'English', 'Study of the English language and literature'),
('gk', 'General Knowledge', 'General awareness and knowledge about various topics'),
('reasoning', 'Reasoning', 'Logical and analytical reasoning skills');

-- Insert some default teachers
INSERT IGNORE INTO teachers (id, name, description, subjects) VALUES
('khan', 'Khan Sir', 'Experienced educator with expertise in history and general knowledge', 'history,gk'),
('sarah', 'Sarah Johnson', 'Passionate about making mathematics fun and accessible', 'mathematics,reasoning'),
('david', 'David Miller', 'Geography expert with field experience in various countries', 'geography'),
('priya', 'Priya Sharma', 'Science enthusiast with a focus on practical learning', 'science'),
('alex', 'Alex Chen', 'English language and literature specialist', 'english');
