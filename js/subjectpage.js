// Global variable to store teachers data
let teachersData = {};

// Function to extract lecture number from title for sorting
function getLectureNumber(title) {
    // Match numbers with optional leading zeros (e.g., 01, 1, 02, 2, etc.)
    const match = title.match(/(?:lecture|lec|episode|ep|part|pt|#)?\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
}

// Function to load videos from API
async function loadVideosFromAPI(subject, teacherId = null) {
    try {
        let url = `/api/videos.php?subject=${subject}`;
        if (teacherId) {
            url += `&teacher=${teacherId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        
        // Ensure we have an array
        data = Array.isArray(data) ? data : [];
        
        // Sort videos by lecture number in title
        data.sort((a, b) => {
            const numA = getLectureNumber(a.title);
            const numB = getLectureNumber(b.title);
            
            // If both have numbers, sort numerically
            if (numA > 0 && numB > 0) {
                return numA - numB;
            }
            
            // If only one has a number, put it first
            if (numA > 0) return -1;
            if (numB > 0) return 1;
            
            // Otherwise, sort alphabetically
            return a.title.localeCompare(b.title);
        });
        
        return data;
    } catch (error) {
        console.error('Error loading videos:', error);
        throw error;
    }
}

// Function to initialize teachers data
async function initTeachersData() {
    if (!window.videoConfig) {
        console.error('videoConfig is not available');
        return false;
    }
    
    try {
        // Initialize with basic teacher data from config
        teachersData = {};
        
        // Load teacher data from config
        if (Array.isArray(window.videoConfig.teachers)) {
            for (const teacher of window.videoConfig.teachers) {
                teachersData[teacher.id] = {
                    ...teacher,
                    videos: [] // Start with empty videos, will load from API
                };
                
                // Preload videos for the first teacher
                if (teacher.id === 'khan') {
                    try {
                        const videos = await loadVideosFromAPI('history', teacher.id);
                        teachersData[teacher.id].videos = videos;
                    } catch (error) {
                        console.error(`Error loading videos for ${teacher.name}:`, error);
                    }
                }
            }
        }
        
        console.log('Teachers data initialized with API:', teachersData);
        return true;
    } catch (error) {
        console.error('Error initializing teachers data:', error);
        return false;
    }
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
let qualityLevels = [];
let currentQuality = 'auto';

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
                type: 'video/youtube',
                youtube: {
                    ytControls: 2,
                    rel: 0,
                    fs: 1,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    playsinline: 1,
                    disablekb: 1,
                    enablejsapi: 1,
                    origin: window.location.origin,
                    widget_referrer: window.location.href,
                    enablejsapi: 1,
                    html5: 1
                }
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
                origin: window.location.origin,
                widget_referrer: window.location.href,
                html5: 1
            },
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'qualitySelector',
                    'playbackRateMenuButton',
                    'fullscreenToggle'
                ],
                playbackRateMenuButton: {
                    rates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4],
                    defaultRate: 1  // Default to normal speed
                }
            },
            
            // Register the quality selector component
            components: {
                qualitySelector: function(player, options) {
                    let qualityLevels = [];
                    let currentQuality = 'auto';
                    
                    // Create the button
                    const button = document.createElement('button');
                    button.className = 'vjs-quality-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button';
                    button.title = 'Quality';
                    button.innerHTML = `
                        <span class="vjs-icon-placeholder" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                                <path d="M7 5h10v2h2v3h-3v-1H8v1H5V7h2V5zm11 8v3c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2z" fill="currentColor"/>
                            </svg>
                        </span>
                        <span class="vjs-control-text">Quality</span>
                    `;
                    
                    // Create the menu
                    const menu = document.createElement('div');
                    menu.className = 'vjs-menu';
                    menu.style.display = 'none';
                    
                    const menuContent = document.createElement('div');
                    menuContent.className = 'vjs-menu-content';
                    menuContent.role = 'menu';
                    
                    menu.appendChild(menuContent);
                    button.appendChild(menu);
                    
                    // Toggle menu on button click
                    button.addEventListener('click', function(e) {
                        e.stopPropagation();
                        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                    });
                    
                    // Close menu when clicking outside
                    document.addEventListener('click', function() {
                        menu.style.display = 'none';
                    });
                    
                    // Function to update quality levels
                    const updateQualityLevels = (levels) => {
                        menuContent.innerHTML = '';
                        
                        // Add Auto option
                        const autoItem = document.createElement('div');
                        autoItem.className = 'vjs-menu-item' + (currentQuality === 'auto' ? ' vjs-selected' : '');
                        autoItem.textContent = 'Auto';
                        autoItem.addEventListener('click', function() {
                            setQuality('auto');
                            menu.style.display = 'none';
                        });
                        menuContent.appendChild(autoItem);
                        
                        // Add quality options
                        levels.forEach(level => {
                            const item = document.createElement('div');
                            item.className = 'vjs-menu-item' + (currentQuality === level ? ' vjs-selected' : '');
                            item.textContent = level;
                            item.addEventListener('click', function() {
                                setQuality(level);
                                menu.style.display = 'none';
                            });
                            menuContent.appendChild(item);
                        });
                    };
                    
                    // Function to set quality
                    const setQuality = (quality) => {
                        currentQuality = quality;
                        if (quality === 'auto') {
                            // Auto quality
                            player.tech_.ytPlayer.setPlaybackQuality('default');
                        } else {
                            // Specific quality
                            player.tech_.ytPlayer.setPlaybackQuality(quality);
                        }
                        updateQualityLevels(qualityLevels);
                    };
                    
                    // Expose methods
                    return {
                        el: function() {
                            return button;
                        },
                        updateQualityLevels: updateQualityLevels,
                        setQuality: setQuality
                    };
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
            
            // Get the quality selector component
            const qualitySelector = player.controlBar.getChild('qualitySelector');
            
            // Function to update quality levels
            const updateQualityLevels = () => {
                try {
                    const tech = player.tech_.ytPlayer;
                    if (tech && tech.getAvailableQualityLevels) {
                        const levels = tech.getAvailableQualityLevels();
                        if (levels && levels.length > 0) {
                            // Filter out 'auto' and 'tiny' qualities
                            const filteredLevels = levels.filter(level => 
                                level !== 'auto' && level !== 'tiny' && level !== 'small' && level !== 'medium'
                            );
                            
                            // Sort quality levels from highest to lowest
                            const qualityOrder = {
                                'hd2160': 0,
                                'hd1440': 1,
                                'hd1080': 2,
                                'hd720': 3,
                                'large': 4,
                                'medium': 5,
                                'small': 6,
                                'tiny': 7,
                                'auto': 8
                            };
                            
                            filteredLevels.sort((a, b) => qualityOrder[a] - qualityOrder[b]);
                            
                            // Update the quality selector
                            qualityLevels = filteredLevels;
                            if (qualitySelector && qualitySelector.updateQualityLevels) {
                                qualitySelector.updateQualityLevels(filteredLevels);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error updating quality levels:', e);
                }
            };
            
            // Listen for quality change events
            player.tech_.on('loadedmetadata', updateQualityLevels);
            player.tech_.on('play', updateQualityLevels);
            
            // Initial update
            updateQualityLevels();
            
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
    if (!playlistElement) {
        console.error('Playlist element not found');
        return;
    }
    
    // Store the current video ID before clearing
    const currentVideoId = window.currentVideo?.id;
    playlistElement.innerHTML = ''; // Clear existing playlist
    
    if (!teacher || !teacher.videos || teacher.videos.length === 0) {
        playlistElement.innerHTML = '<li class="playlist-empty">No videos available</li>';
        return;
    }
    
    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    teacher.videos.forEach((video, index) => {
        if (!video || !video.id) {
            console.warn('Skipping invalid video at index', index);
            return;
        }
        
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.setAttribute('data-video-id', video.id);
        
        // Add active class if this is the current video
        if (video.id === currentVideoId) {
            li.classList.add('active');
        }
        
        // Use the same thumbnail as shown in the video player
        const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
        
        li.innerHTML = `
            <div class="playlist-item-thumbnail">
                <img src="${thumbnailUrl}" 
                     alt="${video.title || 'Video thumbnail'}" 
                     loading="lazy"
                     onerror="this.onerror=null;this.src='https://via.placeholder.com/160x90?text=No+Thumbnail';"
                >
                <div class="playlist-item-number">${index + 1}</div>
            </div>
            <div class="playlist-item-content">
                <div class="playlist-item-title" title="${video.title || 'Untitled'}">${video.title || 'Untitled Video'}</div>
                ${video.duration ? `<div class="playlist-item-duration">${video.duration}</div>` : ''}
            </div>
        `;
        
        // Add click event to play the video
        li.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Don't do anything if this is already the active video
            if (li.classList.contains('active') && window.currentVideo?.id === video.id) {
                return;
            }
            
            // Play the selected video
            playVideo(video);
        });
        
        fragment.appendChild(li);
    });
    
    // Append all playlist items at once
    playlistElement.appendChild(fragment);
    
    // If there's no current video, auto-select the first one
    if (!currentVideoId && teacher.videos.length > 0) {
        const firstVideo = teacher.videos[0];
        playVideo(firstVideo);
    }
    
    // If we have a current video, make sure it's visible in the playlist
    if (currentVideoId) {
        setTimeout(() => {
            const activeItem = playlistElement.querySelector(`[data-video-id="${currentVideoId}"]`);
            if (activeItem) {
                activeItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }
        }, 100);
    }
}

// Load videos for the selected teacher
async function loadTeacherVideos(teacher) {
    if (!teacher) {
        console.error('No teacher provided');
        videoList.innerHTML = '<div class="no-videos">No teacher selected.</div>';
        return;
    }

    // Show loading state
    videoList.innerHTML = '<div class="loading">Loading videos...</div>';

    try {
        // Load videos from API for this teacher
        const videos = await loadVideosFromAPI('history', teacher.id);
        
        // Update the teacher's videos in the cache
        if (teachersData[teacher.id]) {
            teachersData[teacher.id].videos = videos;
        }

        if (videos.length === 0) {
            videoList.innerHTML = '<div class="no-videos">No videos available for this teacher.</div>';
            return;
        }

        // Update the playlist with the loaded videos
        updatePlaylist({
            ...teacher,
            videos: videos
        });
        
        // Render the videos
        renderVideos(videos);
        
        // Auto-play the first video if available
        if (videos[0] && videos[0].id) {
            setTimeout(() => {
                playVideo(videos[0]);
            }, 100);
        }
    } catch (error) {
        console.error('Error loading teacher videos:', error);
        videoList.innerHTML = `
            <div class="error">
                <p>Error loading videos. Please try again later.</p>
                <button onclick="window.location.reload()" class="btn-retry">Retry</button>
            </div>
        `;
    }
}

// Render videos in the list
function renderVideos(videos) {
    if (!videoList) return;
    
    if (!Array.isArray(videos) || videos.length === 0) {
        videoList.innerHTML = '<div class="no-videos">No videos found.</div>';
        return;
    }

    videoList.innerHTML = videos.map(video => `
        <div class="video-item" data-video-id="${video.id}">
            <div class="video-thumbnail">
                <img src="${video.thumbnail || 'https://via.placeholder.com/320x180'}" 
                     alt="${video.title}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/320x180?text=Thumbnail+Error'">
                ${video.duration ? `<span class="duration">${video.duration}</span>` : ''}
            </div>
            <div class="video-details">
                <h3>${video.title}</h3>
                <div class="video-meta">
                    ${video.views ? `<span class="views">${video.views} views</span>` : ''}
                    ${video.date ? `<span class="date">${video.date}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Add click handlers to video items
    document.querySelectorAll('.video-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            const video = videos[index];
            if (video) {
                playVideo(video);
            }
        });
    });
}

// Play the selected video
function playVideo(video) {
    if (!player) {
        console.error('Video player not initialized');
        // Try to reinitialize the player
        if (initPlayer()) {
            console.log('Player reinitialized, attempting to play video');
        } else {
            console.error('Failed to initialize player');
            return;
        }
    }
    
    if (!video || !video.id) {
        console.error('Invalid video object or missing video ID');
        return;
    }
    
    console.log('Playing video:', video.title, 'ID:', video.id);
    
    // Store the current video for reference
    window.currentVideo = video;
    
    try {
        // Update UI immediately to show loading state
        if (videoTitle) videoTitle.textContent = video.title || 'Loading...';
        if (videoDuration) videoDuration.textContent = video.duration || '';
        if (videoViews) videoViews.textContent = video.views ? `${video.views} views` : '';
        if (videoDate) videoDate.textContent = video.date || '';
        if (videoDescription) videoDescription.textContent = video.description || '';
        
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
            const activeItem = document.querySelector(`.playlist-item[data-video-id="${video.id}"]`);
            const playlist = document.querySelector('.playlist');
            if (activeItem && playlist) {
                // Remove active class from all items first
                document.querySelectorAll('.playlist-item').forEach(item => {
                    item.classList.remove('active');
                });
                // Add active class to current item
                activeItem.classList.add('active');
                
                // Scroll to active item
                activeItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }
        }, 100);
        
        // Remove any existing play overlay
        const existingOverlay = document.querySelector('.play-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        // Show play button overlay when autoplay fails
        function showPlayButtonOverlay() {
            // Create play button overlay
            const playOverlay = document.createElement('div');
            playOverlay.className = 'play-overlay';
            playOverlay.innerHTML = `
                <button class='play-button' aria-label='Play video'>
                    <i class='fas fa-play'></i> Play Video
                </button>
            `;
            
            // Add click handler to play on user interaction
            const playButton = playOverlay.querySelector('.play-button');
            const playOnClick = function() {
                player.play().then(() => {
                    playOverlay.remove();
                }).catch(e => {
                    console.error('Still cannot play video:', e);
                });
            };
            
            playButton.addEventListener('click', playOnClick);
            
            // Add overlay to the player
            const playerEl = document.querySelector('.video-js');
            if (playerEl) {
                playerEl.style.position = 'relative';
                playerEl.appendChild(playOverlay);
            }
            
            // Also try to play when the user interacts with the page
            const playOnInteraction = function() {
                player.play().then(() => {
                    playOverlay.remove();
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('keydown', playOnInteraction);
                });
            };
            
            document.addEventListener('click', playOnInteraction);
            document.addEventListener('keydown', playOnInteraction);
        }
        
        // Handle video ready state
        const onReady = function() {
            console.log('Video ready to play:', video.title);
            
            // Update the URL with the current video ID
            if (history.pushState) {
                const newUrl = `${window.location.pathname}?v=${video.id}`;
                window.history.pushState({ path: newUrl }, '', newUrl);
            }
            
            // Try to play the video
            const playPromise = player.play();
            
            // Handle autoplay restrictions
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Autoplay prevented, attempting to play muted...');
                    player.muted(true);
                    return player.play().catch(e => {
                        console.log('Autoplay with sound failed, showing play button');
                        showPlayButtonOverlay();
                    });
                }).catch(error => {
                    console.error('Error playing video:', error);
                    // Show error message to user
                    if (videoTitle) videoTitle.textContent = 'Click to play video';
                    showPlayButtonOverlay();
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
    if (!currentVideo || !currentVideo.id) {
        console.error('Invalid current video');
        return;
    }
    
    // Find the current teacher
    const currentTeacher = Object.values(teachersData).find(teacher => 
        teacher.videos && teacher.videos.some(v => v.id === currentVideo.id)
    );
    
    if (!currentTeacher || !currentTeacher.videos) {
        console.error('Could not find current teacher or videos');
        return;
    }
    
    // Find the index of the current video
    const currentIndex = currentTeacher.videos.findIndex(v => v.id === currentVideo.id);
    if (currentIndex === -1) {
        console.error('Current video not found in playlist');
        return;
    }
    
    // Check if there's a next video
    const nextIndex = currentIndex + 1;
    if (nextIndex < currentTeacher.videos.length) {
        const nextVideo = currentTeacher.videos[nextIndex];
        console.log('Playing next video:', nextVideo.title);
        
        // Update the URL with the next video ID
        if (history.pushState) {
            const newUrl = `${window.location.pathname}?v=${nextVideo.id}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
        
        playVideo(nextVideo);
    } else {
        console.log('Reached the end of the playlist');
        // Optional: Show a message or handle end of playlist
        if (videoTitle) videoTitle.textContent = 'End of Playlist';
        if (videoDescription) videoDescription.textContent = 'You have reached the end of the playlist.';
        
        // Remove active class from all playlist items
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.classList.remove('active');
        });
    }
}

// Toggle teacher panel on mobile
function setupMobileDropdown() {
    const dropdownBtn = document.getElementById('teacherDropdownBtn');
    const mobileTeacherPanel = document.getElementById('mobileTeacherPanel');
    const desktopTeacherPanel = document.getElementById('desktopTeacherPanel');
    
    // Only run this on mobile
    if (window.innerWidth > 768) return;
    
    if (dropdownBtn && mobileTeacherPanel && desktopTeacherPanel) {
        // Make sure mobile panel is visible and positioned correctly
        mobileTeacherPanel.style.display = 'block';
        mobileTeacherPanel.style.position = 'absolute';
        mobileTeacherPanel.style.top = '100%';
        mobileTeacherPanel.style.left = '0';
        
        // Hide desktop panel on mobile
        desktopTeacherPanel.style.display = 'none';
        
        // Set up click handler for mobile dropdown
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = this.classList.toggle('active');
            if (isActive) {
                mobileTeacherPanel.classList.add('active');
            } else {
                mobileTeacherPanel.classList.remove('active');
            }
        });
        
        // Close dropdown when clicking on a teacher item
        const teacherItems = mobileTeacherPanel.querySelectorAll('.teacher-item');
        teacherItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownBtn.classList.remove('active');
                mobileTeacherPanel.classList.remove('active');
                // Update the button text
                const teacherName = this.querySelector('h3').textContent;
                const buttonText = dropdownBtn.querySelector('span');
                if (buttonText) {
                    buttonText.textContent = teacherName;
                }
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (mobileTeacherPanel.classList.contains('active') && 
                !mobileTeacherPanel.contains(event.target) && 
                !dropdownBtn.contains(event.target)) {
                dropdownBtn.classList.remove('active');
                mobileTeacherPanel.classList.remove('active');
            }
        });
    }
}

