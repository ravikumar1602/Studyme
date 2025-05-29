const functions = require('firebase-functions');
const { google } = require('googleapis');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY // Set this in Firebase config
});

/**
 * Fetches videos from a YouTube playlist
 */
exports.getPlaylistVideos = functions.https.onCall(async (data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to import playlists.'
    );
  }

  const { playlistId, maxResults = 50 } = data;

  if (!playlistId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Playlist ID is required.'
    );
  }

  try {
    // First, get the playlist details
    const playlistResponse = await youtube.playlists.list({
      part: 'snippet',
      id: playlistId,
      maxResults: 1
    });

    if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
      throw new functions.https.HttpsError(
        'not-found',
        'Playlist not found.'
      );
    }

    // Get all videos from the playlist
    let videos = [];
    let nextPageToken = '';

    do {
      const response = await youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: Math.min(50, maxResults - videos.length),
        pageToken: nextPageToken || undefined
      });

      // Get video details in batches of 50 (YouTube API limit)
      const videoIds = response.data.items
        .filter(item => item.snippet.title !== 'Private video' && 
                       item.snippet.title !== 'Deleted video')
        .map(item => item.contentDetails.videoId);

      if (videoIds.length > 0) {
        const videoDetails = await youtube.videos.list({
          part: 'snippet,contentDetails',
          id: videoIds.join(','),
          maxResults: 50
        });

        const batchVideos = videoDetails.data.items.map(video => ({
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnailUrl: video.snippet.thumbnails.medium?.url || 
                       video.snippet.thumbnails.default.url,
          duration: parseYoutubeDuration(video.contentDetails.duration)
        }));

        videos = [...videos, ...batchVideos];
      }

      nextPageToken = response.data.nextPageToken || '';
    } while (nextPageToken && videos.length < maxResults);

    return { videos };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch playlist',
      error.message
    );
  }
});

// Helper function to convert YouTube duration format (PT1H2M3S) to seconds
function parseYoutubeDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = (match[1] ? parseInt(match[1]) : 0);
  const minutes = (match[2] ? parseInt(match[2]) : 0);
  const seconds = (match[3] ? parseInt(match[3]) : 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}
