// Import Firebase services
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { showNotification } from './utils/notifications.js';

// Video.js is loaded globally via script tag

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

console.log('Initializing Firebase with config:', firebaseConfig);

// Initialize Firebase
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
}

// Video.js will be initialized with data-setup attribute in HTML

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
        console.log('Initializing page...');
        
        // Check if we're on the history page
        if (window.location.pathname.includes('history.html')) {
            // No auth required for history page
            console.log('Initializing history page...');
            await initHistoryPage();
        } 
        // Check if we're on the admin page
        else if (window.location.pathname.includes('admin.html')) {
            console.log('Initializing admin page...');
            // Only require auth for admin page
            const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in, initialize admin panel
                    console.log('User authenticated, initializing admin panel...');
                    initTeacherPanel();
                } else {
                    // Redirect to login or show login UI
                    console.log('User not authenticated, redirecting to login...');
                    window.location.href = 'login.html';
                }
            });
        }
    } catch (error) {
        console.error('Initialization error:', error);
        if (typeof showNotification === 'function') {
            showNotification('An error occurred while initializing the page.', 'error');
        } else {
            alert('An error occurred while initializing the page: ' + error.message);
        }
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
    try {
        // Get or initialize the player
        let player = videojs.getPlayers()['history-video'] || 
                    videojs('history-video', {
                        techOrder: ['youtube'],
                        controls: true,
                        autoplay: false,
                        preload: 'auto',
                        sources: [],
                        youtube: {
                            ytControls: 2,
                            rel: 0,
                            showinfo: 0,
                            iv_load_policy: 3,
                            modestbranding: 1,
                            enablejsapi: 1
                        }
                    }, function onPlayerReady() {
                        console.log('Video.js player is ready');
                    });
        
        // Handle errors
        player.on('error', function() {
            const error = player.error();
            console.error('Video Player Error:', error);
            showNotification('Error loading video. Please check the video URL and try again.', 'danger');
        });
        
        return player;
    } catch (error) {
        console.error('Error initializing video player:', error);
        showNotification('Error initializing video player. Please refresh the page.', 'danger');
        return null;
    }
}

