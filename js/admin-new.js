// Import Firebase services from the modular SDK
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    getFirestore
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { getCurrentUser } from './firebase.js';

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

// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Get references to DOM elements
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

    // State variables
    let isEditMode = false;
    let currentEditId = null;
    let videos = [];
    let unsubscribeVideos = null;
    let currentFilterSubject = '';
    let currentSearchTerm = '';

    // Initialize Firestore and Storage
    let db, storage, auth;

    try {
        // Get the initialized app from window
        db = getFirestore();
        storage = getStorage();
        auth = window.auth; // Get auth from window (set in admin.html)
        
        if (!auth) {
            throw new Error('Authentication service not available');
        }
        
        console.log('Firebase services initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase services:', error);
        showNotification('Error initializing the application. Please refresh the page.', 'error');
        throw error;
    }

    // Initialize Firestore collection reference
    const videosCollection = collection(db, 'videos');

    // Initialize the admin dashboard
    function initAdmin() {
        console.log('Initializing admin dashboard...');
        try {
            // Initialize UI components first
            initializeUI();
            // Then set up event listeners
            setupEventListeners();
            // Finally load the videos
            loadVideos();
            console.log('Admin dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing admin dashboard:', error);
            // Show error to user
            showNotification('Error initializing admin dashboard. Please check console for details.', 'error');
            throw error; // Re-throw to be caught by the outer try-catch
        }
    }
    
    // Initialize UI components
    function initializeUI() {
        console.log('Initializing UI components...');
        // Ensure the form is hidden by default
        if (videoFormContainer) {
            videoFormContainer.style.display = 'none';
        }
        // Set default form values
        resetForm();
    }

    // Set up event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Sidebar navigation
        if (sidebarLinks && sidebarLinks.length > 0) {
            console.log('Setting up sidebar links...');
            sidebarLinks.forEach(link => {
                // Remove any existing click handlers
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
                
                newLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sectionId = newLink.getAttribute('data-section');
                    console.log('Sidebar link clicked, showing section:', sectionId);
                    showSection(sectionId);
                });
            });
        } else {
            console.warn('No sidebar links found');
        }

        // Video form submission
        if (videoForm) {
            console.log('Setting up video form submission...');
            videoForm.addEventListener('submit', handleVideoSubmit);
        } else {
            console.warn('Video form not found');
        }

        // Add video button
        console.log('Setting up add video button...');
        const addVideoBtn = document.getElementById('add-video-btn');
        
        if (addVideoBtn) {
            console.log('Found add video button');
            
            // Create a new button to replace the existing one (avoids duplicate event listeners)
            const newButton = addVideoBtn.cloneNode(true);
            addVideoBtn.parentNode.replaceChild(newButton, addVideoBtn);
            
            // Add click handler with better error handling
            newButton.addEventListener('click', function handleAddVideoClick(e) {
                console.log('Add video button clicked');
                try {
                    e.preventDefault();
                    e.stopPropagation();
                    showVideoForm();
                } catch (error) {
                    console.error('Error in add video click handler:', error);
                    showNotification('Error opening video form. Please try again.', 'error');
                }
            });
            
            // Log button details for debugging
            console.log('Add video button properties:', {
                id: newButton.id,
                classList: Array.from(newButton.classList),
                parentElement: newButton.parentElement?.tagName,
                isConnected: newButton.isConnected,
                disabled: newButton.disabled
            });
            
            // Make sure the button is enabled
            newButton.disabled = false;
        } else {
            console.error('Add video button not found in the DOM');
            showNotification('Error: Could not initialize the Add Video button', 'error');
        }

        // Cancel button
        if (cancelVideoBtn) {
            cancelVideoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                resetForm();
            });
        }

        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', filterVideos);
        }

        // Subject filter
        if (subjectFilter) {
            subjectFilter.addEventListener('change', filterVideos);
        }
    }


    // Filter videos based on search and subject filters
    function filterVideos() {
        currentSearchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        currentFilterSubject = subjectFilter ? subjectFilter.value : '';

        const filteredVideos = videos.filter(video => {
            // Skip if video has no subject (shouldn't happen, but just in case)
            if (!video.subject) return false;
            
            const matchesSearch = !currentSearchTerm || 
                (video.title && video.title.toLowerCase().includes(currentSearchTerm)) || 
                (video.description && video.description.toLowerCase().includes(currentSearchTerm));
                
            const matchesSubject = !currentFilterSubject || video.subject === currentFilterSubject;

            return matchesSearch && matchesSubject;
        });
        
        renderVideos(filteredVideos);
        return filteredVideos;
    }

    // Show a specific section
    function showSection(sectionId) {
        // Hide all sections
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const section = document.getElementById(`${sectionId}-section`);
        if (section) {
            section.classList.add('active');
        }
        
        // Update active state in sidebar
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });
    }

    // Show video form for adding/editing
    function showVideoForm(video = null) {
        console.log('showVideoForm called with video:', video);
        isEditMode = !!video;
        
        try {
            // Ensure the form container is visible
            if (!videoFormContainer) {
                console.error('Video form container not found');
                videoFormContainer = document.getElementById('video-form-container');
                if (!videoFormContainer) {
                    throw new Error('Video form container element not found');
                }
            }
            
            // Set form title
            const formTitle = document.querySelector('#video-form h3');
            if (formTitle) {
                formTitle.textContent = isEditMode ? 'Edit Video' : 'Add New Video';
                console.log('Form title set to:', formTitle.textContent);
            } else {
                console.error('Form title element not found');
            }
            
            // Show the form with animation
            videoFormContainer.style.display = 'block';
            videoFormContainer.style.opacity = '0';
            setTimeout(() => {
                videoFormContainer.style.opacity = '1';
                videoFormContainer.style.transition = 'opacity 0.3s ease-in-out';
                
                // Scroll to form
                videoFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 10);
            
            // Focus first input field
            const firstInput = document.querySelector('#video-form input, #video-form select');
            if (firstInput) firstInput.focus();
            
        } catch (error) {
            console.error('Error showing video form:', error);
            showNotification('Error showing video form. Please check console for details.', 'error');
        }
        
        // If editing, populate form with video data
        if (isEditMode) {
            currentEditId = video.id;
            videoIdInput.value = video.id;
            videoUrlInput.value = video.url || '';
            videoTitleInput.value = video.title || '';
            videoDescriptionInput.value = video.description || '';
            videoThumbnailInput.value = video.thumbnail || '';
            subjectSelect.value = video.subject || '';
        }
        
        // Show the form
        videoFormContainer.style.display = 'block';
        
        // Scroll to form
        videoFormContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Reset the video form
    function resetForm() {
        videoForm.reset();
        videoIdInput.value = '';
        videoFormContainer.style.display = 'none';
        isEditMode = false;
        currentEditId = null;
    }

    // Handle video form submission
    async function handleVideoSubmit(e) {
        e.preventDefault();
        
        // Get form values
        const videoData = {
            url: videoUrlInput.value.trim(),
            title: videoTitleInput.value.trim(),
            description: videoDescriptionInput.value.trim(),
            thumbnail: videoThumbnailInput.value.trim(),
            subject: subjectSelect.value,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        try {
            if (isEditMode && currentEditId) {
                // Update existing video
                await updateVideo(videoData);
            } else {
                // Add new video
                await addVideo(videoData);
            }
            
            // Reset form
            resetForm();
            
        } catch (error) {
            console.error('Error saving video:', error);
            showNotification('Failed to save video. Please try again.', 'error');
        }
    }

    // Extract YouTube video ID from URL
    function extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
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
            const docRef = await addDoc(videosCollection, video);
            showNotification('Video added successfully!', 'success');
            return { id: docRef.id, ...video };
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
            await deleteDoc(doc(db, 'videos', id));
            showNotification('Video deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting video:', error);
            showNotification('Failed to delete video. Please try again.', 'error');
        }
    }

    // Render videos in the list with subject badges
    function renderVideos(videosToRender) {
        if (!videosToRender) videosToRender = videos;
        
        videoList.innerHTML = '';
        
        if (videosToRender.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <i class="fas fa-video-slash"></i>
                <h3>No videos found</h3>
                <p>${currentSearchTerm || currentFilterSubject ? 'Try adjusting your search or filter' : 'Add a new video to get started'}</p>
            `;
            videoList.appendChild(noResults);
            return;
        }
        
        videosToRender.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'video-item';
            
            // Format subject badge
            const subjectName = SUBJECTS[video.subject] || video.subject || 'Uncategorized';
            const subjectBadge = video.subject ? 
                `<span class="subject-badge badge-${video.subject}">${subjectName}</span>` : '';
                
            videoElement.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${video.thumbnail || 'https://via.placeholder.com/160x90'}" 
                         alt="${video.title || 'Video thumbnail'}" 
                         onerror="this.src='https://via.placeholder.com/160x90?text=No+Thumbnail'">
                </div>
                <div class="video-details">
                    <h3>${video.title || 'Untitled Video'}</h3>
                    <p class="video-description">${video.description || 'No description available.'}</p>
                    <div class="video-meta">
                        ${subjectBadge}
                        <span class="date">
                            <i class="far fa-calendar-alt"></i> 
                            ${formatDate(video.createdAt?.toDate() || new Date())}
                        </span>
                    </div>
                </div>
                <div class="video-actions">
                    <button class="btn btn-edit" data-id="${video.id}" title="Edit video">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-delete" data-id="${video.id}" title="Delete video">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            videoList.appendChild(videoElement);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const videoId = e.currentTarget.getAttribute('data-id');
                const video = videos.find(v => v.id === videoId);
                if (video) showVideoForm(video);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const videoId = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
                    deleteVideo(videoId);
                }
            });
        });
    }

    // Helper function to format date
    function formatDate(date) {
        if (!date) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Show notification
    function showNotification(message, type = 'success') {
        // You can implement a notification system here
        alert(`${type.toUpperCase()}: ${message}`);
    }
    
    // Initialize the admin dashboard
    initAdmin();
});
