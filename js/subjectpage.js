// Global variable to store teachers data
let teachersData = {};

// Function to initialize teachers data
function initTeachersData() {
    if (window.videoConfig && window.videoConfig.teachers) {
        teachersData = {}; // Reset the data
        window.videoConfig.teachers.forEach(teacher => {
            teachersData[teacher.id] = {
                name: teacher.name,
                specialization: teacher.specialization,
                avatar: teacher.avatar,
                videos: teacher.videos || []
            };
        });
        console.log('Teachers data initialized:', teachersData);
        return true;
    }
    console.error('videoConfig.teachers is not available');
    return false;
}

// DOM Elements
const teacherItems = document.querySelectorAll('.teacher-item');
const videoList = document.getElementById('videoList');
const videoTitle = document.getElementById('videoTitle');
const videoDuration = document.getElementById('videoDuration');
const videoViews = document.getElementById('videoViews');
const videoDate = document.getElementById('videoDate');
const videoDescription = document.getElementById('videoDescription');

// Global player instance
let player;

// Function to initialize the video player
function initPlayer() {
    try {
        console.log('Initializing video player...');
        
        // Try to find the video element (works for both physics and history pages)
        let videoId = 'physics-video';
        let videoEl = document.getElementById(videoId);
        
        // If physics video not found, try history video
        if (!videoEl) {
            videoId = 'history-video';
            videoEl = document.getElementById(videoId);
        }
        
        if (!videoEl) {
            console.error('Video element not found');
            return false;
        }
        
        console.log(`Found video element with ID: ${videoId}`);
        
        // Initialize Video.js with YouTube tech
        player = videojs(videoId, {
            techOrder: ['youtube'],
            autoplay: false,
            controls: true,
            fluid: true,
            responsive: true,
            preload: 'auto',
            sources: [{
                src: 'https://www.youtube.com/watch?v=TbF00TmplrM', // Default video
                type: 'video/youtube'
            }],
            youtube: {
                ytControls: 2,
                rel: 0,
                fs: 1,
                modestbranding: 1,
                iv_load_policy: 3,
                playsinline: 1,
                disablekb: 1,
                enablejsapi: 1,
                origin: window.location.origin
            },
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'playbackRateMenuButton',
                    'fullscreenToggle'
                ],
                playbackRateMenuButton: {
                    rates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4],
                    defaultRate: 1  // Default to normal speed
                }
            },
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4],
            userActions: {
                hotkeys: function(event) {
                    // Disable keyboard controls to prevent interference
                    return false;
                }
            }
        });
        
        console.log('Video.js player initialized');
        
        // Make player available globally for debugging
        window.player = player;
        
        // Handle player ready event
        player.ready(function() {
            console.log('Player is ready');
            
            // Load first teacher's videos after player is ready
            const teacherItems = document.querySelectorAll('.teacher-item');
            if (teacherItems.length > 0) {
                // Use setTimeout to ensure the click handler is attached
                setTimeout(() => teacherItems[0].click(), 100);
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error initializing video player:', error);
        return false;
    }
}

// Function to update the playlist
function updatePlaylist(teacher) {
    const playlistElement = document.getElementById('playlist');
    playlistElement.innerHTML = ''; // Clear existing playlist
    
    if (!teacher || !teacher.videos || teacher.videos.length === 0) {
        playlistElement.innerHTML = '<li class="playlist-empty">No videos available</li>';
        return;
    }
    
    teacher.videos.forEach((video, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.setAttribute('data-video-id', video.id);
        
        // Use the same thumbnail as shown in the video player
        const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
        
        li.innerHTML = `
            <div class="playlist-item-thumbnail">
                <img src="${thumbnailUrl}" 
                     alt="${video.title}" 
                     loading="lazy"
                >
                <div class="playlist-item-number">${index + 1}</div>
            </div>
            <div class="playlist-item-content">
                <div class="playlist-item-title" title="${video.title}">${video.title}</div>
                <div class="playlist-item-duration">${video.duration}</div>
            </div>
        `;
        
        // Add click event to play the video
        li.addEventListener('click', () => {
            // Remove active class from all items
            document.querySelectorAll('.playlist-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            li.classList.add('active');
            
            // Play the selected video
            playVideo(video);
        });
        
        playlistElement.appendChild(li);
    });
    
    // Auto-select first video in playlist
    if (teacher.videos.length > 0) {
        const firstVideo = teacher.videos[0];
        playVideo(firstVideo);
        // Add active class to first item
        const firstItem = playlistElement.querySelector('.playlist-item');
        if (firstItem) firstItem.classList.add('active');
    }
}

// Load videos for the selected teacher
function loadTeacherVideos(teacher) {
    if (!teacher || !teacher.videos) {
        console.error('No teacher or videos found');
        videoList.innerHTML = '<div class="no-videos">No videos available for this teacher.</div>';
        return;
    }
    
    console.log(`Loading ${teacher.videos.length} videos for teacher:`, teacher.name);
    
    // Clear previous videos and show loading state
    videoList.innerHTML = '<div class="loading-videos">Loading videos...</div>';
    
    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();
    let hasVideos = false;
    
    // Create video grid items
    teacher.videos.forEach((video, index) => {
        // Skip if video is missing required properties
        if (!video || !video.id || !video.title) {
            console.warn('Skipping invalid video at index', index, video);
            return;
        }
        
        hasVideos = true;
        
        console.log(`Adding video ${index + 1}/${teacher.videos.length}:`, video.title);
        
        const videoItem = document.createElement('div');
        videoItem.className = 'video-card';
        videoItem.setAttribute('data-video-id', video.id);
        videoItem.setAttribute('tabindex', '0'); // Make it focusable
        
        // Set up keyboard navigation
        videoItem.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playVideo(video);
            }
        });
        
        // Add ARIA attributes for accessibility
        videoItem.setAttribute('role', 'button');
        videoItem.setAttribute('aria-label', `Play video: ${video.title}`);
        
        // Create thumbnail with error handling
        const thumbnailUrl = video.thumbnail || 'https://via.placeholder.com/320x180?text=No+Thumbnail';
        const thumbnail = new Image();
        thumbnail.src = thumbnailUrl;
        thumbnail.loading = 'lazy';
        thumbnail.alt = video.title;
        thumbnail.onerror = function() {
            this.src = 'https://via.placeholder.com/320x180?text=Thumbnail+Not+Available';
        };
        
        // Create video card content
        videoItem.innerHTML = `
            <div class="video-thumbnail">
                <img src="${thumbnailUrl}" alt="${video.title}" loading="lazy" onerror="this.src='https:\\/\\/via.placeholder.com/320x180?text=Thumbnail+Error'">
                ${video.duration ? `<div class="video-duration">${video.duration}</div>` : ''}
            </div>
            <div class="video-card-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-card-meta">
                    ${video.views ? `<span class="video-views">${video.views} views</span>` : ''}
                    ${video.date ? `<span class="video-date">${video.date}</span>` : ''}
                </div>
            </div>
        `;
        
        // Play video when clicked
        videoItem.addEventListener('click', (e) => {
            e.preventDefault();
            playVideo(video);
            videoItem.focus(); // Keep focus for keyboard users
        });
        
        fragment.appendChild(videoItem);
    });
    
    // Clear loading state and append videos
    videoList.innerHTML = '';
    
    if (!hasVideos) {
        videoList.innerHTML = '<div class="no-videos">No valid videos found for this teacher.</div>';
        return;
    }
    
    videoList.appendChild(fragment);
    
    // Auto-play the first video if available
    if (teacher.videos.length > 0 && teacher.videos[0].id) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            playVideo(teacher.videos[0]);
        }, 100);
    }
}

