// Import Firebase services from the modular SDK
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, getCurrentUser } from './firebase.js';

// Available subjects with display names
const SUBJECTS = {
    'history': 'History',
    'geography': 'Geography',
    'mathematics': 'Mathematics',
    'science': 'Science',
    'english': 'English',
    'gk': 'General Knowledge',
    'reasoning': 'Reasoning',
    'polity': 'Polity',
    'economics': 'Economics',
    'environment': 'Environment',
    'current-affairs': 'Current Affairs'
};

// YouTube API Key (you should move this to a secure server-side implementation)
// This is just for demonstration - in production, use a server-side proxy
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // This is now only used for client-side operations

// Import Firebase Functions
import { getFunctions, httpsCallable } from 'firebase/functions';

// Initialize Firebase app
const firebaseConfig = {
    // Your Firebase config will be initialized elsewhere in the file
};

// Initialize Firebase if not already initialized
let app;
if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app();
}

// Initialize Cloud Functions
const functions = getFunctions(app);

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize playlist import functionality after authentication
    initPlaylistImport();

    // Initialize Firestore collection reference
    const videosCollection = collection(db, 'videos');
    
    // DOM Elements
    const sidebarLinks = document.querySelectorAll('.sidebar li');
    const contentSections = document.querySelectorAll('.content-section');
    const videoForm = document.getElementById('video-form');
    const videoFormContainer = document.getElementById('video-form-container');
    const addVideoBtn = document.getElementById('add-video-btn');
    const cancelVideoBtn = document.getElementById('cancel-video');
    const videoList = document.getElementById('videos-list');
    const searchInput = document.getElementById('search-videos');
    const subjectFilter = document.getElementById('filter-subject');
    const videoUrlInput = document.getElementById('video-url');
    const videoTitleInput = document.getElementById('video-title');
    const videoDescriptionInput = document.getElementById('video-description');
    const videoThumbnailInput = document.getElementById('video-thumbnail');
    const videoIdInput = document.getElementById('video-id');
    const subjectSelect = document.getElementById('subject');
    
    // State
    let videos = [];
    let isEditMode = false;
    let currentFilterSubject = '';
    let currentSearchTerm = '';
    let currentEditId = null;
    let unsubscribeVideos = null;

    // Initialize the admin dashboard
    function initAdmin() {
        setupEventListeners();
        loadVideos();
        initPlaylistImport();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Sidebar navigation
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                const section = link.getAttribute('data-section');
                showSection(section);
                
                // Update active state
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Add video button
        addVideoBtn.addEventListener('click', () => {
            showVideoForm();
        });

        // Cancel video form
        cancelVideoBtn.addEventListener('click', resetForm);

        // Video form submission
        videoForm.addEventListener('submit', handleVideoSubmit);

        // Search and filter functionality
        searchInput.addEventListener('input', filterVideos);
        subjectFilter.addEventListener('change', filterVideos);
        if (teacherFilter) {
            teacherFilter.addEventListener('change', filterVideos);
        }

        // Auto-fill video title when URL changes
        videoUrlInput.addEventListener('change', fetchVideoInfo);
    }

    // Show a specific section
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionId}-section`).classList.add('active');
    }

    // Show video form for adding/editing
    function showVideoForm(video = null) {
        if (video) {
            // Edit mode
            isEditMode = true;
            currentEditId = video.id;
            videoIdInput.value = video.id;
            videoUrlInput.value = video.url || '';
            videoTitleInput.value = video.title || '';
            videoDescriptionInput.value = video.description || '';
            videoThumbnailInput.value = video.thumbnail || '';
            subjectSelect.value = video.subject || '';
            if (teacherSelect) {
                teacherSelect.value = video.teacher || '';
            }
            
            // Update form title and button text
            videoFormContainer.querySelector('h3').textContent = 'Edit Video';
            videoForm.querySelector('button[type="submit"]').textContent = 'Update Video';
        } else {
            // Add mode
            resetForm();
        }
        
        videoFormContainer.style.display = 'block';
        videoFormContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Reset the video form
    function resetForm() {
        isEditMode = false;
        currentEditId = null;
        videoForm.reset();
        videoIdInput.value = '';
        
        // Reset form title and button text
        videoFormContainer.querySelector('h3').textContent = 'Add New Video';
        videoForm.querySelector('button[type="submit"]').textContent = 'Add Video';
        
        // Reset teacher selection
        if (teacherSelect) {
            teacherSelect.value = '';
        }
        
        videoFormContainer.style.display = 'none';
    }

    // Handle video form submission
    async function handleVideoSubmit(e) {
        e.preventDefault();
        
        try {
            // Show loading state
            const submitBtn = videoForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = isEditMode ? 'Updating...' : 'Adding...';
            
            // Get form data
            const videoData = {
                id: videoIdInput.value || Date.now().toString(),
                url: videoUrlInput.value,
                title: videoTitleInput.value,
                description: videoDescriptionInput.value,
                thumbnail: videoThumbnailInput.value,
                subject: subjectSelect.value,
                teacher: teacherSelect ? teacherSelect.value : '',
                duration: '0:00', // Default duration
                views: '0',
                date: new Date().toISOString()
            };
            
            // Extract YouTube video ID if it's a YouTube URL
            if (videoData.url && (videoData.url.includes('youtube.com') || videoData.url.includes('youtu.be'))) {
                videoData.id = extractYouTubeId(videoData.url) || videoData.id;
            }
            
            // Update or add the video
            if (isEditMode) {
                await updateVideo(videoData);
            } else {
                await addVideo(videoData);
            }
            
            // Reset the form
            resetForm();
            videoFormContainer.style.display = 'none';
        } catch (error) {
            console.error('Error submitting form:', error);
            // Error notification is shown by the add/update functions
        } finally {
            // Reset button state
            const submitBtn = videoForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
    
    // Extract YouTube video ID from URL
    function extractYouTubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2] && match[2].length === 11) ? match[2] : null;
    }
    
    // Fetch video info from URL (for auto-filling title and thumbnail)
    async function fetchVideoInfo() {
        const url = videoUrlInput.value.trim();
        if (!url) return;

        try {
            // For YouTube videos, we can extract info from the URL
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = extractYouTubeId(url);
                if (videoId) {
                    if (!videoTitleInput.value) {
                        // Try to get title from YouTube (this requires a server-side API call in production)
                        // For now, we'll just set a placeholder
                        videoTitleInput.value = `Video ${videoId}`;
                    }
                    if (!videoThumbnailInput.value) {
                        videoThumbnailInput.value = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                    }
                }
            } else {
                // Handle other video platforms if needed
                if (!videoTitleInput.value) {
                    videoTitleInput.value = 'New Video';
                }
                if (!videoThumbnailInput.value) {
                    videoThumbnailInput.value = 'https://via.placeholder.com/1280x720';
                }
            }
        } catch (error) {
            console.error('Error fetching video info:', error);
        }
    }
    
    // Load videos from Firestore
    function loadVideos() {
        try {
            // Unsubscribe from previous listener if it exists
            if (unsubscribeVideos) {
                unsubscribeVideos();
            }

            // Set up real-time listener for videos
            const videosQuery = query(videosCollection, orderBy('createdAt', 'desc'));
            
            unsubscribeVideos = onSnapshot(videosQuery, 
                (snapshot) => {
                    videos = [];
                    snapshot.forEach((doc) => {
                        videos.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    renderVideos(videos);
                },
                (error) => {
                    console.error('Error loading videos:', error);
                    showNotification('Failed to load videos. Please try again.', 'error');
                }
            );
        } catch (error) {
            console.error('Error setting up video listener:', error);
            showNotification('Failed to load videos. Please try again.', 'error');
        }
    }
    
    // Add a new video to Firestore
    async function addVideo(video) {
        try {
            // Add timestamps
            const videoWithTimestamp = {
                ...video,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Add to Firestore
            const docRef = await addDoc(videosCollection, videoWithTimestamp);
            
            // The real-time listener will handle updating the UI
            showNotification('Video added successfully!', 'success');
            return { id: docRef.id, ...videoWithTimestamp };
        } catch (error) {
            console.error('Error adding video:', error);
            showNotification('Failed to add video. Please try again.', 'error');
            throw error;
        }
    }
    
    // Update an existing video in Firestore
    async function updateVideo(updatedVideo) {
        try {
            // Update timestamp
            const videoWithTimestamp = {
                ...updatedVideo,
                updatedAt: serverTimestamp()
            };

            // Update in Firestore
            const videoRef = doc(db, 'videos', currentEditId);
            await updateDoc(videoRef, videoWithTimestamp);
            
            // The real-time listener will handle updating the UI
            showNotification('Video updated successfully!', 'success');
            return { id: currentEditId, ...videoWithTimestamp };
        } catch (error) {
            console.error('Error updating video:', error);
            showNotification('Failed to update video. Please try again.', 'error');
            throw error;
        }
    }
    
    // Delete a video from Firestore
    async function deleteVideo(id) {
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }
        
        try {
            const videoRef = doc(db, 'videos', id);
            await deleteDoc(videoRef);
            // The real-time listener will handle updating the UI
            showNotification('Video deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting video:', error);
            showNotification('Failed to delete video. Please try again.', 'error');
        }
    }
    
    // Get teacher name by ID
    function getTeacherName(teacherId) {
        const teachers = {
            'khan': 'Khan Sir',
            'sarah': 'Sarah Johnson',
            'david': 'David Miller',
            'priya': 'Priya Sharma'
        };
        return teachers[teacherId] || teacherId;
    }

    // Render videos in the list
    function renderVideos(videosToRender) {
        if (!videosToRender || videosToRender.length === 0) {
            videoList.innerHTML = '<div class="no-results">No videos found. Add your first video to get started!</div>';
            return;
        }
        
        videoList.innerHTML = videosToRender.map(video => `
            <div class="video-item" data-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail || 'https://via.placeholder.com/150'}" alt="${video.title}">
                </div>
                <div class="video-details">
                    <h3>${video.title}</h3>
                    <p class="video-meta">
                        <span class="subject">${formatSubject(video.subject)}</span>
                        ${video.teacher ? `<span class="teacher">${getTeacherName(video.teacher)}</span>` : ''}
                        <span class="date">${formatDate(video.created_at || video.date)}</span>
                    </p>
                    ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                </div>
                <div class="video-actions">
                    <button class="btn btn-edit" data-id="${video.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-delete" data-id="${video.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = btn.getAttribute('data-id');
                const video = videos.find(v => v.id === videoId);
                if (video) {
                    showVideoForm(video);
                }
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = btn.getAttribute('data-id');
                // Show delete confirmation modal
                const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
                const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
                
                // Store the video ID in the modal for later use
                if (confirmDeleteBtn) {
                    confirmDeleteBtn.onclick = () => {
                        deleteVideo(videoId);
                        deleteModal.hide();
                    };
                }
                
                deleteModal.show();
            });
        });
    }
});

