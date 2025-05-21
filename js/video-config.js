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
                },
                {
                    id: 'QJKQLwUzR58',
                    title: 'Lecture 07: मेसोपोटामिया की सभ्यता (Mesopotamian Civilization)',
                    description: 'Detailed explanation of the Mesopotamian Civilization, one of the earliest civilizations in the world, covering its history, culture, and contributions.',
                    duration: '1:25:00',
                    views: '1.5M',
                    date: '9 months ago',
                    thumbnail: 'https://img.youtube.com/vi/QJKQLwUzR58/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 7
                },
                {
                    id: '13vnD9iOQlg',
                    title: 'Lecture 08: Historical Period (Coins & Epigraphy)',
                    description: 'Comprehensive analysis of historical periods with focus on numismatics (study of coins) and epigraphy (study of inscriptions). Covers their significance in understanding ancient history and civilizations.',
                    duration: '1:35:00',
                    views: '1.1M',
                    date: '8 months ago',
                    thumbnail: 'https://img.youtube.com/vi/13vnD9iOQlg/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 16
                },
                {
                    id: 'YPH7XKJRI0g',
                    title: 'Lecture 09: History Foundation Class by Khan Sir',
                    description: 'Comprehensive foundation class on History by Khan Sir, covering essential concepts, timelines, and important events. Perfect for building a strong base in history for competitive exams.',
                    duration: '1:30:00',
                    views: '1.2M',
                    date: '8 months ago',
                    thumbnail: 'https://img.youtube.com/vi/YPH7XKJRI0g/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 18
                },
                {
                    id: 'g6xg3R3TQC4',
                    title: 'Lecture 10: वैदिक काल (Vedic Period)',
                    description: 'Comprehensive analysis of the Vedic Period by Khan Sir, covering the early Vedic and later Vedic periods, Vedic literature, society, economy, and religious practices.',
                    duration: '1:35:00',
                    views: '1.5M',
                    date: '8 months ago',
                    thumbnail: 'https://img.youtube.com/vi/g6xg3R3TQC4/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 19
                },
                {
                    id: 'ROMAN_VIDEO_ID',
                    title: 'Lecture 11: रोमन सभ्यता (Roman Civilization)',
                    description: 'Comprehensive coverage of the Roman Civilization, including its history, governance, architecture, and impact on modern society.',
                    duration: '1:30:00',
                    views: '1.3M',
                    date: '9 months ago',
                    thumbnail: 'https://img.youtube.com/vi/ROMAN_VIDEO_ID/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 20
                },
                {
                    id: 'EGYPTIAN_VIDEO_ID',
                    title: 'Lecture 12: मिस्र की सभ्यता (Egyptian Civilization)',
                    description: 'In-depth analysis of the Ancient Egyptian Civilization, covering its pyramids, pharaohs, religion, and cultural achievements.',
                    duration: '1:28:00',
                    views: '1.4M',
                    date: '8 months ago',
                    thumbnail: 'https://img.youtube.com/vi/EGYPTIAN_VIDEO_ID/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 21
                },
                {
                    id: 'PERSIAN_VIDEO_ID',
                    title: 'Lecture 13: फ़ारस की सभ्यता (Persian Civilization)',
                    description: 'Detailed study of the Persian Empire, its administration, culture, and contributions to world civilization.',
                    duration: '1:20:00',
                    views: '1.2M',
                    date: '8 months ago',
                    thumbnail: 'https://img.youtube.com/vi/PERSIAN_VIDEO_ID/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 22
                },
                {
                    id: 'SPARTA_VIDEO_ID',
                    title: 'Lecture 14: स्पार्टा की सभ्यता (Spartan Civilization)',
                    description: 'Comprehensive analysis of the Spartan society, military system, and its role in ancient Greek history.',
                    duration: '1:22:00',
                    views: '1.1M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/SPARTA_VIDEO_ID/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 23
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
