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

// Global function to play a video
window.playVideo = function(video) {
    try {
        console.log('Playing video:', video);
        
        // Get the video container
        const videoContainer = document.querySelector('.video-player-container');
        
        if (!videoContainer) {
            console.error('Video container not found');
            return;
        }
        
        // Show loading state
        videoContainer.classList.add('loading');
        
        // Update URL with video ID for deep linking
        if (video && video.id) {
            const newUrl = window.location.pathname + '?videoId=' + encodeURIComponent(video.id);
            window.history.pushState({ videoId: video.id }, '', newUrl);
        }
        
        // Set the video source (only passing the container)
        setVideoSource(video, videoContainer);
        
    } catch (error) {
        console.error('Error in playVideo:', error);
        // Show user-friendly error message
        const errorMessage = 'Failed to play the video. Please try again.';
        if (typeof showNotification === 'function') {
            showNotification(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        
        // Make sure to remove loading state on error
        const videoContainer = document.querySelector('.video-player-container');
        if (videoContainer) {
            videoContainer.classList.remove('loading');
        }
    }
};

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
    console.log('Initializing video player...');
    
    // Make sure the video player container exists
    const videoContainer = document.getElementById('videoPlayer');
    if (!videoContainer) {
        console.error('Video player container not found');
        return null;
    }
    
    // Clear any existing content
    videoContainer.innerHTML = '';
    
    try {
        // The video player is now automatically initialized by the VideoPlayer class
        // We'll store the player instance on the window for easy access
        window.videoPlayer = new VideoPlayer('videoPlayer', {
            autoplay: true,
            controls: true,
            onReady: (event) => {
                console.log('Video player is ready');
                // Hide any loading indicators
                const loadingIndicator = document.querySelector('.loading-overlay');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                // You can add any custom behavior when player is ready
            },
            onStateChange: (event) => {
                console.log('Player state changed:', event.data);
                // You can add custom behavior on state change
            },
            onError: (event) => {
                console.error('Player error:', event.data);
                // Show error to user
                const errorContainer = document.createElement('div');
                errorContainer.className = 'alert alert-danger';
                errorContainer.textContent = 'Failed to load video. Please try again later.';
                const container = document.getElementById('videoPlayer');
                if (container) {
                    container.appendChild(errorContainer);
                }
                // Hide loading indicator
                const loadingIndicator = document.querySelector('.loading-overlay');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }
        });
        
        return window.videoPlayer;
    } catch (error) {
        console.error('Error initializing video player:', error);
        return null;
    }
    
    // Return a simple interface for compatibility
    return {
        src: function(source) {
            if (source && source.src) {
                const videoId = extractVideoId(source.src);
                if (videoId && window.videoPlayer) {
                    window.videoPlayer.loadVideo(videoId);
                }
            }
        },
        play: function() {
            if (window.videoPlayer) {
                window.videoPlayer.play();
            }
        },
        pause: function() {
            if (window.videoPlayer) {
                window.videoPlayer.pause();
            }
        },
        currentTime: function(seconds) {
            // This is a simplified version - for full implementation,
            // you would need to track the current time manually
            return 0;
        },
        duration: function() {
            // This is a simplified version - for full implementation,
            // you would need to track the duration
            return 0;
        },
        on: function(event, callback) {
            // Simple event handling
            console.log('Event listener added for:', event);
        },
        off: function(event) {
            // Simple event handling
            console.log('Event listener removed for:', event);
        }
    };
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
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
        console.log('loadVideos function called');
        const videoList = document.getElementById('videoList');
        const loadingOverlay = document.getElementById('loadingOverlay');

        // Show loading indicator
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }

        // Clear existing content
        if (videoList) {
            videoList.innerHTML = `
                <div class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 mb-0 text-muted">Loading videos...</p>
                </div>
            `;
        } else {
            console.error('Video list element not found');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            showNotification('Error: Video list container not found', 'error');
            return null;
        }

        try {
            console.log('Setting up Firestore query...');

            // First, try to get all videos from the 'videos' collection
            const videosRef = collection(db, 'videos');
            console.log('Created reference to videos collection');

            // Create a query (without any filters for now)
            const videosQuery = query(videosRef);
            console.log('Created query object');

            // Log the query for debugging
            console.log('Query object:', videosQuery);

            // Show loading state
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
                loadingOverlay.innerHTML = `
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading videos from database...</p>
                    </div>`;
            }

            console.log('Setting up snapshot listener for videos...');
            return onSnapshot(videosQuery,
                (snapshot) => {
                    console.log('Received snapshot with', snapshot.size, 'documents');

                    if (snapshot.empty) {
                        console.warn('No videos found in the collection');
                        showNotification('No videos found in the database', 'warning');
                        renderVideos([]);
                        hideLoadingOverlay();
                        return;
                    }

                    const videos = [];
                    let foundVideos = 0;

                    snapshot.forEach((doc) => {
                        try {
                            const data = doc.data();
                            console.log(`Processing video #${foundVideos + 1}:`, {
                                id: doc.id,
                                title: data.title || 'No title',
                                teacher: data.teacher || 'Unknown',
                                subject: data.subject || 'No subject',
                                url: data.url || 'No URL'
                            });

                            videos.push({
                                id: doc.id,
                                ...data,
                                createdAt: data.createdAt
                                    ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
                                    : new Date()
                            });
                            foundVideos++;
                        } catch (error) {
                            console.error(`Error processing document ${doc.id}:`, error);
                        }
                    });

                    console.log(`Successfully processed ${foundVideos} videos`);

                    if (videos.length === 0) {
                        console.warn('No valid videos found after processing');
                        showNotification('No valid videos found in the database', 'warning');
                        renderVideos([]);
                        hideLoadingOverlay();
                        return;
                    }

                    videos.sort((a, b) => a.createdAt - b.createdAt);
                    console.log(`Rendering ${videos.length} videos`);
                    renderVideos(videos);
                    hideLoadingOverlay();

                    // Check for video ID in URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const videoIdFromUrl = urlParams.get('videoId');
                    
                    if (videoIdFromUrl) {
                        // Find the video with the matching ID
                        const videoToPlay = videos.find(video => video.id === videoIdFromUrl);
                        if (videoToPlay) {
                            console.log('Playing video from URL parameter:', videoIdFromUrl);
                            setTimeout(() => window.playVideo(videoToPlay), 500);
                        } else {
                            console.warn('Video not found with ID:', videoIdFromUrl);
                            // Fallback to first video
                            if (videos.length > 0) {
                                console.log('Video not found, playing first video instead');
                                setTimeout(() => window.playVideo(videos[0]), 500);
                            }
                        }
                    } 
                    // Auto-play the first video if no specific video ID is provided
                    else if (videos.length > 0) {
                        console.log('Auto-playing first video');
                        setTimeout(() => window.playVideo(videos[0]), 500);
                    }
                },
                (error) => {
                    console.error('Error loading videos:', error);
                    const loadingOverlay = document.getElementById('loadingOverlay');
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                    if (videoList) {
                        videoList.innerHTML = `
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Error loading videos. Please try again later.
                                <button class="btn btn-sm btn-outline-danger ms-2" onclick="window.location.reload()">
                                    <i class="fas fa-sync-alt me-1"></i> Retry
                                </button>
                            </div>`;
                    }
                }
            );
        } catch (error) {
            console.error('Error setting up video query:', error);
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            if (videoList) {
                videoList.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error setting up video query. 
                        <button class="btn btn-sm btn-outline-danger ms-2" onclick="window.location.reload()">
                            <i class="fas fa-sync-alt me-1"></i> Refresh Page
                        </button>
                    </div>`;
            }
            return null;
        }
    }

    // Helper function to hide loading overlay
    function hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
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

        // Get the video list container
        const videoList = document.getElementById('videoList');

        if (!videoList) {
            console.error('videoList element not found in renderVideos');
            return;
        }

        // Hide loading indicator if it exists
        if (window.loadingIndicator) {
            window.loadingIndicator.style.display = 'none';
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

            // Function to validate YouTube video ID
            const isValidYoutubeId = (id) => {
                if (!id) return false;
                // Basic validation for YouTube video ID (11 characters, alphanumeric plus - and _)
                return /^[a-zA-Z0-9_-]{11}$/.test(id);
            };

            // Create a simple SVG placeholder as a data URL
            const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle'%3ENo Thumbnail%3C/text%3E%3C/svg%3E`;

            // Get thumbnail URL with fallbacks
            let thumbnailUrl = placeholderSvg; // Default to data URL

            if (video.thumbnail) {
                // Use provided thumbnail if available
                thumbnailUrl = video.thumbnail;
            } else if (video.id && isValidYoutubeId(video.id)) {
                // Generate YouTube thumbnail URL if we have a valid YouTube ID
                thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
            }

            thumbnailCol.innerHTML = `
                <img src="${thumbnailUrl}" 
                     alt="${video.title || 'Video thumbnail'}"
                     onerror="this.onerror=null; this.src='${placeholderSvg}';">
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
            const formattedTime = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

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
        // Get video container at the start of the function
        const videoContainer = document.querySelector('.video-player-container');
        
        try {
            // Validate input
            if (!video) {
                throw new Error('No video object provided');
            }
            
            if (!videoContainer) {
                throw new Error('Video container not found');
            }

            // Show loading state
            videoContainer.innerHTML = '<div class="text-center p-4">Loading video...</div>';
            videoContainer.classList.add('loading');
            
            // Extract video ID from URL if it exists
            let videoId = video.id || '';
            if (video.url) {
                try {
                    const url = new URL(video.url);
                    // Handle youtu.be short URLs
                    if (url.hostname.includes('youtu.be')) {
                        const pathParts = url.pathname.split('/').filter(Boolean);
                        if (pathParts.length > 0) {
                            videoId = pathParts[0].split('?')[0];
                        }
                    } 
                    // Handle youtube.com URLs
                    else if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')) {
                        if (url.searchParams.has('v')) {
                            videoId = url.searchParams.get('v');
                        } else if (url.pathname.startsWith('/embed/')) {
                            const pathParts = url.pathname.split('/');
                            if (pathParts.length > 2) {
                                videoId = pathParts[2].split('?')[0];
                            }
                        }
                    }
                    console.log('Extracted video ID:', videoId);
                } catch (e) {
                    console.warn('Error parsing video URL:', e);
                    // Continue with the original videoId if URL parsing fails
                }
            }
            
            // Validate the video ID format
            if (!isValidYouTubeId(videoId)) {
                console.error('Invalid YouTube video ID format:', videoId);
                throw new Error('The video link is not in a valid format. Please check the URL.');
            }
            
            // Create a new video object with the extracted ID
            const videoWithId = { ...video, id: videoId };
            
            // Create elements if they don't exist
            let videoTitle = document.querySelector('.video-title');
            let videoDescription = document.querySelector('.video-description');
            
            if (!videoTitle || !videoDescription) {
                const videoInfo = document.querySelector('.video-info');
                if (videoInfo) {
                    if (!videoTitle) {
                        videoTitle = document.createElement('h2');
                        videoTitle.className = 'video-title mb-3';
                        videoInfo.prepend(videoTitle);
                    }
                    if (!videoDescription) {
                        videoDescription = document.createElement('div');
                        videoDescription.className = 'video-description text-muted';
                        videoInfo.appendChild(videoDescription);
                    }
                }
            }
            // Update video info with the video that has the correct ID
            if (videoTitle) videoTitle.textContent = videoWithId.title || 'Untitled Video';
            if (videoDescription) videoDescription.textContent = videoWithId.description || 'No description available';
            
            // Set the video source with the video object containing the correct ID
            setVideoSource(videoWithId, videoContainer);
            
            // Mark the video as active in the list and scroll to it
            document.querySelectorAll('.video-item').forEach(item => {
                const isActive = item.getAttribute('data-video-id') === videoWithId.id;
                item.classList.toggle('active', isActive);
                
                // Scroll the active item into view if it's not visible
                if (isActive) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
            
            // Scroll the video player into view
            const playerElement = document.querySelector('.video-player-container');
            if (playerElement) {
                playerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
        } catch (error) {
            console.error('Error in playVideo:', error);
            // Show user-friendly error message
            const errorMessage = error.message || 'An error occurred while playing the video';
            if (typeof showNotification === 'function') {
                showNotification(errorMessage, 'error');
            } else {
                alert(errorMessage);
            }
            
            // Show error in the video container if available
            if (videoContainer) {
                videoContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <p>${errorMessage}</p>
                        <button onclick="window.location.reload()" class="btn btn-sm btn-outline-secondary mt-2">
                            Refresh Page
                        </button>
                    </div>
                `;
            }
        } finally {
            // Hide loading state
            if (videoContainer) {
                videoContainer.classList.remove('loading');
            }
            
            // Clean up any video element reference if it exists
            try {
                const videoElement = document.querySelector('video');
                if (videoElement) {
                    videoElement.style.opacity = '1';
                    videoElement.style.transition = 'opacity 0.3s ease';
                }
            } catch (e) {
                console.warn('Error cleaning up video element:', e);
            }
        }
    };
}