// Helper function to format subject
function formatSubject(subject) {
    if (!subject) return '';
    return subject.charAt(0).toUpperCase() + subject.slice(1);
}

// Show notification
function showNotification(message, type = 'success') {
    // In a real app, you might use a toast notification library
    alert(`${type.toUpperCase()}: ${message}`);
}

// Initialize playlist import functionality
function initPlaylistImport() {
    console.log('Initializing playlist import...');
    const importPlaylistBtn = document.getElementById('importPlaylistBtn');
    const importPlaylistSubmit = document.getElementById('importPlaylistSubmit');
    const playlistUrlInput = document.getElementById('playlistUrl');
    const playlistSubject = document.getElementById('playlistSubject');
    const playlistStatus = document.getElementById('playlistStatus');
    
    console.log('Import playlist elements:', { importPlaylistBtn, importPlaylistSubmit, playlistUrlInput, playlistSubject, playlistStatus });
    
    if (!importPlaylistBtn) {
        console.error('Import playlist button not found!');
        return;
    }
    
    // Open import modal
    importPlaylistBtn.addEventListener('click', () => {
        console.log('Import playlist button clicked');
        const modalElement = document.getElementById('importPlaylistModal');
        if (!modalElement) {
            console.error('Import playlist modal not found!');
            return;
        }
        
        console.log('Bootstrap object:', typeof bootstrap);
        console.log('Bootstrap.Modal:', typeof bootstrap?.Modal);
        
        try {
            const importModal = new bootstrap.Modal(modalElement);
            if (playlistUrlInput) playlistUrlInput.value = '';
            if (playlistSubject) playlistSubject.value = '';
            if (playlistStatus) playlistStatus.classList.add('d-none');
            importModal.show();
            console.log('Modal shown successfully');
        } catch (error) {
            console.error('Error showing import modal:', error);
        }
    });
    
    // Handle playlist import
    if (importPlaylistSubmit) {
        importPlaylistSubmit.addEventListener('click', async () => {
            const playlistUrl = playlistUrlInput.value.trim();
            const subject = playlistSubject.value;
            
            if (!playlistUrl) {
                showStatus('Please enter a playlist URL', 'error');
                return;
            }
            
            if (!subject) {
                showStatus('Please select a subject', 'error');
                return;
            }
            
            // Extract playlist ID from URL
            const playlistId = extractPlaylistId(playlistUrl);
            if (!playlistId) {
                showStatus('Invalid YouTube playlist URL', 'error');
                return;
            }
            
            // Show loading state
            const spinner = importPlaylistSubmit.querySelector('.spinner-border');
            spinner.classList.remove('d-none');
            importPlaylistSubmit.disabled = true;
            showStatus('Fetching playlist information...', 'info');
            
            try {
                // Call the Cloud Function to get playlist videos
                const getPlaylistVideos = functions.httpsCallable('getPlaylistVideos');
                const result = await getPlaylistVideos({
                    playlistId: playlistId,
                    maxResults: 50
                });
                
                const { videos } = result.data;
                
                if (!videos || videos.length === 0) {
                    throw new Error('No videos found in the playlist');
                }
                
                // Add videos to Firestore
                let successCount = 0;
                let duplicateCount = 0;
                
                for (const video of videos) {
                    try {
                        // Check if video already exists
                        const videoExists = await checkIfVideoExists(video.videoId);
                        
                        if (!videoExists) {
                            await addVideo({
                                title: video.title,
                                description: video.description || '',
                                videoId: video.videoId,
                                thumbnailUrl: video.thumbnailUrl,
                                subject: subject,
                                tags: [],
                                duration: video.duration || 0,
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp()
                            });
                            successCount++;
                        } else {
                            duplicateCount++;
                        }
                    } catch (error) {
                        console.error('Error adding video:', video.videoId, error);
                    }
                }
                
                // Show success message
                let message = `Successfully imported ${successCount} videos.`;
                if (duplicateCount > 0) {
                    message += ` ${duplicateCount} videos were already in the database.`;
                }
                showStatus(message, 'success');
                
                // Reload videos after import
                loadVideos();
                
            } catch (error) {
                console.error('Error importing playlist:', error);
                showStatus(`Error: ${error.message}`, 'error');
            } finally {
                spinner.classList.add('d-none');
                importPlaylistSubmit.disabled = false;
            }
        });
    }
    
    // Helper function to show status messages
    function showStatus(message, type = 'info') {
        const statusElement = document.getElementById('playlistStatus');
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.className = `alert alert-${type}`;
        statusElement.classList.remove('d-none');
    }
}

