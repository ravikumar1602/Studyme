<?php
class JsonStorage {
    private $dataFile;
    private $data = [];
    
    public function __construct($dataFile) {
        $this->dataFile = $dataFile;
        $this->load();
    }
    
    private function load() {
        if (file_exists($this->dataFile)) {
            $json = file_get_contents($this->dataFile);
            $this->data = json_decode($json, true) ?: [];
        } else {
            $this->data = [
                'videos' => [],
                'teachers' => [
                    'khan' => ['id' => 'khan', 'name' => 'Khan Sir', 'description' => 'Experienced educator with expertise in history and general knowledge', 'image_url' => '', 'subjects' => 'history,gk'],
                    'sarah' => ['id' => 'sarah', 'name' => 'Sarah Johnson', 'description' => 'Passionate about making mathematics fun and accessible', 'image_url' => '', 'subjects' => 'mathematics,reasoning'],
                    'david' => ['id' => 'david', 'name' => 'David Miller', 'description' => 'Geography expert with field experience in various countries', 'image_url' => '', 'subjects' => 'geography'],
                    'priya' => ['id' => 'priya', 'name' => 'Priya Sharma', 'description' => 'Science enthusiast with a focus on practical learning', 'image_url' => '', 'subjects' => 'science'],
                    'alex' => ['id' => 'alex', 'name' => 'Alex Chen', 'description' => 'English language and literature specialist', 'image_url' => '', 'subjects' => 'english']
                ],
                'subjects' => [
                    'history' => ['id' => 'history', 'name' => 'History', 'description' => 'Learn about historical events and civilizations', 'thumbnail_url' => ''],
                    'geography' => ['id' => 'geography', 'name' => 'Geography', 'description' => 'Study of places and the relationships between people and their environments', 'thumbnail_url' => ''],
                    'mathematics' => ['id' => 'mathematics', 'name' => 'Mathematics', 'description' => 'The abstract science of number, quantity, and space', 'thumbnail_url' => ''],
                    'science' => ['id' => 'science', 'name' => 'Science', 'description' => 'The study of the natural and physical world through observation and experiment', 'thumbnail_url' => ''],
                    'english' => ['id' => 'english', 'name' => 'English', 'description' => 'Study of the English language and literature', 'thumbnail_url' => ''],
                    'gk' => ['id' => 'gk', 'name' => 'General Knowledge', 'description' => 'General awareness and knowledge about various topics', 'thumbnail_url' => ''],
                    'reasoning' => ['id' => 'reasoning', 'name' => 'Reasoning', 'description' => 'Logical and analytical reasoning skills', 'thumbnail_url' => '']
                ]
            ];
            $this->save();
        }
    }
    
    private function save() {
        $dir = dirname($this->dataFile);
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        file_put_contents($this->dataFile, json_encode($this->data, JSON_PRETTY_PRINT));
    }
    
    public function getVideos($subject = null, $teacher = null) {
        $videos = $this->data['videos'];
        
        if ($subject) {
            $videos = array_filter($videos, function($video) use ($subject) {
                return $video['subject'] === $subject;
            });
        }
        
        if ($teacher) {
            $videos = array_filter($videos, function($video) use ($teacher) {
                return $video['teacher'] === $teacher;
            });
        }
        
        // Sort by created_at in descending order
        usort($videos, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        return array_values($videos);
    }
    
    public function getVideo($id) {
        foreach ($this->data['videos'] as $video) {
            if ($video['id'] === $id) {
                return $video;
            }
        }
        return null;
    }
    
    public function addVideo($video) {
        $video['id'] = uniqid();
        $video['created_at'] = date('Y-m-d H:i:s');
        $video['updated_at'] = date('Y-m-d H:i:s');
        
        // Extract video ID from YouTube URL
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $video['url'], $matches)) {
            $video['video_id'] = $matches[1];
            $video['thumbnail'] = "https://img.youtube.com/vi/{$matches[1]}/hqdefault.jpg";
        } else {
            $video['video_id'] = '';
            $video['thumbnail'] = $video['thumbnail'] ?? '';
        }
        
        $this->data['videos'][] = $video;
        $this->save();
        return $video;
    }
    
    public function updateVideo($id, $updates) {
        foreach ($this->data['videos'] as &$video) {
            if ($video['id'] === $id) {
                // If URL changed, update video_id and thumbnail
                if (isset($updates['url']) && $updates['url'] !== $video['url']) {
                    if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $updates['url'], $matches)) {
                        $updates['video_id'] = $matches[1];
                        $updates['thumbnail'] = "https://img.youtube.com/vi/{$matches[1]}/hqdefault.jpg";
                    } else {
                        $updates['video_id'] = '';
                        $updates['thumbnail'] = '';
                    }
                }
                
                $video = array_merge($video, $updates);
                $video['updated_at'] = date('Y-m-d H:i:s');
                $this->save();
                return $video;
            }
        }
        return null;
    }
    
    public function deleteVideo($id) {
        foreach ($this->data['videos'] as $key => $video) {
            if ($video['id'] === $id) {
                array_splice($this->data['videos'], $key, 1);
                $this->save();
                return true;
            }
        }
        return false;
    }
    
    public function getTeachers() {
        return array_values($this->data['teachers']);
    }
    
    public function getSubjects() {
        return array_values($this->data['subjects']);
    }
}

// Create storage instance
$storageFile = __DIR__ . '/../data/storage.json';
$storage = new JsonStorage($storageFile);
