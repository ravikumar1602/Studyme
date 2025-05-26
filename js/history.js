// Import Firebase services
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7tdxFyTOWOqaAxJptAq5vZm92oz1v05M",
  authDomain: "study-portal-bef7a.firebaseapp.com",
  projectId: "study-portal-bef7a",
  storageBucket: "study-portal-bef7a.firebasestorage.app",
  messagingSenderId: "335677529543",
  appId: "1:335677529543:web:0e95959d30b3b3daf4cde2",
  measurementId: "G-DPBGHHW8ZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Helper function to get current user
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize the page
        initHistoryPage();
        
        // Initialize teacher panel
        initTeacherPanel();
    } catch (error) {
        console.error('Error initializing history page:', error);
    }
});

// Initialize teacher panel functionality
function initTeacherPanel() {
    const teacherPanel = document.getElementById('teacherPanel');
    const toggleButton = document.getElementById('teacherPanelToggle');
    const closeButton = document.getElementById('closeTeacherPanel');
    const teacherItems = document.querySelectorAll('.teacher-item');
    const teacherSearch = document.getElementById('teacherSearch');
    
    // Toggle panel on mobile
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            teacherPanel.classList.toggle('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close panel when clicking close button
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            teacherPanel.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && 
            !teacherPanel.contains(e.target) && 
            !toggleButton.contains(e.target)) {
            teacherPanel.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle teacher selection
    teacherItems.forEach(item => {
        item.addEventListener('click', () => {
            const teacherId = item.getAttribute('data-teacher');
            filterVideosByTeacher(teacherId);
            
            // Update active state
            teacherItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Close panel on mobile after selection
            if (window.innerWidth <= 992) {
                teacherPanel.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Handle teacher search
    if (teacherSearch) {
        teacherSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            teacherItems.forEach(item => {
                const teacherName = item.querySelector('h3').textContent.toLowerCase();
                const teacherSubject = item.querySelector('p')?.textContent.toLowerCase() || '';
                
                if (teacherName.includes(searchTerm) || teacherSubject.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

// Filter videos by selected teacher
function filterVideosByTeacher(teacherId) {
    const videoItems = document.querySelectorAll('.video-item');
    let hasMatches = false;
    
    videoItems.forEach(item => {
        const videoTeacher = item.getAttribute('data-teacher') || '';
        
        if (teacherId === 'all' || videoTeacher === teacherId) {
            item.style.display = 'flex';
            hasMatches = true;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show no results message if no matches
    const noResults = document.querySelector('.no-videos');
    if (noResults) {
        noResults.style.display = hasMatches ? 'none' : 'flex';
    }
    
    // Update URL hash
    window.location.hash = teacherId === 'all' ? '' : `#teacher-${teacherId}`;
}

// Initialize the video player
function initVideoPlayer() {
    const videoElement = document.getElementById('history-video');
    
    // Initialize the video player with YouTube tech
    const player = videojs('history-video', {
        techOrder: ['youtube'],
        sources: [{
            type: 'video/youtube',
            src: ''
        }],
        youtube: {
            ytControls: 2,
            customVars: { wmode: 'transparent' },
            rel: 0,
            showinfo: 0,
            modestbranding: 1
        }
    });
    
    return player;
}

// Initialize the history page
function initHistoryPage() {
    // Initialize UI elements
    const videoPlayer = initVideoPlayer();
    const videoTitle = document.querySelector('.video-title');
    const videoDescription = document.querySelector('.video-description');
    const videoList = document.getElementById('video-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Load videos from Firestore
    loadVideos();
    
    // Function to load videos from Firestore
    function loadVideos() {
        loadingIndicator.style.display = 'block';
        videoList.innerHTML = '';
        
        // Query videos for history subject
        const videosQuery = query(
            collection(db, 'videos'),
            where('subject', '==', 'history'),
            orderBy('createdAt', 'desc')
        );
        
        // Listen for real-time updates
        return onSnapshot(videosQuery, 
            (snapshot) => {
                const videos = [];
                snapshot.forEach((doc) => {
                    videos.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                renderVideos(videos);
                loadingIndicator.style.display = 'none';
            },
            (error) => {
                console.error('Error loading videos:', error);
                loadingIndicator.style.display = 'none';
                videoList.innerHTML = '<p class="error">Error loading videos. Please try again later.</p>';
            }
        );
    }
    
    // Format date for display
    function formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format duration in seconds to MM:SS format
    function formatDuration(seconds) {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Render videos in the list
    function renderVideos(videosToRender) {
        if (!videosToRender || videosToRender.length === 0) {
            videoList.innerHTML = `
                <div class="no-videos">
                    <i class="fas fa-video-slash"></i>
                    <p>No videos found</p>
                    <small>No videos available. Check back later for new content.</small>
                </div>
            `;
            return;
        }

        // Clear loading state
        videoList.innerHTML = '';
        
        videosToRender.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'video-item';
            videoElement.setAttribute('data-video-id', video.id);
            
            // Format video duration if available
            const duration = video.duration ? formatDuration(video.duration) : '';
            
            videoElement.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}" 
                         alt="${video.title || 'Video thumbnail'}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/160x90?text=No+Thumbnail'">
                    ${duration ? `<span class="duration">${duration}</span>` : ''}
                </div>
                <div class="video-info">
                    <h3>${video.title || 'Untitled Video'}</h3>
                    ${video.teacherName ? `<p class="teacher">By: ${video.teacherName}</p>` : ''}
                    <p class="date">${formatDate(video.createdAt?.toDate?.() || video.createdAt || new Date())}</p>
                </div>
            `;
            
            // Add click event to play the video
            videoElement.addEventListener('click', () => window.playVideo(video));
            
            videoList.appendChild(videoElement);
        });
        
        // If there's a hash in the URL, try to play that video
        if (window.location.hash) {
            const videoId = window.location.hash.substring(1);
            const video = videosToRender.find(v => v.id === videoId);
            if (video) {
                // Small delay to ensure the player is ready
                setTimeout(() => window.playVideo(video), 500);
            }
        } else if (videosToRender.length > 0) {
            // Auto-play the first video if no hash is present
            setTimeout(() => window.playVideo(videosToRender[0]), 500);
        }
    }
    
    // Play the selected video
    window.playVideo = function(video) {
        if (!video || !video.id) return;
        
        // Update URL with video ID
        window.location.hash = `#${video.id}`;
        
        // Update video player
        if (videoPlayer) {
            // Update the source
            videoPlayer.src({
                src: `https://www.youtube.com/watch?v=${video.id}`,
                type: 'video/youtube'
            });
            
            // Load and play the video
            videoPlayer.ready(() => {
                videoPlayer.play();
            });
            
            // Update video info
            if (videoTitle) videoTitle.textContent = video.title || 'Untitled Video';
            if (videoDescription) {
                videoDescription.textContent = video.description || 'No description available.';
                videoDescription.style.display = video.description ? 'block' : 'none';
            }
            
            // Highlight selected video in the list
            document.querySelectorAll('.video-item').forEach(item => {
                item.classList.toggle('active', item.dataset.videoId === video.id);
                
                // Scroll to the selected video in the list
                if (item.dataset.videoId === video.id) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    };
    
    // Helper function to format date
    function formatDate(date) {
        if (!date) return 'Date not available';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Helper function to format duration (assuming duration is in seconds)
    function formatDuration(seconds) {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const videoId = window.location.hash.substring(1);
        if (videoId) {
            // Find and play the video with this ID
            const video = Array.from(document.querySelectorAll('.video-item'))
                .map(item => ({
                    id: item.dataset.videoId,
                    title: item.querySelector('h3')?.textContent,
                    description: item.querySelector('.video-info p')?.textContent,
                    thumbnail: item.querySelector('img')?.src
                }))
                .find(v => v.id === videoId);
                
            if (video) playVideo(video);
        }
    });
}