// Extract playlist ID from URL
function extractPlaylistId(url) {
    if (!url) return null;
    
    try {
        // Try to extract using URL API first
        try {
            const urlObj = new URL(url);
            const listId = urlObj.searchParams.get('list');
            if (listId) return listId.split('#')[0].trim();
        } catch (e) {
            // If URL parsing fails, continue with regex
        }
        
        // Common patterns for playlist URLs
        const patterns = [
            /[&?]list=([^&#]+)/i,  // Standard format
            /youtube\.com\/playlist\?list=([^&#]+)/i,  // Direct playlist URL
            /youtube\.com\/watch\?.*list=([^&#]+)/i,   // Watch URL with list parameter
            /youtu\.be\/.*[?&]list=([^&#]+)/i,        // Short URL with list parameter
            /youtube\.com\/embed\/videoseries\?list=([^&#]+)/i,  // Embedded playlist
            /youtube\.com\/watch\?v=[^&]+&list=([^&#]+)/i  // Watch URL with video ID and list parameter
        ];
        
        // Try each pattern
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1].split('&')[0].split('#')[0].trim();
            }
        }
        
        // Try to extract from the end of the URL as a last resort
        const listMatch = url.split('list=')[1];
        if (listMatch) {
            return listMatch.split('&')[0].split('#')[0].trim();
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting playlist ID:', error);
        return null;
    }
}

// Check if a video already exists in the database
async function checkIfVideoExists(videoId) {
    try {
        const q = query(collection(db, 'videos'), where('videoId', '==', videoId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking if video exists:', error);
        return false;
    }
}