// Handle window resize to show/hide panels appropriately
function handleResize() {
    const mobileTeacherPanel = document.getElementById('mobileTeacherPanel');
    const desktopTeacherPanel = document.getElementById('desktopTeacherPanel');
    const dropdownBtn = document.getElementById('teacherDropdownBtn');
    const videoGrid = document.querySelector('.video-grid');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        // Mobile view
        if (desktopTeacherPanel) desktopTeacherPanel.style.display = 'none';
        if (mobileTeacherPanel) {
            mobileTeacherPanel.style.display = 'block';
            mobileTeacherPanel.style.position = 'absolute';
            mobileTeacherPanel.style.top = '100%';
            mobileTeacherPanel.style.left = '0';
            mobileTeacherPanel.style.width = '100%';
            mobileTeacherPanel.style.zIndex = '1000';
        }
        if (dropdownBtn) {
            dropdownBtn.style.display = 'flex';
            dropdownBtn.classList.remove('active');
        }
        if (mobileTeacherPanel) mobileTeacherPanel.classList.remove('active');
        if (videoGrid) videoGrid.style.display = 'none';
        if (mainContent) {
            mainContent.style.gridColumn = '1';
            mainContent.style.width = '100%';
            mainContent.style.padding = '0';
        }
    } else {
        // Desktop/tablet view
        if (desktopTeacherPanel) desktopTeacherPanel.style.display = 'block';
        if (mobileTeacherPanel) {
            mobileTeacherPanel.style.display = 'none';
            mobileTeacherPanel.classList.remove('active');
        }
        if (dropdownBtn) {
            dropdownBtn.style.display = 'none';
            dropdownBtn.classList.remove('active');
        }
        if (videoGrid) videoGrid.style.display = 'grid';
        if (mainContent) {
            mainContent.style.gridColumn = '2';
            mainContent.style.width = '';
            mainContent.style.padding = '';
        }
    }
}

