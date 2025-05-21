// Video Configuration for History Page
const videoConfig = {
    // Teachers data with their videos
    teachers: [
        {
            id: 'khan',
            name: 'Khan Sir',
            specialization: 'Ancient History Expert',
            avatar: 'KS',
            videos: [
                {
                    id: 'aYx-ne8gLPI',
                    title: 'Lecture 01 : History Introduction Class',
                    description: 'Foundation class by Khan Sir - Introduction to History covering key concepts and overview of the course. Perfect for competitive exam preparation.',
                    duration: '1:12:45',
                    views: '1.2M',
                    date: '1 year ago',

                    
                    thumbnail: 'https://img.youtube.com/vi/aYx-ne8gLPI/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 1
                },
                {
                    id: 'tjECfRgx-jA',
                    title: 'Lecture 02 : History (Indus Valley Civilization)',
                    description: 'Comprehensive coverage of the Indus Valley Civilization, its discovery, major sites, and urban planning.',
                    duration: '1:15:20',
                    views: '850K',
                    date: '11 months ago',
                    thumbnail: 'https://img.youtube.com/vi/tjECfRgx-jA/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 2
                },
                {
                    id: 'ZMklpyhDhv0',
                    title: 'Lecture 03: Indus Valley Civilization || सिंधु घाटी सभ्यता',
                    description: 'Detailed explanation of the Indus Valley Civilization in Hindi, covering its major sites, urban planning, and significance in ancient history.',
                    duration: '1:30:45',
                    views: '1.1M',
                    date: '10 months ago',
                    thumbnail: 'https://img.youtube.com/vi/ZMklpyhDhv0/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 3
                },
                {
                    id: 'xfG0bfRcuBU',
                    title: 'Lecture 04: Indus Valley Civilization || सिंधु घाटी सभ्यता',
                    description: 'Comprehensive analysis of the Indus Valley Civilization in Hindi, covering its architecture, trade, and cultural aspects.',
                    duration: '1:25:30',
                    views: '950K',
                    date: '11 months ago',
                    thumbnail: 'https://img.youtube.com/vi/xfG0bfRcuBU/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 4
                },
                {
                    id: 'g1DjHDdZBP0',
                    title: 'Lecture 05: Indus Valley Civilization - Part 03',
                    description: 'In-depth analysis of the Indus Valley Civilization, focusing on its cultural aspects, trade relations, and decline.',
                    duration: '1:20:15',
                    views: '890K',
                    date: '10 months ago',
                    thumbnail: 'https://img.youtube.com/vi/g1DjHDdZBP0/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 5
                },
                {
                    id: 'r2a9-g2piPY',
                    title: 'Lecture 06: Indus Valley Civilization Part 04 सिंधु घाटी सभ्यता Part 04',
                    description: 'Comprehensive coverage of the Vedic Period in Hindi, including the early Vedic society, economy, and religious practices.',
                    duration: '1:18:30',
                    views: '1.2M',
                    date: '10 months ago',
                    thumbnail: 'https://img.youtube.com/vi/r2a9-g2piPY/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 6
                }
            ]
        },
        {
            id: 'sarah',
            name: 'Sarah Johnson',
            specialization: 'World Wars Specialist',
            avatar: 'SJ',
            videos: [
                {
                    id: 'WORLD_WAR_VIDEO_ID',
                    title: 'World War I: The Great War',
                    description: 'Detailed analysis of the causes, major battles, and consequences of World War I.',
                    duration: '38:45',
                    views: '1.8K',
                    date: '1 month ago',
                    thumbnail: 'https://source.unsplash.com/random/600x340/?world,war,1'
                }
            ]
        },
        {
            id: 'michael',
            name: 'Michael Brown',
            specialization: 'Medieval Europe',
            avatar: 'MB',
            videos: [
                {
                    id: 'MEDIEVAL_VIDEO_ID',
                    title: 'The Middle Ages: Life and Society',
                    description: 'Explore daily life, culture, and society during the Middle Ages in Europe.',
                    duration: '41:20',
                    views: '2.1K',
                    date: '3 weeks ago',
                    thumbnail: 'https://source.unsplash.com/random/600x340/?medieval,europe'
                }
            ]
        },
        {
            id: 'emily',
            name: 'Emily Davis',
            specialization: 'Asian History',
            avatar: 'ED',
            videos: [
                {
                    id: 'ASIAN_HISTORY_VIDEO_ID',
                    title: 'Ancient China: Dynasties and Inventions',
                    description: 'Discover the rich history of ancient Chinese dynasties and their contributions to the world.',
                    duration: '47:55',
                    views: '1.5K',
                    date: '1 month ago',
                    thumbnail: 'https://source.unsplash.com/random/600x340/?ancient,china'
                }
            ]
        }
    ],

    // Function to get teacher by ID
    getTeacherById: function(id) {
        return this.teachers.find(teacher => teacher.id === id) || null;
    },

    // Function to get all teachers
    getAllTeachers: function() {
        return this.teachers;
    },

    // Function to get videos by teacher ID
    getVideosByTeacherId: function(teacherId) {
        const teacher = this.getTeacherById(teacherId);
        return teacher ? teacher.videos : [];
    },

    // Function to get video by ID
    getVideoById: function(teacherId, videoId) {
        const teacher = this.getTeacherById(teacherId);
        if (!teacher) return null;
        return teacher.videos.find(video => video.id === videoId) || null;
    }
};

// Make the config available globally
window.videoConfig = videoConfig;
