class VideoPlayer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            autoplay: true,
            controls: true,
            ...options
        };
        this.player = null;
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Container element not found');
            return;
        }

        // Create player container
        this.playerContainer = document.createElement('div');
        this.playerContainer.className = 'video-player-container';
        this.playerContainer.style.width = '100%';
        this.playerContainer.style.height = '100%';
        this.container.appendChild(this.playerContainer);

        // Add loading state
        this.showLoading();

        // Check if YouTube API is already loaded
        if (window.YT && window.YT.Player) {
            this.onYouTubeIframeAPIReady();
            return;
        }

        // Create a promise that resolves when the YouTube API is ready
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API is ready');
            this.onYouTubeIframeAPIReady();
        };

        // Load YouTube API if not already loading
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }

    onYouTubeIframeAPIReady() {
        console.log('YouTube API is ready - initializing player');
        this.hideLoading();
        
        // If we have a video to load, load it
        if (this.pendingVideoId) {
            console.log('Loading pending video:', this.pendingVideoId);
            this.loadVideo(this.pendingVideoId);
            this.pendingVideoId = null;
        } else {
            console.log('No pending video to load');
        }
    }

    loadVideo(videoId) {
        console.log('Attempting to load video:', videoId);
        
        // If YouTube API is not ready, store the video ID and load it later
        if (!window.YT || !window.YT.Player) {
            console.log('YouTube API not ready yet, queuing video:', videoId);
            this.pendingVideoId = videoId;
            
            // Try to load the YouTube API if not already loading
            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                console.log('Loading YouTube API...');
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
            return;
        }

        // Destroy existing player if it exists
        if (this.player) {
            try {
                this.player.destroy();
            } catch (e) {
                console.error('Error destroying player:', e);
            }
        }

        // Create new player
        try {
            this.player = new YT.Player(this.playerContainer, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'rel': 0,
                    'modestbranding': 1,
                    'showinfo': 0,
                    'controls': this.options.controls ? 1 : 0,
                    'autoplay': this.options.autoplay ? 1 : 0,
                    'enablejsapi': 1
                },
                events: {
                    'onReady': this.onPlayerReady.bind(this),
                    'onStateChange': this.onPlayerStateChange.bind(this),
                    'onError': this.onPlayerError.bind(this)
                }
            });
        } catch (e) {
            console.error('Error creating player:', e);
            this.showError('Failed to load video player');
        }
    }

    onPlayerReady(event) {
        console.log('Player is ready');
        if (this.options.onReady) {
            this.options.onReady(event);
        }
        
        if (this.options.autoplay) {
            event.target.playVideo();
        }
    }

    onPlayerStateChange(event) {
        if (this.options.onStateChange) {
            this.options.onStateChange(event);
        }
    }

    onPlayerError(event) {
        console.error('Player error:', event.data);
        this.showError('Error loading video');
        
        if (this.options.onError) {
            this.options.onError(event);
        }
    }

    showLoading() {
        this.playerContainer.innerHTML = `
            <div class="video-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading player...</p>
            </div>
        `;
    }

    hideLoading() {
        const loadingElement = this.playerContainer.querySelector('.video-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    showError(message) {
        this.playerContainer.innerHTML = `
            <div class="video-error text-center p-4">
                <i class="fas fa-exclamation-triangle text-danger mb-2" style="font-size: 2rem;"></i>
                <p class="mb-0">${message}</p>
            </div>
        `;
    }

    // Public methods
    play() {
        if (this.player && typeof this.player.playVideo === 'function') {
            this.player.playVideo();
        }
    }

    pause() {
        if (this.player && typeof this.player.pauseVideo === 'function') {
            this.player.pauseVideo();
        }
    }

    stop() {
        if (this.player && typeof this.player.stopVideo === 'function') {
            this.player.stopVideo();
        }
    }

    destroy() {
        if (this.player && typeof this.player.destroy === 'function') {
            this.player.destroy();
        }
        if (this.playerContainer) {
            this.playerContainer.remove();
        }
    }
}

// Auto-initialize video players with data-video-player attribute
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-video-player]').forEach(container => {
        const containerId = container.getAttribute('data-video-player');
        const videoId = container.getAttribute('data-video-id');
        const autoplay = container.getAttribute('data-autoplay') !== 'false';
        const controls = container.getAttribute('data-controls') !== 'false';
        
        const player = new VideoPlayer(containerId, {
            autoplay,
            controls,
            onReady: (event) => {
                console.log('Video player ready');
            },
            onStateChange: (event) => {
                console.log('Player state changed:', event.data);
            },
            onError: (event) => {
                console.error('Player error:', event.data);
            }
        });
        
        if (videoId) {
            player.loadVideo(videoId);
        }
        
        // Store player instance on the container for later access
        container.videoPlayer = player;
    });
});