// Set video source based on type (YouTube or direct URL)
const setVideoSource = (video, container) => {
    // Make sure we have a valid container
    const videoContainer = container || document.querySelector('.video-player-container');
    
    if (!videoContainer) {
        console.error('Video container not found');
        return;
    }
    
    try {
        console.log('Setting video source for video:', video);
        
        // Clear any existing player
        if (window.youTubePlayer) {
            try {
                if (typeof window.youTubePlayer.destroy === 'function') {
                    window.youTubePlayer.destroy();
                } else if (window.youTubePlayer.parentNode) {
                    window.youTubePlayer.parentNode.removeChild(window.youTubePlayer);
                }
            } catch (e) {
                console.warn('Error disposing existing player:', e);
            } finally {
                window.youTubePlayer = null;
            }
        }
        
        // Clear the video container
        videoContainer.innerHTML = `
            <div id="youtubePlayer"></div>
            <!-- Custom Video Controls -->
            <div class="custom-video-controls">
                <div class="progress-container" id="progressContainer">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="controls-row">
                    <div class="left-controls">
                        <button class="control-btn" id="playPauseBtn" title="Play/Pause">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="control-btn" id="skipBackwardBtn" title="Skip Back 10s">
                            <i class="fas fa-backward"></i> 10s
                        </button>
                        <button class="control-btn" id="skipForwardBtn" title="Skip Forward 10s">
                            10s <i class="fas fa-forward"></i>
                        </button>
                        <div class="time-display">
                            <span id="currentTime">0:00</span> / <span id="duration">0:00</span>
                        </div>
                    </div>
                    <div class="right-controls">
                        <div class="speed-menu">
                            <button class="control-btn" id="speedBtn" title="Playback Speed">
                                <i class="fas fa-tachometer-alt"></i> 1x
                            </button>
                            <div class="menu-content" id="speedMenu">
                                <button data-speed="0.5">0.5x</button>
                                <button data-speed="0.75">0.75x</button>
                                <button data-speed="1" class="active">1x</button>
                                <button data-speed="1.25">1.25x</button>
                                <button data-speed="1.5">1.5x</button>
                                <button data-speed="2">2x</button>
                            </div>
                        </div>
                        <div class="quality-menu">
                            <button class="control-btn" id="qualityBtn" title="Quality">
                                <i class="fas fa-cog"></i>
                            </button>
                            <div class="menu-content" id="qualityMenu">
                                <button data-quality="auto">Auto</button>
                                <button data-quality="hd1080">1080p</button>
                                <button data-quality="hd720">720p</button>
                                <button data-quality="large">480p</button>
                                <button data-quality="medium">360p</button>
                                <button data-quality="small">240p</button>
                            </div>
                        </div>
                        <button class="control-btn fullscreen-btn" id="fullscreenBtn" title="Fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        videoContainer.classList.add('loading');
        
        let videoId = '';
        
        // First, check if the video object has a direct videoId property
        if (video && video.videoId) {
            console.log('Using video.videoId:', video.videoId);
            videoId = video.videoId;
        }
        // If no direct videoId, try to extract from URL
        else if (video && video.url) {
            console.log('Video URL found, extracting ID:', video.url);
            try {
                const url = new URL(video.url);
                if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
                    if (url.searchParams.has('v')) {
                        videoId = url.searchParams.get('v');
                    } else if (url.hostname.includes('youtu.be')) {
                        videoId = url.pathname.split('/').pop();
                    }
                    console.log('Extracted video ID from URL:', videoId);
                } else {
                    console.log('Not a YouTube URL, using as direct video source');
                    // Handle direct video URL (MP4, etc.)
                    videoContainer.innerHTML = `
                        <video id="videoPlayer" class="video-js" controls preload="auto" width="100%" height="100%">
                            <source src="${video.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                    videoContainer.classList.remove('loading');
                    return;
                }
            } catch (e) {
                console.warn('Error parsing video URL:', e);
            }
        }
        
        // If we still don't have a video ID, use the document ID as a last resort
        if (!videoId && video && video.id) {
            console.log('Using document ID as fallback:', video.id);
            videoId = video.id;
        }
        
        // Validate the video ID before using it
        if (!isValidYouTubeId(videoId)) {
            console.error('Invalid YouTube video ID:', videoId);
            videoContainer.innerHTML = `
                <div class="alert alert-danger">
                    <p>Error: Invalid video ID format</p>
                    <p>Please check the video configuration in the admin panel.</p>
                    <p>Video ID: ${videoId}</p>
                </div>`;
            videoContainer.classList.remove('loading');
            return;
        }
        
        console.log('Using YouTube video ID:', videoId);
        
        // Load the YouTube IFrame API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            // Create a promise that resolves when the API is ready
            window.onYouTubeIframeAPIReady = function() {
                console.log('YouTube API ready');
                createYouTubePlayer(videoId, videoContainer);
            };
        } else {
            // If API is already loaded, create the player directly
            createYouTubePlayer(videoId, videoContainer);
        }
    } catch (error) {
        console.error('Error in setVideoSource:', error);
        videoContainer.innerHTML = `<div class="alert alert-danger">Error loading video: ${error.message}</div>`;
        videoContainer.classList.remove('loading');
    }
};

