// Video Configuration for History Page
const videoConfig = {
    // Teachers data with their videos
    teachers: [
        {
            id: 'khan-physics',
            name: 'Khan Sir',
            specialization: 'Physics Expert',
            avatar: 'KS',
            videos: [
                {
                    id: 'Cx2Xk8leqWg',
                    title: 'Lecture 01 - Physics Previous Physics Class 1',
                    description: 'Physics Previous Physics Class 1 by Khan Sir covering fundamental concepts and problem-solving techniques.',
                    duration: '1:30:00',
                    views: '1.2M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/Cx2Xk8leqWg/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 0
                },
                {
                    id: 'TbF00TmplrM',
                    title: 'Lecture 02 - Physics Class 2',
                    description: 'Physics Class 2 lecture by Khan Sir covering important concepts and problem-solving techniques.',
                    duration: '1:25:00',
                    views: '1.1M',
                    date: '2 days ago',
                    thumbnail: 'https://img.youtube.com/vi/TbF00TmplrM/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 1
                },
                {
                    id: '2ZjCW0u-iMY',
                    title: 'Lecture 03 - Physics Class 3',
                    description: 'Physics Class 3 lecture by Khan Sir with advanced concepts and examples.',
                    duration: '1:28:00',
                    views: '1.0M',
                    date: '3 days ago',
                    thumbnail: 'https://img.youtube.com/vi/2ZjCW0u-iMY/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 2
                },
                {
                    id: 'fOmR6JUiuX4',
                    title: 'Lecture 04 - Scalar and Vector',
                    description: 'Introduction to Scalar and Vector quantities in physics with Khan Sir.',
                    duration: '1:30:45',
                    views: '1.8M',
                    date: '4 days ago',
                    thumbnail: 'https://img.youtube.com/vi/fOmR6JUiuX4/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 3
                },
                // ... rest of the existing videos ...
            ]
        },
        // ... rest of the teachers ...
    ],

    // Function to get teacher by ID
    getTeacherById(id) {
        return this.teachers.find(teacher => teacher.id === id);
    },

    // Function to get all teachers
    getAllTeachers() {
        return this.teachers;
    },

    // Function to get videos by teacher ID
    getVideosByTeacherId(teacherId) {
        const teacher = this.getTeacherById(teacherId);
        return teacher ? teacher.videos : [];
    },

    // Function to get video by ID
    getVideoById(teacherId, videoId) {
        const videos = this.getVideosByTeacherId(teacherId);
        return videos.find(video => video.id === videoId);
    }
};

// Make the config available globally
window.videoConfig = videoConfig;
