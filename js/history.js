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
    console.log('Initializing video player...');
    
    // The video player is now automatically initialized by the VideoPlayer class
    // We'll store the player instance on the window for easy access
    window.videoPlayer = new VideoPlayer('videoPlayer', {
        autoplay: true,
        controls: true,
        onReady: (event) => {
            console.log('Video player is ready');
            // You can add any custom behavior when player is ready
        },
        onStateChange: (event) => {
            console.log('Player state changed:', event.data);
            // You can add custom behavior on state change
        },
        onError: (event) => {
            console.error('Player error:', event.data);
            // You can add custom error handling
        }
    });
    
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

                    // Auto-play the first video if available
                    if (videos.length > 0) {
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
        // Validate input
        if (!video) {
            console.error('No video object provided');
            return;
        }
        
        if (!video.id) {
            console.error('Video ID is missing', video);
            return;
        }
        
        console.log('Playing video:', video);
        
        // Get DOM elements
        const videoContainer = document.querySelector('.video-container');
        const videoElement = document.getElementById('videoPlayer');
        
        if (!videoContainer) {
            console.error('Video container not found');
            return;
        }
        
        if (!videoElement) {
            console.error('Video element not found');
            return;
        }
        
        try {
            // Show loading state
            console.log('Showing loading state');
            videoContainer.classList.add('loading');
            videoElement.style.opacity = '0';
            
            // Update video info
            let videoTitle = document.querySelector('.video-title');
            let videoDescription = document.querySelector('.video-description');
            
            // Create elements if they don't exist
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
            
            // Update video info
            if (videoTitle) videoTitle.textContent = video.title || 'Untitled Video';
            if (videoDescription) videoDescription.textContent = video.description || 'No description available';
            
            // Set the video source
            setVideoSource(video, videoContainer, videoElement);
            
            // Mark the video as active in the list and scroll to it
            document.querySelectorAll('.video-item').forEach(item => {
                const isActive = item.getAttribute('data-video-id') === video.id;
                item.classList.toggle('active', isActive);
                
                // Scroll the active item into view if it's not visible
                if (isActive) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
            
            // Scroll the video player into view
            const playerContainer = document.querySelector('.video-player-container');
            if (playerContainer) {
                playerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        } finally {
            // Hide loading state and show video
            if (videoContainer) videoContainer.classList.remove('loading');
            if (videoElement) {
                videoElement.style.opacity = '1';
                videoElement.style.transition = 'opacity 0.3s ease';
            }
        }
    };
}

// Set video source based on type (YouTube or direct URL)
const setVideoSource = (video, videoContainer, videoElement) => {
    try {
        console.log('Setting video source for ID:', video.id);

        // First, check if we already have a player instance
        if (window.videoPlayer) {
            // If player exists, just update the source
            try {
                window.videoPlayer.src({
                    type: 'video/youtube',
                    src: `https://www.youtube.com/watch?v=${video.id}`
                });
                window.videoPlayer.load();
                window.videoPlayer.play();
                videoContainer.classList.remove('loading');
                videoElement.style.opacity = '1';
                return;
            } catch (error) {
                console.warn('Error updating existing player, will reinitialize:', error);
                // If there's an error with the existing player, dispose it and create a new one
                if (window.videoPlayer.dispose) {
                    window.videoPlayer.dispose();
                }
                window.videoPlayer = null;
            }
        }

        // Initialize a new player if none exists or if the existing one had an error
        console.log('Initializing video player...');
        const playerOptions = {
            controls: true,
            autoplay: true,
            preload: 'auto',
            fluid: true,
            techOrder: ['youtube'],
            youtube: {
                ytControls: 2,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                modestbranding: 1
            },
            sources: [{
                type: 'video/youtube',
                src: `https://www.youtube.com/watch?v=${video.id}`
            }]
        };

        try {
            window.videoPlayer = videojs('videoPlayer', playerOptions, function() {
                console.log('Video.js player is ready');
                videoContainer.classList.remove('loading');
                videoElement.style.opacity = '1';
            });
        } catch (error) {
            console.error('Failed to initialize Video.js, falling back to iframe:', error);
            videoElement.src = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
            videoContainer.classList.remove('loading');
            videoElement.style.opacity = '1';
        }

        // Mark the video as active in the list and scroll to it
        document.querySelectorAll('.video-item').forEach(item => {
            const isActive = item.getAttribute('data-video-id') === video.id;
            item.classList.toggle('active', isActive);

            // Scroll the active item into view if it's not visible
            if (isActive) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        // Scroll the video player into view
        const playerContainer = document.querySelector('.video-player-container');
        if (playerContainer) {
            playerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        console.error('Error in setVideoSource:', error);
        // Show user-friendly error message
        const errorMessage = 'Failed to load the video. Please try again.';
        if (typeof showNotification === 'function') {
            showNotification(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        
        // Make sure to clean up if there was an error
        if (window.videoPlayer) {
            try {
                window.videoPlayer.dispose();
            } catch (e) {
                console.error('Error disposing video player:', e);
            }
            window.videoPlayer = null;
        }
        
        // Show error state
        if (videoContainer) videoContainer.classList.remove('loading');
        if (videoElement) {
            videoElement.style.opacity = '1';
            videoElement.style.transition = 'opacity 0.3s ease';
        }
        throw error; // Re-throw to be caught by the outer try-catch
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