// Function to validate YouTube video ID
function isValidYouTubeId(id) {
    if (!id || typeof id !== 'string') {
        return false;
    }
    
    // Basic character set validation - only allow valid YouTube ID characters
    const validChars = /^[a-zA-Z0-9_-]+$/;
    if (!validChars.test(id)) {
        console.warn('Video ID contains invalid characters:', id);
        return false;
    }
    
    // Basic length check (YouTube IDs are typically 11 chars, but can vary)
    if (id.length < 10 || id.length > 20) {
        console.warn('Video ID length is unusual:', id.length);
        // Don't return false here as some valid IDs might be outside this range
    }
    
    return true;
}

// Function to create YouTube player
async function createYouTubePlayer(videoId, container) {
    console.log('createYouTubePlayer called with videoId:', videoId);
    
    // Make sure we have a valid container
    const playerContainer = container || document.querySelector('.video-player-container');
    
    if (!playerContainer) {
        console.error('YouTube Player container not found');
        return;
    }
    
    // Clear any existing player
    if (window.youTubePlayer) {
        try {
            window.youTubePlayer.destroy();
        } catch (e) {
            console.warn('Error destroying existing player:', e);
        }
        window.youTubePlayer = null;
    }
    
    // Initialize player variables
    let player;
    let isPlaying = false;
    let currentSpeed = 1;
    let updateInterval;
    
    // Check if YouTube API is available
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.log('YouTube API not loaded yet, will initialize when ready');
        window.pendingVideoId = videoId;
        window.pendingContainer = playerContainer;
        
        // Set up the API ready handler if not already set
        if (!window.ytApiReadyHandlerSet) {
            window.ytApiReadyHandlerSet = true;
            window.onYouTubeIframeAPIReady = function() {
                console.log('YouTube API is now ready');
                if (window.pendingVideoId) {
                    createYouTubePlayer(window.pendingVideoId, window.pendingContainer);
                }
            };
        }
        return;
    }
    
    // Create the player
    try {
        console.log('Creating YouTube player with video ID:', videoId);
        
        // First try with standard parameters
        const standardPlayerPromise = new Promise((resolve) => {
            const standardPlayer = new YT.Player('youtubePlayer', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'rel': 0,
                    'modestbranding': 1,
                    'controls': 1,  // Try with native controls first
                    'enablejsapi': 1,
                    'origin': window.location.origin,
                    'fs': 1,
                    'iv_load_policy': 3,
                    'autoplay': 0
                },
                events: {
                    'onReady': (event) => {
                        console.log('Standard player ready');
                        resolve({ type: 'success', player: event.target });
                    },
                    'onError': (error) => {
                        console.error('Standard player error:', error);
                        resolve({ type: 'error', error });
                    }
                }
            });
            
            // Set a timeout in case the player gets stuck
            setTimeout(() => {
                if (standardPlayer.getPlayerState) {
                    const state = standardPlayer.getPlayerState();
                    if (state === -1 || state === 0) {
                        resolve({ type: 'timeout' });
                    }
                } else {
                    resolve({ type: 'timeout' });
                }
            }, 5000);
        });

        // Try with standard player first
        const standardResult = await standardPlayerPromise;
        if (standardResult.type === 'success') {
            player = standardResult.player;
            window.youTubePlayer = player;
            setupCustomControls();
            updateDuration();
            return;
        }
        
        console.log('Standard player failed, trying alternative approach...');

        // If standard player fails, try with iframe API
        try {
            const iframe = document.createElement('iframe');
            iframe.id = 'youtubeIframe';
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            // Clear previous content
            playerContainer.innerHTML = '';
            playerContainer.appendChild(iframe);
            
            // Hide custom controls since we're using native ones
            const controls = document.querySelector('.custom-video-controls');
            if (controls) {
                controls.style.display = 'none';
            }
            
            return;
        } catch (error) {
            console.error('Iframe approach failed:', error);
            throw error; // Will be caught by the outer try-catch
        }
        
    } catch (error) {
        console.error('Error creating YouTube player:', error);
        showEmbedError(videoId, playerContainer);
    }
    
    // Show embed error message
    function showEmbedError(videoId, container) {
        console.log('Showing embed error for video:', videoId);
        // Show alternative content or message
        const errorContainer = document.createElement('div');
        errorContainer.className = 'embed-error-message';
        errorContainer.innerHTML = `
            <div class="alert alert-warning">
                <h4>This video cannot be played directly</h4>
                <p>Please watch this video on YouTube:</p>
                <a href="https://www.youtube.com/watch?v=${videoId}" 
                   target="_blank" 
                   class="btn btn-primary">
                    Watch on YouTube
                </a>
            </div>
        `;
        
        // Clear the player container
        const playerElement = document.getElementById('youtubePlayer');
        if (playerElement) {
            playerElement.style.display = 'none';
        }
        
        // Add error message
        container.appendChild(errorContainer);
        
        // Make sure controls are hidden since we can't play the video
        const controls = document.querySelector('.custom-video-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }
    
    // Player ready handler
    function onPlayerReady(event) {
        console.log('YouTube player ready');
        
        // Make sure player is accessible
        window.youTubePlayer = player;
        
        // Setup controls
        setupCustomControls();
        updateDuration();
        
        // Force show controls initially
        const controls = document.querySelector('.custom-video-controls');
        if (controls) {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
            controls.style.display = 'flex';
        }
        
        // Start update interval
        updateInterval = setInterval(updateProgress, 1000);
    }
    
    // Player state change handler
    function onPlayerStateChange(event) {
        const playPauseBtn = document.getElementById('playPauseBtn');
        
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                isPlaying = true;
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                break;
            case YT.PlayerState.PAUSED:
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                break;
            case YT.PlayerState.ENDED:
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-redo"></i>';
                break;
        }
    }
    
    // Player error handler
    function onPlayerError(event) {
        // Validate video ID
        if (!isValidYouTubeId(videoId)) {
            console.error('Invalid YouTube video ID:', videoId);
            const errorContainer = document.createElement('div');
            errorContainer.className = 'alert alert-danger';
            errorContainer.textContent = `Invalid YouTube video ID: ${videoId}`;
            container.appendChild(errorContainer);
            return;
        }
        console.error('YouTube Player Error:', event);
        const errorContainer = playerContainer.querySelector('.error-message') || document.createElement('div');
        errorContainer.className = 'alert alert-danger';
        errorContainer.textContent = 'Error loading video. Please try again later.';
        playerContainer.appendChild(errorContainer);
    }
    
    // Update video progress
    function updateProgress() {
        if (!player || !player.getCurrentTime) return;
        
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        if (isNaN(duration)) return;
        
        const progress = (currentTime / duration) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        
        // Update time display
        document.getElementById('currentTime').textContent = formatTime(currentTime);
    }
    
    // Format time in MM:SS format
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    // Update video duration
    function updateDuration() {
        const duration = player.getDuration();
        if (isNaN(duration)) {
            // Try again after a short delay if duration isn't available yet
            setTimeout(updateDuration, 500);
            return;
        }
        document.getElementById('duration').textContent = formatTime(duration);
    }
    
    // Setup custom controls event listeners
    function setupCustomControls() {
        console.log('Setting up custom controls...');
        
        // Make sure controls are visible
        const controls = document.querySelector('.custom-video-controls');
        const playerContainer = document.querySelector('.video-player-container');
        if (!controls || !playerContainer) {
            console.error('Required elements not found in DOM');
            return;
        }
        
        // Always show controls by default
        controls.style.opacity = '1';
        controls.style.visibility = 'visible';
        controls.style.display = 'flex';
        
        // Add class to detect touch devices
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            document.documentElement.classList.add('touch-device');
            // Keep controls always visible on touch devices
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
        }
        
        // Function to show controls (kept for compatibility)
        const showControls = () => {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
            controls.style.display = 'flex';
        };
        
        // Function to hide controls (kept for compatibility but won't hide on touch devices)
        const hideControls = () => {
            if (!isTouchDevice) {
                controls.style.opacity = '0';
            }
        };
        

        
        // Initial setup - always show controls
        showControls();
        
        // Force show controls in case they were hidden by any other script
        const forceShowControls = () => {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
            controls.style.display = 'flex';
        };
        
        // Run immediately and periodically to ensure controls stay visible
        forceShowControls();
        setInterval(forceShowControls, 1000);
        
        // Add event listeners for hover and focus
        const controlEvents = ['mouseenter', 'mouseleave', 'mousemove', 'touchstart', 'touchend', 'focusin', 'focusout'];
        controlEvents.forEach(event => {
            playerContainer.addEventListener(event, (e) => {
                if (event === 'mouseenter' || event === 'mousemove' || event === 'touchstart' || event === 'focusin') {
                    showControls();
                } else if (event === 'mouseleave' || event === 'touchend' || event === 'focusout') {
                    // Don't hide if mouse moved to controls
                    if (!e.relatedTarget || !controls.contains(e.relatedTarget)) {
                        hideControls();
                    }
                }
            }, { passive: true });
        });
        
        // Keep controls visible when interacting with them
        controls.addEventListener('mouseenter', showControls, { passive: true });
        controls.addEventListener('mouseleave', () => {
            if (!isTouchDevice) {
                hideControls();
            }
        }, { passive: true });
        
        // Show controls when video is paused
        playerContainer.addEventListener('play', () => {
            playerContainer.classList.remove('paused');
            if (!isTouchDevice) {
                setTimeout(hideControls, 2000);
            }
        });
        
        playerContainer.addEventListener('pause', () => {
            playerContainer.classList.add('paused');
            showControls();
        });
        
        // Show controls when tabbing to them
        controls.addEventListener('focusin', showControls, { passive: true });
        controls.addEventListener('focusout', (e) => {
            if (!playerContainer.contains(e.relatedTarget)) {
                hideControls();
            }
        }, { passive: true });
        
        // Add touch event listeners for progress bar
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.addEventListener('touchstart', handleProgressBarTouch, { passive: true });
            progressContainer.addEventListener('touchmove', handleProgressBarTouch, { passive: false });
            progressContainer.addEventListener('touchend', handleProgressBarTouch, { passive: true });
            
            // Also handle mouse events for desktop
            progressContainer.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // Only left mouse button
                    handleProgressBarTouch(e);
                    const onMouseMove = (e) => handleProgressBarTouch(e);
                    const onMouseUp = (e) => {
                        handleProgressBarTouch(e);
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                }
            });
        }
        
        // Helper function to detect mobile devices
        function isMobileDevice() {
            return (typeof window.orientation !== 'undefined') || 
                   (navigator.userAgent.indexOf('IEMobile') !== -1);
        }
        
        // Handle progress bar touch events
        function handleProgressBarTouch(e) {
            if (!player || !player.getDuration) return;
            
            e.preventDefault();
            const progressContainer = document.getElementById('progressContainer');
            if (!progressContainer) return;
            
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const totalWidth = rect.width;
            const percentage = Math.min(Math.max(pos / totalWidth, 0), 1);
            const duration = player.getDuration();
            const newTime = duration * percentage;
            
            // Update progress bar
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = `${percentage * 100}%`;
            }
            
            // Update time display
            const currentTimeDisplay = document.getElementById('currentTime');
            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = formatTime(newTime);
            }
            
            // Seek on touch end
            if (e.type === 'touchend') {
                player.seekTo(newTime, true);
            }
        }
        
        // Play/Pause button
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            if (!player) return;
            
            if (isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        });
        
        // Skip backward 10 seconds
        document.getElementById('skipBackwardBtn').addEventListener('click', () => {
            if (!player) return;
            const currentTime = player.getCurrentTime();
            player.seekTo(Math.max(0, currentTime - 10), true);
        });
        
        // Skip forward 10 seconds
        document.getElementById('skipForwardBtn').addEventListener('click', () => {
            if (!player) return;
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            player.seekTo(Math.min(duration, currentTime + 10), true);
        });
        
        // Progress bar click to seek
        document.getElementById('progressContainer').addEventListener('click', (e) => {
            if (!player) return;
            const progressContainer = e.currentTarget;
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const duration = player.getDuration();
            player.seekTo(duration * pos, true);
        });
        
        // Playback speed controls
        document.querySelectorAll('#speedMenu button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseFloat(e.target.dataset.speed);
                if (!isNaN(speed)) {
                    player.setPlaybackRate(speed);
                    currentSpeed = speed;
                    document.getElementById('speedBtn').innerHTML = 
                        `<i class="fas fa-tachometer-alt"></i> ${speed}x`;
                    
                    // Update active state
                    document.querySelectorAll('#speedMenu button').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });
        
        // Quality controls (note: YouTube's quality settings are limited by API)
        document.querySelectorAll('#qualityMenu button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const quality = e.target.dataset.quality;
                if (!player || !quality) return;
                
                try {
                    // This is a workaround as the YouTube API has limited quality control
                    const qualities = await player.getAvailableQualityLevels();
                    if (qualities.includes(quality.toUpperCase())) {
                        player.setPlaybackQuality(quality);
                        e.target.classList.add('active');
                    } else if (quality === 'auto') {
                        player.setPlaybackQuality('default');
                        e.target.classList.add('active');
                    }
                } catch (error) {
                    console.error('Error setting quality:', error);
                }
            });
        });
        
        // Fullscreen toggle
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            const container = document.getElementById('videoPlayerContainer');
            
            if (!document.fullscreenElement) {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) { /* Safari */
                    container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) { /* IE11 */
                    container.msRequestFullscreen();
                }
                document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
                document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
            }
        });
        
        // Handle fullscreen change
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('mozfullscreenchange', updateFullscreenButton);
        document.addEventListener('MSFullscreenChange', updateFullscreenButton);
        
        function updateFullscreenButton() {
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (document.fullscreenElement) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                fullscreenBtn.title = 'Exit Fullscreen';
            } else {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.title = 'Fullscreen';
            }
        }
    }
    
    // Clean up on player destroy
    const cleanup = () => {
        console.log('Cleaning up YouTube player');
        if (updateInterval) clearInterval(updateInterval);
        
        // Remove event listeners
        const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        events.forEach(event => {
            document.removeEventListener(event, updateFullscreenButton);
        });
        
        // Ensure controls are visible when player is recreated
        const controls = document.querySelector('.custom-video-controls');
        if (controls) {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
            controls.style.display = 'flex';
        }
    };
    
    // Store cleanup function for later use
    window.cleanupYouTubePlayer = cleanup;
    
    // Function to validate YouTube video ID
    function validateYouTubeId(id) {
        if (!id || typeof id !== 'string') {
            return false;
        }
        
        // Basic character set validation - only allow valid YouTube ID characters
        const validChars = /^[a-zA-Z0-9_-]+$/;
        if (!validChars.test(id)) {
            console.warn('Video ID contains invalid characters:', id);
            return false;
        }
        
        // Basic length check (YouTube IDs are typically 11 chars, but can vary)
        if (id.length < 10 || id.length > 20) {
            console.warn('Video ID length is unusual:', id.length);
            // Don't return false here as some valid IDs might be outside this range
        }
        
        return true;
    }
    
    // Validate video ID before creating player
    if (!validateYouTubeId(videoId)) {
        console.error('Invalid YouTube video ID:', videoId);
        const errorContainer = document.createElement('div');
        errorContainer.className = 'alert alert-danger';
        errorContainer.textContent = 'Invalid YouTube video ID. Please check the video link.';
        container.appendChild(errorContainer);
        return cleanup;
    }
    
    try {
        console.log('Creating YouTube player for video:', videoId);
        
        // Clear any existing player
        if (window.youTubePlayer) {
            try {
                window.youTubePlayer.destroy();
            } catch (e) {
                console.warn('Error destroying existing player:', e);
            }
            window.youTubePlayer = null;
        }

        // Create a new player instance
        const playerElement = document.createElement('div');
        playerElement.id = 'youtubePlayer';
        playerContainer.innerHTML = '';
        playerContainer.appendChild(playerElement);
        
        // Store the current video ID for later use
        window.currentVideoId = videoId;
        
        // Create the YouTube player with enhanced configuration
        window.youTubePlayer = new YT.Player('youtubePlayer', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'enablejsapi': 1,
                'origin': window.location.origin,
                'rel': 0,
                'modestbranding': 1,
                'playsinline': 1,
                'fs': 1,
                'iv_load_policy': 3,  // Hide annotations
                'disablekb': 0,       // Enable keyboard controls
                'cc_load_policy': 0,  // Hide captions by default
                'widget_referrer': window.location.href
            },
            events: {
                'onReady': function(event) {
                    console.log('YouTube Player is ready');
                    playerContainer.classList.remove('loading');
                    event.target.playVideo();
                    
                    // Mark the video as active in the list and scroll to it
                    const activeVideoId = window.currentVideoId || '';
                    if (activeVideoId) {
                        document.querySelectorAll('.video-item').forEach(item => {
                            const itemId = item.getAttribute('data-video-id');
                            const isActive = itemId === activeVideoId;
                            item.classList.toggle('active', isActive);
                            
                            if (isActive) {
                                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                        });
                    }
                },
                'onStateChange': function(event) {
                    console.log('Player state changed:', event.data);
                },
                'onError': function(error) {
                    console.error('YouTube Player error:', error);
                    handleYouTubeError(error, videoId, playerContainer);
                }
            }
        });

        // Scroll the video player into view
        const playerContainerElement = container || document.querySelector('.video-player-container');
        if (playerContainerElement) {
            playerContainerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (error) {
        console.error('Error in createYouTubePlayer:', error);
        handleYouTubeError(error, videoId, playerContainer);
    }
}