// Function to initialize the application
window.initializeApp = async function() {
    console.log('Initializing application...');
    
    try {
        // Initialize the video player
        if (typeof initPlayer === 'function') {
            initPlayer();
        }

        // Set up UI elements
        setupMobileDropdown();
        if (typeof setupTeacherHandlers === 'function') {
            setupTeacherHandlers();
        }
        window.addEventListener('resize', handleResize);
        handleResize();

        // Load header and footer
        await Promise.all([
            fetch('header.html').then(r => r.text()).then(html => {
                document.getElementById('header').innerHTML = html;
            }).catch(error => {
                console.error('Error loading header:', error);
            }),
            fetch('footer.html').then(r => r.text()).then(html => {
                document.getElementById('footer').innerHTML = html;
            }).catch(error => {
                console.error('Error loading footer:', error);
            })
        ]);

        // Initialize teachers data
        if (typeof initTeachersData === 'function') {
            await initTeachersData();
        }

        // Set up teacher click handlers
        const teacherItems = document.querySelectorAll('.teacher-item');
        teacherItems.forEach(item => {
            item.addEventListener('click', async function() {
                const teacherId = this.getAttribute('data-teacher');
                if (teacherId && teachersData[teacherId]) {
                    // Update UI
                    teacherItems.forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Load videos
                    await loadTeacherVideos(teachersData[teacherId]);
                }
            });
        });

        // Load first teacher's videos by default
        const firstTeacher = document.querySelector('.teacher-item');
        if (firstTeacher) {
            firstTeacher.click();
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        document.body.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2>Something went wrong</h2>
                <p>${error.message}</p>
                <button onclick="window.location.reload()" class="btn-retry">Reload Page</button>
            </div>
        `;
    }
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
