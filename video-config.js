// video-config.js

// This will be populated from admin panel
let currentLiveVideoID = "";
let liveVideosConfig = [];

// Function to initialize videos from admin panel data
function initVideosFromAdmin(adminData) {
  try {
    if (adminData && adminData.currentLiveVideoID) {
      currentLiveVideoID = adminData.currentLiveVideoID;
    }
    
    if (Array.isArray(adminData.videos)) {
      liveVideosConfig = adminData.videos;
      
      // If no currentLiveVideoID is set, use the first video in the list
      if (!currentLiveVideoID && liveVideosConfig.length > 0) {
        currentLiveVideoID = liveVideosConfig[0].videoId;
      }
      
      // Trigger video player initialization if the function exists
      if (typeof initVideoPlayer === 'function') {
        initVideoPlayer();
      }
    }
  } catch (error) {
    console.error('Error initializing videos from admin:', error);
  }
}

// Default empty configuration
export { currentLiveVideoID, liveVideosConfig, initVideosFromAdmin };
