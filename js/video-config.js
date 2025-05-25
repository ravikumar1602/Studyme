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
                    id: 'locked-001',
                    title: 'Lecture 01 - Currently Not Available',
                    description: 'This lecture is currently not available. Please check back later for updates.',
                    duration: '00:00',
                    views: '0',
                    date: 'N/A',
                    thumbnail: 'https://via.placeholder.com/1280x720/000000/ffffff?text=Lecture+Not+Available'
                },
                {
                    id: 'locked-002',
                    title: 'Lecture 02 - Currently Not Available',
                    description: 'This lecture is currently not available. Please check back later for updates.',
                    duration: '00:00',
                    views: '0',
                    date: 'N/A',
                    thumbnail: 'https://via.placeholder.com/1280x720/000000/ffffff?text=Lecture+Not+Available'
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
                {
                    id: 'FgNPOivP_V4',
                    title: 'Lecture 05 - Physics Class 5',
                    description: 'Physics Class 5 lecture by Khan Sir with advanced concepts and examples.',
                    duration: '1:25:30',
                    views: '1.3M',
                    date: '5 days ago',
                    thumbnail: 'https://img.youtube.com/vi/FgNPOivP_V4/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 4
                },
                {
                    id: 'fOmR6JUiuX4',
                    title: 'Lecture 06 - Scalar and Vector',
                    description: 'Introduction to Scalar and Vector quantities in physics with Khan Sir.',
                    duration: '1:30:45',
                    views: '1.8M',
                    date: '2 weeks ago',
                    thumbnail: 'https://img.youtube.com/vi/fOmR6JUiuX4/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 3
                },
                {
                    id: 'FgNPOivP_V4',
                    title: 'Lecture 07 - Scalar and Vector Class 2',
                    description: 'Continuation of Scalar and Vector concepts with more examples and problems.',
                    duration: '1:32:15',
                    views: '1.5M',
                    date: '2 weeks ago',
                    thumbnail: 'https://img.youtube.com/vi/FgNPOivP_V4/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 4
                },
                {
                    id: 'RSW-BT0Wl6Q',
                    title: 'Lecture 08 - Scalar and Vector 3',
                    description: 'Advanced concepts in Scalar and Vector quantities with problem-solving techniques.',
                    duration: '1:35:20',
                    views: '1.4M',
                    date: '1 week ago',
                    thumbnail: 'https://img.youtube.com/vi/RSW-BT0Wl6Q/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 5
                },
                {
                    id: 'wDoa_O2RJG4',
                    title: 'Lecture 09 - Motion Class 1',
                    description: 'Introduction to Motion in physics with Khan Sir - Class 1.',
                    duration: '1:25:45',
                    views: '2.1M',
                    date: '1 week ago',
                    thumbnail: 'https://img.youtube.com/vi/wDoa_O2RJG4/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 6
                },
                {
                    id: 'Poa8ggQKPHI',
                    title: 'Lecture 10 - Motion 2',
                    description: 'Continuation of Motion concepts with practical examples and problems.',
                    duration: '1:30:15',
                    views: '1.9M',
                    date: '1 week ago',
                    thumbnail: 'https://img.youtube.com/vi/Poa8ggQKPHI/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 7
                },
                {
                    id: 'J23Yk8rSD_w',
                    title: 'Lecture 11 - Motion 3',
                    description: 'Advanced concepts in Motion with problem-solving techniques.',
                    duration: '1:35:20',
                    views: '1.7M',
                    date: '1 week ago',
                    thumbnail: 'https://img.youtube.com/vi/J23Yk8rSD_w/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 8
                },
                {
                    id: 'QQcqEqPofm4',
                    title: 'Lecture 12 - Motion 4',
                    description: 'Further exploration of Motion concepts with numerical problems.',
                    duration: '1:40:10',
                    views: '1.6M',
                    date: '1 week ago',
                    thumbnail: 'https://img.youtube.com/vi/QQcqEqPofm4/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 9
                },
                {
                    id: 'DL-Tc6GD6gg',
                    title: 'Lecture 13 - Motion 5',
                    description: 'Final part of Motion series with comprehensive problem solving.',
                    duration: '1:45:30',
                    views: '1.5M',
                    date: '1 week ago',
                    thumbnail: 'https://img.youtube.com/vi/DL-Tc6GD6gg/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 10
                },
                {
                    id: 'b40rBEWG_jU',
                    title: 'Lecture 14 - Motion (Graphs & Numerical)',
                    description: 'Understanding Motion through graphs and numerical problems.',
                    duration: '1:32:45',
                    views: '1.8M',
                    date: '6 days ago',
                    thumbnail: 'https://img.youtube.com/vi/b40rBEWG_jU/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 11
                },
                {
                    id: 'hS4RbFAWu2M',
                    title: 'Lecture 15 - Motion (Graphs & Numerical - 2)',
                    description: 'Advanced graph analysis and numerical problems in Motion.',
                    duration: '1:38:15',
                    views: '1.6M',
                    date: '6 days ago',
                    thumbnail: 'https://img.youtube.com/vi/hS4RbFAWu2M/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 12
                },
                {
                    id: 'a5I_LUj4wYQ',
                    title: 'Lecture 16 - Angular Velocity',
                    description: 'Understanding Angular Velocity and its applications in circular motion.',
                    duration: '1:25:30',
                    views: '1.7M',
                    date: '5 days ago',
                    thumbnail: 'https://img.youtube.com/vi/a5I_LUj4wYQ/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 13
                },
                {
                    id: 'jnAOJapOKw0',
                    title: 'Lecture 17 - Projectile Motion',
                    description: 'Comprehensive coverage of Projectile Motion concepts and problems.',
                    duration: '1:35:45',
                    views: '2.0M',
                    date: '5 days ago',
                    thumbnail: 'https://img.youtube.com/vi/jnAOJapOKw0/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 14
                },
                {
                    id: 'pAYaX_dLlHc',
                    title: 'Lecture 18 - Work',
                    description: 'Understanding the concept of Work in physics with practical examples.',
                    duration: '1:20:15',
                    views: '1.8M',
                    date: '4 days ago',
                    thumbnail: 'https://img.youtube.com/vi/pAYaX_dLlHc/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 15
                },
                {
                    id: 'Dn3YrBVl1qg',
                    title: 'Lecture 19 - Energy',
                    description: 'Exploring different forms of Energy and conservation principles.',
                    duration: '1:30:20',
                    views: '1.7M',
                    date: '4 days ago',
                    thumbnail: 'https://img.youtube.com/vi/Dn3YrBVl1qg/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 16
                },
                {
                    id: 'btSWnTzpuOs',
                    title: 'Lecture 20 - Power',
                    description: 'Understanding Power and its relationship with Work and Energy.',
                    duration: '1:15:30',
                    views: '1.5M',
                    date: '3 days ago',
                    thumbnail: 'https://img.youtube.com/vi/btSWnTzpuOs/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 17
                },
                {
                    id: 'huAPSQ2DVZc',
                    title: 'Lecture 21 - Work Power Energy - Final Concepts',
                    description: 'Comprehensive review of work, power, and energy with advanced problems.',
                    duration: '1:40:30',
                    views: '1.9M',
                    date: '2 days ago',
                    thumbnail: 'https://img.youtube.com/vi/huAPSQ2DVZc/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 18
                },
                {
                    id: '2udxeF1b7Aw',
                    title: 'Lecture 22 - Momentum & Kinetic Energy',
                    description: 'Understanding the relationship between momentum and kinetic energy.',
                    duration: '1:25:15',
                    views: '1.6M',
                    date: '2 days ago',
                    thumbnail: 'https://img.youtube.com/vi/2udxeF1b7Aw/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 19
                },
                {
                    id: 'xbjtkvlalxY',
                    title: 'Lecture 23 - Impulse and Momentum',
                    description: 'Understanding impulse and its relationship with momentum.',
                    duration: '1:30:45',
                    views: '1.5M',
                    date: '2 days ago',
                    thumbnail: 'https://img.youtube.com/vi/xbjtkvlalxY/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 20
                },
                {
                    id: 'gFamsLa-L0w',
                    title: 'Lecture 24 - Elastic Collision',
                    description: 'Understanding elastic collisions and conservation of momentum and energy.',
                    duration: '1:35:20',
                    views: '1.7M',
                    date: '2 days ago',
                    thumbnail: 'https://img.youtube.com/vi/gFamsLa-L0w/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 21
                },
                {
                    id: '9iDwmwN578w',
                    title: 'Lecture 25 - Force Class 1',
                    description: 'Introduction to forces in physics and their effects on motion.',
                    duration: '1:25:30',
                    views: '2.0M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/9iDwmwN578w/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 22
                },
                {
                    id: 'gKQd2-OqkEc',
                    title: 'Lecture 26 - Force Class 2',
                    description: 'Advanced concepts of forces and their applications in problem-solving.',
                    duration: '1:30:15',
                    views: '1.8M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/gKQd2-OqkEc/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 23
                },
                {
                    id: 'GTLM7dWW2Zg',
                    title: 'Lecture 27 - Force Class 3',
                    description: 'Practical applications of force concepts with numerical problems.',
                    duration: '1:35:45',
                    views: '1.7M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/GTLM7dWW2Zg/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 24
                },
                {
                    id: 'LqUEEjRM8UI',
                    title: 'Lecture 28 - Force Class 4 (Friction)',
                    description: 'Understanding friction, its types, and its role in motion.',
                    duration: '1:40:20',
                    views: '1.9M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/LqUEEjRM8UI/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 25
                },
                {
                    id: '707lXBlklLg',
                    title: 'Lecture 29 - Force Class 5 (Friction)',
                    description: 'Advanced problems and applications of friction in physics.',
                    duration: '1:45:30',
                    views: '1.7M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/707lXBlklLg/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 26
                },
                {
                    id: '60oB_SbLU2s',
                    title: 'Lecture 30 - Lever',
                    description: 'Understanding levers and their applications in physics and daily life.',
                    duration: '1:20:45',
                    views: '1.6M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/60oB_SbLU2s/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 27
                },
                {
                    id: 'NKL64nh1He8',
                    title: 'Lecture 31 - Lever 2',
                    description: 'Advanced concepts and applications of levers in physics.',
                    duration: '1:25:30',
                    views: '1.4M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/NKL64nh1He8/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 28
                },
                {
                    id: '4K1OkKedK64',
                    title: 'Lecture 32 - Torque',
                    description: 'Understanding torque and its applications in rotational motion.',
                    duration: '1:30:45',
                    views: '1.7M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/4K1OkKedK64/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 29
                },
                {
                    id: 'lQDkZEWZrhs',
                    title: 'Lecture 33 - Angular Momentum',
                    description: 'Understanding angular momentum and its conservation in rotational systems.',
                    duration: '1:35:20',
                    views: '1.5M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/lQDkZEWZrhs/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 30
                },
                {
                    id: 'tZzaR-1iPyU',
                    title: 'Lecture 34 - Gravitation Class 1',
                    description: 'Introduction to the universal law of gravitation and its applications.',
                    duration: '1:40:15',
                    views: '1.8M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/tZzaR-1iPyU/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 31
                },
                {
                    id: 'BiP-3j2atbE',
                    title: 'Lecture 35 - Gravitation Class 2',
                    description: 'Advanced concepts in gravitation with problem-solving techniques.',
                    duration: '1:45:30',
                    views: '1.6M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/BiP-3j2atbE/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 32
                },
                {
                    id: 'Az07RymfhwI',
                    title: 'Lecture 36 - Gravitation Class 3',
                    description: 'Further exploration of gravitational concepts and numerical problems.',
                    duration: '1:50:45',
                    views: '1.7M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/Az07RymfhwI/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 33
                },
                {
                    id: 'DFhmQwDmaUI',
                    title: 'Lecture 37 - Gravitation Class 4 (Satellite)',
                    description: 'Understanding satellite motion and orbital mechanics.',
                    duration: '1:55:20',
                    views: '1.9M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/DFhmQwDmaUI/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 34
                },
                {
                    id: 'fxBM6r8vHXQ',
                    title: 'Lecture 38 - Gravitation Class 5 (Kepler\'s Law)',
                    description: 'Understanding Kepler\'s laws of planetary motion and their applications.',
                    duration: '2:00:30',
                    views: '1.8M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/fxBM6r8vHXQ/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 35
                },
                {
                    id: 'crLMXRZsRxE',
                    title: 'Lecture 39 - Gravitation Class 6 (Lift)',
                    description: 'Understanding apparent weight and motion in lifts/elevators.',
                    duration: '1:25:45',
                    views: '1.7M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/crLMXRZsRxE/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 36
                },
                {
                    id: 'tyf6XfMiw0I',
                    title: 'Lecture 40 - Gravitation Class 7 (Weight & Mass)',
                    description: 'Understanding the difference between weight and mass in gravitational fields.',
                    duration: '1:30:20',
                    views: '1.6M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/tyf6XfMiw0I/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 37
                },
                {
                    id: '61O7rD851yU',
                    title: 'Lecture 41 - SHM (Simple Harmonic Motion)',
                    description: 'Introduction to Simple Harmonic Motion and its characteristics.',
                    duration: '1:35:45',
                    views: '2.0M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/61O7rD851yU/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 38
                },
                {
                    id: 'kb1p4EmlsgE',
                    title: 'Lecture 42 - SHM Class 2',
                    description: 'Advanced concepts in Simple Harmonic Motion with examples.',
                    duration: '1:40:30',
                    views: '1.8M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/kb1p4EmlsgE/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 39
                },
                {
                    id: 'ooycWPirS-o',
                    title: 'Lecture 43 - SHM Class 3',
                    description: 'Problem-solving techniques and applications of Simple Harmonic Motion.',
                    duration: '1:45:15',
                    views: '1.7M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/ooycWPirS-o/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 40
                },
                {
                    id: 'pDdP8f8JoE4',
                    title: 'Physics - Rotational Motion - Complete Chapter',
                    description: 'Detailed explanation of rotational motion, torque, angular momentum and their applications in problem solving.',
                    duration: '1:45:20',
                    views: '1.3M',
                    date: '6 months ago',
                    thumbnail: 'https://img.youtube.com/vi/pDdP8f8JoE4/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 41
                },
                {
                    id: '7Zv8q9qY6Y4',
                    title: 'Physics - Gravitation - Complete Chapter',
                    description: 'Complete chapter on gravitation covering Newton\'s Law of Gravitation, Kepler\'s Laws, and related numerical problems.',
                    duration: '1:30:10',
                    views: '1.6M',
                    date: '5 months ago',
                    thumbnail: 'https://img.youtube.com/vi/7Zv8q9qY6Y4/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 42
                },
                {
                    id: 'aBcDeFgHiJk',
                    title: 'Lecture 44 - Waves and Oscillations - Part 1',
                    description: 'Introduction to waves, types of waves, and their characteristics with practical examples.',
                    duration: '1:50:15',
                    views: '1.9M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/aBcDeFgHiJk/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 43
                },
                {
                    id: 'lMnOpQrY9jK',
                    title: 'Lecture 45 - Waves and Oscillations - Part 2',
                    description: 'Advanced concepts in wave mechanics including superposition and standing waves.',
                    duration: '1:55:30',
                    views: '1.7M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/lMnOpQrY9jK/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 44
                },
                {
                    id: 'pQrStUvWxYz',
                    title: 'Lecture 46 - Thermodynamics - First Law',
                    description: 'Understanding the first law of thermodynamics and its applications in heat engines.',
                    duration: '2:05:45',
                    views: '2.1M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/pQrStUvWxYz/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 45
                },
                {
                    id: 'xYzAbCdEfGh',
                    title: 'Lecture 47 - Thermodynamics - Second Law',
                    description: 'Comprehensive explanation of the second law of thermodynamics and entropy.',
                    duration: '2:10:20',
                    views: '1.9M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/xYzAbCdEfGh/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 46
                },
                {
                    id: 'iJkLmNoPqRs',
                    title: 'Lecture 48 - Electrostatics - Part 1',
                    description: 'Introduction to electric charges, Coulomb\'s law, and electric fields.',
                    duration: '2:15:35',
                    views: '2.3M',
                    date: '1 day ago',
                    thumbnail: 'https://img.youtube.com/vi/iJkLmNoPqRs/maxresdefault.jpg',
                    playlist: 'PLMBDa8Q0jZMrH_cYZ3uWtyfrfAKnGYxqm',
                    playlistIndex: 47
                }
            ]
        },
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
                    id: 'a_QGje5ZU94',
                    title: 'Lecture 11 : \'वेद\' || Ved || History Foundation By Khan Sir',
                    description: 'Comprehensive analysis of the Vedas by Khan Sir, covering the four main Vedas, their significance, and their role in ancient Indian history and culture.',
                    duration: '1:30:00',
                    views: '1.5M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/a_QGje5ZU94/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 20
                },
                {
                    id: 'Z7mhcvERrvw',
                    title: 'Lecture 12: वेद Ved Part 02 History Foundation By Khan Sir',
                    description: 'Continuation of the comprehensive analysis of the Vedas by Khan Sir, exploring deeper aspects of Vedic literature, philosophy, and their significance in ancient Indian history.',
                    duration: '1:35:00',
                    views: '1.4M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/Z7mhcvERrvw/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 21
                },
                {
                    id: 'rSjsP3P7vbk',
                    title: 'Lecture 13: उपनिषद और महाकाव्य (Upanishads and Epics)',
                    description: 'Comprehensive analysis of Upanishads and Indian Epics by Khan Sir, covering their philosophical concepts, historical context, and significance in Indian culture and history.',
                    duration: '1:40:00',
                    views: '1.3M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/rSjsP3P7vbk/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 22
                },
                {
                    id: 'FWphDk23AX4',
                    title: 'Lecture 14: History Foundation Class by Khan Sir',
                    description: 'Comprehensive history foundation class covering important historical concepts and events, essential for competitive exam preparation.',
                    duration: '1:35:00',
                    views: '1.2M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/FWphDk23AX4/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 23
                },
                {
                    id: 'qac8OAiXF1w',
                    title: 'Lecture 15: वैदिक काल (Vedic Period)',
                    description: 'In-depth analysis of the Vedic Period, covering the early and later Vedic ages, society, economy, and religious practices.',
                    duration: '1:40:00',
                    views: '1.3M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/qac8OAiXF1w/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 24
                },
                {
                    id: '5mcHElokRdA',
                    title: 'Lecture 16: वैदिक काल Part 2 (Vedic Period Part 2)',
                    description: 'Continuation of the Vedic Period analysis, focusing on political system, social structure, and cultural aspects of the Vedic age.',
                    duration: '1:38:00',
                    views: '1.2M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/5mcHElokRdA/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 25
                },
                {
                    id: '2RmwA8ljwag',
                    title: 'Lecture 17: History Foundation Class by Khan Sir',
                    description: 'Important concepts and analysis of historical events, designed to strengthen foundation for competitive examinations.',
                    duration: '1:32:00',
                    views: '1.1M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/2RmwA8ljwag/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 26
                },
                {
                    id: 'cgA_8dErCKI',
                    title: 'Lecture 18: History Foundation Class by Khan Sir',
                    description: 'Comprehensive session covering key historical periods and their significance in modern context.',
                    duration: '1:36:00',
                    views: '1.0M',
                    date: '6 months ago',
                    thumbnail: 'https://img.youtube.com/vi/cgA_8dErCKI/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 27
                },
                {
                    id: 'dlqbXwXPlqs',
                    title: 'Lecture 19: History Foundation Class by Khan Sir',
                    description: 'Detailed analysis of important historical events and their impact on modern society.',
                    duration: '1:34:00',
                    views: '1.1M',
                    date: '6 months ago',
                    thumbnail: 'https://img.youtube.com/vi/dlqbXwXPlqs/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 28
                },
                {
                    id: 'LpydqeHkQDo',
                    title: 'Lecture 20: History Foundation Class by Khan Sir',
                    description: 'Final foundation class covering essential historical concepts and exam-oriented preparation strategies.',
                    duration: '1:37:00',
                    views: '1.2M',
                    date: '6 months ago',
                    thumbnail: 'https://img.youtube.com/vi/LpydqeHkQDo/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 29
                },
                {
                    id: 'ROMAN_VIDEO_ID',
                    title: 'Lecture 21: रोमन सभ्यता (Roman Civilization)',
                    description: 'Comprehensive coverage of the Roman Civilization, including its history, governance, architecture, and impact on modern society.',
                    duration: '1:30:00',
                    views: '1.3M',
                    date: '9 months ago',
                    thumbnail: 'https://img.youtube.com/vi/ROMAN_VIDEO_ID/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 30
                },
                {
                    id: 'EGYPTIAN_VIDEO_ID',
                    title: 'Lecture 22: मिस्र की सभ्यता (Egyptian Civilization)',
                    description: 'In-depth analysis of the Ancient Egyptian Civilization, covering its pyramids, pharaohs, religion, and cultural achievements.',
                    duration: '1:28:00',
                    views: '1.4M',
                    date: '8 months ago',
                    thumbnail: 'https://img.youtube.com/vi/EGYPTIAN_VIDEO_ID/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 31
                },
                {
                    id: 'PERSIAN_VIDEO_ID',
                    title: 'Lecture 23: फ़ारस की सभ्यता (Persian Civilization)',
                    description: 'Detailed study of the Persian Empire, its administration, culture, and contributions to world civilization.',
                    duration: '1:20:00',
                    views: '1.2M',
                    date: '8 months ago',
                    thumbnail: 'https://img.youtube.com/vi/PERSIAN_VIDEO_ID/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 32
                },
                {
                    id: 'SPARTA_VIDEO_ID',
                    title: 'Lecture 24: स्पार्टा की सभ्यता (Spartan Civilization)',
                    description: 'Comprehensive analysis of the Spartan society, military system, and its role in ancient Greek history.',
                    duration: '1:22:00',
                    views: '1.1M',
                    date: '7 months ago',
                    thumbnail: 'https://img.youtube.com/vi/SPARTA_VIDEO_ID/maxresdefault.jpg',
                    playlist: 'PL2Li3eVAuCF5wYCN14zMvhL5OZYBoo5RB',
                    playlistIndex: 33
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