// Initialize the history page
function initHistoryPage() {
    try {
        // Check if we're on the admin page
        const isAdminPage = document.getElementById('videosList')?.tagName === 'TBODY';
        
        // Initialize UI elements
        const videoPlayer = initVideoPlayer();
        const videoTitle = document.querySelector('.video-title');
        const videoDescription = document.querySelector('.video-description');
        let videoList = document.getElementById('videoList');
        const loadingIndicator = document.querySelector('.loading-overlay');
        
        // Make sure required elements exist
        if (!videoList) {
            console.warn('Video list element not found, trying to find it...');
            videoList = document.querySelector('.list-group');
            
            if (!videoList) {
                console.error('No suitable video list container found');
                return; // Exit if we can't find the video list
            }
            
            console.log('Found video list container:', videoList);
        }
        
        // Create a loading indicator if it doesn't exist
        if (!loadingIndicator) {
            console.warn('Loading indicator element not found, creating one');
            const newLoadingIndicator = document.createElement('div');
            newLoadingIndicator.id = 'loading-indicator';
            newLoadingIndicator.style.display = 'none';
            newLoadingIndicator.style.position = 'fixed';
            newLoadingIndicator.style.top = '50%';
            newLoadingIndicator.style.left = '50%';
            newLoadingIndicator.style.transform = 'translate(-50%, -50%)';
            newLoadingIndicator.innerHTML = 'Loading...';
            document.body.appendChild(newLoadingIndicator);
            window.loadingIndicator = newLoadingIndicator;
        } else {
            window.loadingIndicator = loadingIndicator;
        }
        
        // Load videos from Firestore
        loadVideos();
    } catch (error) {
        console.error('Error initializing history page:', error);
        showNotification('Error initializing page. Please refresh and try again.', 'danger');
    }
    
    // Function to load videos from Firestore
    function loadVideos() {
        const videoList = document.getElementById('videoList');
        
        // Show loading indicator
        if (window.loadingIndicator) {
            window.loadingIndicator.style.display = 'block';
        }
        
        // Clear existing content
        if (videoList) {
            videoList.innerHTML = '';
        } else {
            console.error('Video list element not found');
            if (window.loadingIndicator) {
                window.loadingIndicator.style.display = 'none';
            }
            return null;
        }
        
        try {
            console.log('Querying Khan Sir\'s history videos...');
            
            // First, get all history videos
            const videosQuery = query(
                collection(db, 'videos'),
                where('subject', '==', 'history')
            );
            
            console.log('Querying all history videos...');
            
            // Listen for real-time updates
            console.log('Setting up snapshot listener for videos...');
            return onSnapshot(videosQuery, 
                (snapshot) => {
                    console.log('Received snapshot with', snapshot.size, 'videos');
                    const videos = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        // Only include videos from Khan Sir
                        if (data.teacher && data.teacher.toLowerCase() === 'khan') {
                            console.log('Khan Sir video found:', {
                                id: doc.id,
                                title: data.title,
                                teacher: data.teacher,
                                subject: data.subject
                            });
                            videos.push({
                                id: doc.id,
                                ...data,
                                // Ensure createdAt is a Date object for sorting
                                createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date()
                            });
                        }
                    });
                    
                    // Sort videos by creation date (newest first)
                    videos.sort((a, b) => b.createdAt - a.createdAt);
                    
                    console.log('Rendering', videos.length, 'Khan Sir videos');
                    renderVideos(videos);
                    if (window.loadingIndicator) {
                        window.loadingIndicator.style.display = 'none';
                    }
                },
                (error) => {
                    console.error('Error loading videos:', error);
                    if (window.loadingIndicator) {
                        window.loadingIndicator.style.display = 'none';
                    }
                    if (videoList) {
                        videoList.innerHTML = `
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Error loading videos. Please try again later.
                            </div>`;
                    }
                }
            );
        } catch (error) {
            console.error('Error setting up video query:', error);
            if (window.loadingIndicator) {
                window.loadingIndicator.style.display = 'none';
            }
            if (videoList) {
                videoList.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error setting up video query. Please refresh the page.
                    </div>`;
            }
            return null;
        }
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
        console.log('renderVideos called with:', videosToRender);
        
        if (!videoList) {
            console.error('videoList element not found in renderVideos');
            return;
        }
        
        // Clear existing content
        videoList.innerHTML = '';
        
        if (!videosToRender || videosToRender.length === 0) {
            console.log('No videos to render, showing empty state');
            videoList.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-video-slash fa-3x text-muted mb-3"></i>
                    <p class="h5">No videos found</p>
                    <p class="text-muted">No history videos available at the moment.</p>
                    <button class="btn btn-outline-primary" onclick="window.location.reload()">
                        <i class="fas fa-sync-alt me-1"></i> Refresh
                    </button>
                </div>
            `;
            return;
        }
        
        // Render each video as a list group item
        videosToRender.forEach((video) => {
            const listItem = document.createElement('a');
            listItem.href = '#';
            listItem.className = 'list-group-item list-group-item-action d-flex gap-3 py-3';
            listItem.setAttribute('data-video-id', video.id);
            
            // Create thumbnail column
            const thumbnailCol = document.createElement('div');
            thumbnailCol.className = 'video-thumbnail';
            
            // Use YouTube thumbnail if available, otherwise use a placeholder
            const thumbnailUrl = video.thumbnail || 
                               (video.id ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` : 
                               'https://via.placeholder.com/320x180?text=No+Thumbnail');
            
            thumbnailCol.innerHTML = `
                <img src="${thumbnailUrl}" 
                     alt="${video.title || 'Video thumbnail'}"
                     onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumbnail'">
                <div class="video-play-overlay">
                    <i class="fas fa-play"></i>
                </div>
                ${video.duration ? `
                <span class="video-duration">
                    ${video.duration}
                </span>` : ''}
            `;
            
            // Create content column
            const contentCol = document.createElement('div');
            contentCol.className = 'video-details';
            
            // Format date if available
            const date = video.createdAt ? new Date(video.createdAt.toDate ? video.createdAt.toDate() : video.createdAt) : null;
            const formattedDate = date ? date.toLocaleDateString() : '';
            const formattedTime = date ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
            
            // Build meta information
            const metaInfo = [];
            if (video.teacher) {
                metaInfo.push(`<span class="video-meta-item"><i class="fas fa-chalkboard-teacher"></i>${video.teacher}</span>`);
            }
            if (formattedDate) {
                metaInfo.push(`<span class="video-meta-item"><i class="far fa-calendar-alt"></i>${formattedDate}</span>`);
            }
            if (video.duration) {
                metaInfo.push(`<span class="video-meta-item"><i class="far fa-clock"></i>${video.duration}</span>`);
            }
            
            contentCol.innerHTML = `
                <div>
                    <h3 class="video-item-title">${video.title || 'Untitled Video'}</h3>
                    ${video.description ? `<p class="video-item-description">${video.description}</p>` : ''}
                </div>
                <div class="video-meta">
                    ${metaInfo.join('')}
                </div>`;
            
            // Assemble the list item
            listItem.appendChild(thumbnailCol);
            listItem.appendChild(contentCol);
            
            // Add click handler
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Playing video:', video);
                if (window.playVideo) {
                    window.playVideo(video);
                } else {
                    console.error('playVideo function not found');
                }
            });
            
            videoList.appendChild(listItem);
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
    window.playVideo = async function(video) {
        if (!video || !video.id) return;
        
        console.log('Playing video:', video);
        
        try {
            // Update video info
            const videoTitle = document.querySelector('.video-title');
            const videoDescription = document.querySelector('.video-description');
            
            if (videoTitle) videoTitle.textContent = video.title || 'Untitled Video';
            if (videoDescription) videoDescription.textContent = video.description || 'No description available';
            
            // Update URL with video ID for deep linking
            window.history.pushState({}, '', `#${video.id}`);
            
            // Initialize or update the video player
            if (window.videoPlayer) {
                // If using Video.js
                if (window.videoPlayer.techName_ === 'Youtube') {
                    window.videoPlayer.src({
                        src: `https://www.youtube.com/watch?v=${video.id}`,
                        type: 'video/youtube'
                    });
                } else {
                    window.videoPlayer.src({
                        src: video.videoUrl || `https://www.youtube.com/watch?v=${video.id}`,
                        type: video.videoUrl ? 'video/mp4' : 'video/youtube'
                    });
                }
                window.videoPlayer.play();
            } else {
                // Fallback to native video element if Video.js is not available
                const videoElement = document.querySelector('video');
                if (videoElement) {
                    videoElement.src = video.videoUrl || `https://www.youtube.com/embed/${video.id}`;
                    videoElement.play();
                }
            }
            
            // Mark the video as active in the list
            document.querySelectorAll('.video-item').forEach(item => {
                item.classList.toggle('active', item.getAttribute('data-video-id') === video.id);
            });
            
            // Scroll to the video player
            document.querySelector('.video-container')?.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error playing video:', error);
            if (window.showNotification) {
                showNotification('Error playing video. Please try again.', 'error');
            }
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