// Handle YouTube player errors with detailed messages
function handleYouTubeError(error, videoId, container) {
    console.error('Handling YouTube error:', error);
    
    if (!container) {
        console.error('No container provided for error handling');
        return;
    }
    
    // Determine error message based on error code
    let errorMessage = 'An error occurred while loading the video. ';
    let showRefresh = true;
    
    if (error && error.data) {
        switch(error.data) {
            case 2:
                errorMessage = 'The video ID appears to be invalid. Please check the video link.';
                showRefresh = false;
                break;
            case 5:
                errorMessage = 'This video cannot be played in the current player. Trying alternative method...';
                break;
            case 100:
                errorMessage = 'The requested video was not found. It may have been removed or made private.';
                showRefresh = false;
                break;
            case 101:
            case 150:
                errorMessage = 'This video cannot be played due to embedding restrictions.';
                showRefresh = false;
                break;
            default:
                errorMessage = 'An error occurred while loading the video. Trying alternative method...';
        }
    }
    
    // Show error message and loading state
    container.innerHTML = `
        <div class="alert ${showRefresh ? 'alert-warning' : 'alert-danger'}">
            <p>${errorMessage}</p>
            ${showRefresh ? '<div id="fallbackPlayer" class="mt-3"></div>' : ''}
            ${!showRefresh ? `
                <div class="mt-3">
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="btn btn-primary">
                        Watch on YouTube
                    </a>
                </div>` : ''}
        </div>
    `;
    container.classList.remove('loading');

    // Clean up any existing player
    if (window.youTubePlayer) {
        try {
            if (typeof window.youTubePlayer.destroy === 'function') {
                window.youTubePlayer.destroy();
            }
        } catch (e) {
            console.error('Error destroying player:', e);
        } finally {
            window.youTubePlayer = null;
        }
    }

    // Only try fallback for certain error types
    if (showRefresh) {
        try {
            const fallbackPlayer = document.getElementById('fallbackPlayer');
            if (fallbackPlayer) {
                // Use youtube-nocookie.com for privacy and better compatibility
                fallbackPlayer.innerHTML = `
                    <div class="ratio ratio-16x9">
                        <iframe 
                            src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="mt-2 text-muted small">
                        Having issues? Try <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">watching on YouTube</a>.
                    </div>
                `;
            }
        } catch (e) {
            console.error('Fallback player error:', e);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <p>Failed to load video. Please try again later.</p>
                    <div class="mt-2">
                        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="btn btn-primary me-2">
                            Watch on YouTube
                        </a>
                        <button onclick="window.location.reload()" class="btn btn-outline-secondary">
                            Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

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