// Play the selected video
function playVideo(video) {
    if (!player) {
        console.error('Video player not initialized');
        // Try to reinitialize the player
        if (initPlayer()) {
            console.log('Player reinitialized, attempting to play video');
        } else {
            return;
        }
    }
    
    if (!video || !video.id) {
        console.error('Invalid video object or missing video ID');
        return;
    }
    
    console.log('Playing video:', video.title, 'ID:', video.id);
    
    try {
        // Update UI immediately to show loading state
        videoTitle.textContent = video.title || 'Loading...';
        videoDuration.textContent = video.duration || '';
        videoViews.textContent = video.views ? `${video.views} views` : '';
        videoDate.textContent = video.date || '';
        videoDescription.textContent = video.description || '';
        
        // Update active state in playlist
        updateActivePlaylistItem(video.id);
        
        // Create the YouTube video URL
        const videoSrc = `https://www.youtube.com/watch?v=${video.id}`;
        console.log('Loading video source:', videoSrc);
        
        // Change the video source
        player.src({
            src: videoSrc,
            type: 'video/youtube'
        });
        
        // Scroll the active playlist item into view
        setTimeout(() => {
            const activeItem = document.querySelector(`.playlist-item[data-video-id="${video.id}"].active`);
            const playlist = document.querySelector('.playlist');
            if (activeItem && playlist) {
                activeItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }
        }, 100);
        
        // Handle video ready state
        const onReady = function() {
            console.log('Video ready to play:', video.title);
            
            // Try to play the video
            const playPromise = player.play();
            
            // Handle autoplay restrictions
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Autoplay prevented, attempting to play muted...');
                    player.muted(true);
                    return player.play();
                }).catch(error => {
                    console.error('Error playing video:', error);
                });
            }
            
            // Remove this event listener to prevent memory leaks
            player.off('loadeddata', onReady);
        };
        
        // Handle video errors
        const onError = function() {
            console.error('Error loading video:', video.title);
            // Try to play the next video in case of error
            playNextVideo(video);
            // Remove this event listener to prevent memory leaks
            player.off('error', onError);
        };
        
        // Add event listeners
        player.one('loadeddata', onReady);
        player.one('error', onError);
        
        // Handle video end to play next video in playlist
        player.one('ended', function() {
            console.log('Video ended, playing next...');
            playNextVideo(video);
        });
        
    } catch (error) {
        console.error('Error in playVideo:', error);
        // Try to play the next video in case of error
        playNextVideo(video);
    }
}

// Update active state in playlist and scroll to active item
function updateActivePlaylistItem(videoId) {
    // Remove active class from all items
    const playlistItems = document.querySelectorAll('.playlist-item');
    let activeItem = null;
    
    // First pass: remove active class from all items
    playlistItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.videoId === videoId) {
            item.classList.add('active');
            activeItem = item;
        }
    });
    
    // Scroll the active item to the top of the playlist
    if (activeItem) {
        const playlistContainer = document.querySelector('.playlist');
        if (playlistContainer) {
            // Get the position of the active item relative to the playlist
            const itemTop = activeItem.offsetTop;
            
            // Calculate the scroll position to bring the item to the top
            // Add a small offset (20px) from the top for better visibility
            const scrollTo = itemTop - 20;
            
            // Use requestAnimationFrame for smoother animation
            const start = playlistContainer.scrollTop;
            const change = scrollTo - start;
            const duration = 500; // Animation duration in ms
            let startTime = null;
            
            function animateScroll(currentTime) {
                if (!startTime) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                
                // Calculate new scroll position
                playlistContainer.scrollTop = start + change * easeInOutQuad(progress);
                
                // Continue animation if not complete
                if (timeElapsed < duration) {
                    requestAnimationFrame(animateScroll);
                }
            }
            
            // Start the animation
            requestAnimationFrame(animateScroll);
        } else {
            // Fallback to standard scrollIntoView if container not found
            activeItem.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Play next video in playlist
function playNextVideo(currentVideo) {
    const teacherId = document.querySelector('.teacher-item.active')?.getAttribute('data-teacher');
    if (!teacherId) return;
    
    const teacher = teachersData[teacherId];
    if (!teacher || !teacher.videos) return;
    
    const currentIndex = teacher.videos.findIndex(v => v.id === currentVideo.id);
    if (currentIndex === -1 || currentIndex >= teacher.videos.length - 1) return;
    
    // Play next video
    const nextVideo = teacher.videos[currentIndex + 1];
    playVideo(nextVideo);
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Initialize teachers data first
    if (!initTeachersData()) {
        console.error('Failed to initialize teachers data');
        return;
    }
    
    // Initialize the video player
    try {
        initPlayer();
        console.log('Video player initialized');
    } catch (error) {
        console.error('Error initializing video player:', error);
    }
    
    // Load header and footer
    fetch('header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('header').innerHTML = html;
        })
        .catch(error => console.error('Error loading header:', error));
        
    fetch('footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footer').innerHTML = html;
        })
        .catch(error => console.error('Error loading footer:', error));
    
    // Set up teacher item click handlers
    const setupTeacherHandlers = () => {
        const items = document.querySelectorAll('.teacher-item');
        console.log(`Found ${items.length} teacher items`);
        
        items.forEach(item => {
            item.addEventListener('click', function() {
                const teacherId = this.getAttribute('data-teacher');
                console.log('Teacher clicked:', teacherId);
                const teacher = teachersData[teacherId];
                
                if (!teacher) {
                    console.error('Teacher not found:', teacherId);
                    return;
                }
                
                console.log('Loading teacher data:', teacher);
                
                // Update active state
                items.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Load teacher's videos
                loadTeacherVideos(teacher);
                
                // Update playlist
                updatePlaylist(teacher);
            });
        });
        
        // Click the first teacher by default if available
        if (items.length > 0) {
            console.log('Clicking first teacher item');
            items[0].click();
        } else {
            console.warn('No teacher items found');
        }
    };
    
    // Wait a short time to ensure the DOM is fully ready
    setTimeout(setupTeacherHandlers, 100);
});
