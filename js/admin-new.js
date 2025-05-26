// Import Firebase services from the modular SDK (version 10.7.1 to match admin.html)
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc,
    query, 
    where, 
    orderBy, 
    onSnapshot,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Get Firestore and Auth instances from window object
const db = window.db;
const auth = window.auth;

// DOM Elements
const videosList = document.getElementById('videosList');
const videoForm = document.getElementById('videoForm');
const videoFormModal = new bootstrap.Modal(document.getElementById('videoFormModal'));
const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
const searchInput = document.getElementById('searchVideos');
const filterSubject = document.getElementById('filterSubject');
const addVideoBtn = document.getElementById('addVideoBtn');
const saveVideoBtn = document.getElementById('saveVideoBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// State variables
let currentVideoId = null;
let videos = [];
let unsubscribeVideos = null;

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

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Show notification
function showNotification(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.role = 'alert';
    alertDiv.style.zIndex = '9999';
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${icon} me-2"></i>
            <div>${message}</div>
            <button type="button" class="btn-close ms-2" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }
    }, 5000);
}

// Toggle loading state
function setLoading(button, isLoading) {
    const spinner = button.querySelector('.spinner-border');
    const buttonText = button.querySelector('.button-text');
    
    if (isLoading) {
        button.disabled = true;
        if (spinner) spinner.classList.remove('d-none');
        if (buttonText) buttonText.textContent = 'Saving...';
    } else {
        button.disabled = false;
        if (spinner) spinner.classList.add('d-none');
        if (buttonText) buttonText.textContent = 'Save Video';
    }
}

// Render videos in the table
function renderVideos(videosToRender = []) {
    if (!videosToRender.length) {
        videosList.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <i class="fas fa-video-slash fa-2x mb-3 text-muted"></i>
                    <p class="mb-0">No videos found</p>
                </td>
            </tr>
        `;
        return;
    }

    
    videosList.innerHTML = videosToRender.map(video => {
        const videoId = extractYouTubeId(video.videoUrl);
        const thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        
        return `
            <tr data-id="${video.id}">
                <td style="width: 120px;">
                    <img src="${thumbnailUrl}" alt="${video.title}" class="img-thumbnail" style="width: 100px; height: 60px; object-fit: cover;">
                </td>
                <td>
                    <div class="fw-semibold">${video.title}</div>
                    <small class="text-muted">${video.description?.substring(0, 60)}${video.description?.length > 60 ? '...' : ''}</small>
                </td>
                <td>
                    <span class="badge bg-primary">${SUBJECTS[video.subject] || video.subject}</span>
                </td>
                <td>${formatDate(video.createdAt?.toDate())}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary edit-video" data-id="${video.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-video" data-id="${video.id}" data-title="${video.title}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load videos from Firestore
function loadVideos() {
    videosList.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 mb-0">Loading videos...</p>
            </td>
        </tr>
    `;
    
    // Unsubscribe from previous listener if exists
    if (unsubscribeVideos) {
        unsubscribeVideos();
    }
    
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'));
    
    unsubscribeVideos = onSnapshot(q, (querySnapshot) => {
        videos = [];
        querySnapshot.forEach((doc) => {
            videos.push({ id: doc.id, ...doc.data() });
        });
        
        renderVideos(videos);
        setupEventListeners();
    }, (error) => {
        console.error('Error loading videos:', error);
        showNotification('Error loading videos. Please refresh the page.', 'danger');
    });
}

// Filter videos based on search and subject
function filterVideos() {
    const searchTerm = searchInput.value.toLowerCase();
    const subjectFilter = filterSubject.value;
    
    let filteredVideos = [...videos];
    
    if (searchTerm) {
        filteredVideos = filteredVideos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) ||
            (video.description && video.description.toLowerCase().includes(searchTerm)) ||
            (video.tags && video.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
    
    if (subjectFilter) {
        filteredVideos = filteredVideos.filter(video => video.subject === subjectFilter);
    }
    
    renderVideos(filteredVideos);
}

// Show video form for adding/editing
async function showVideoForm(videoId = null) {
    const form = document.getElementById('videoForm');
    form.reset();
    
    if (videoId) {
        // Edit mode
        document.getElementById('videoModalLabel').textContent = 'Edit Video';
        document.getElementById('saveVideoBtn').innerHTML = '<span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span> Update Video';
        
        try {
            const videoDoc = await getDoc(doc(db, 'videos', videoId));
            if (videoDoc.exists()) {
                const video = { id: videoDoc.id, ...videoDoc.data() };
                currentVideoId = video.id;
                
                // Populate form
                document.getElementById('videoId').value = video.id;
                document.getElementById('videoTitle').value = video.title || '';
                document.getElementById('videoSubject').value = video.subject || '';
                document.getElementById('videoDescription').value = video.description || '';
                document.getElementById('videoUrl').value = video.videoUrl || '';
                document.getElementById('videoThumbnail').value = video.thumbnailUrl || '';
                document.getElementById('videoTags').value = video.tags ? video.tags.join(', ') : '';
            }
        } catch (error) {
            console.error('Error loading video:', error);
            showNotification('Error loading video details', 'danger');
            return;
        }
    } else {
        // Add new mode
        document.getElementById('videoModalLabel').textContent = 'Add New Video';
        document.getElementById('saveVideoBtn').innerHTML = '<span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span> Save Video';
        currentVideoId = null;
    }
    
    videoFormModal.show();
}

// Handle video form submission
async function handleVideoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const saveButton = form.querySelector('button[type="submit"]');
    
    try {
        setLoading(saveButton, true);
        
        const videoData = {
            title: form.videoTitle.value.trim(),
            subject: form.videoSubject.value,
            description: form.videoDescription.value.trim(),
            videoUrl: form.videoUrl.value.trim(),
            thumbnailUrl: form.videoThumbnail.value.trim() || null,
            tags: form.videoTags.value ? form.videoTags.value.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            updatedAt: serverTimestamp()
        };
        
        if (!currentVideoId) {
            // Add new video
            videoData.createdAt = serverTimestamp();
            await addDoc(collection(db, 'videos'), videoData);
            showNotification('Video added successfully!');
        } else {
            // Update existing video
            await updateDoc(doc(db, 'videos', currentVideoId), videoData);
            showNotification('Video updated successfully!');
        }
        
        videoFormModal.hide();
    } catch (error) {
        console.error('Error saving video:', error);
        showNotification('Error saving video. Please try again.', 'danger');
    } finally {
        setLoading(saveButton, false);
    }
}

// Handle video deletion
async function handleDeleteVideo(videoId, videoTitle) {
    if (!videoId) return;
    
    document.getElementById('videoToDeleteTitle').textContent = videoTitle || 'this video';
    
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    // Remove previous event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', async () => {
        try {
            const spinner = newConfirmBtn.querySelector('.spinner-border');
            const buttonText = newConfirmBtn.querySelector('.button-text');
            
            if (spinner) spinner.classList.remove('d-none');
            if (buttonText) buttonText.textContent = 'Deleting...';
            newConfirmBtn.disabled = true;
            
            await deleteDoc(doc(db, 'videos', videoId));
            
            modal.hide();
            showNotification('Video deleted successfully!');
        } catch (error) {
            console.error('Error deleting video:', error);
            showNotification('Error deleting video. Please try again.', 'danger');
        }
    });
    
    modal.show();
}

// Set up event listeners
function setupEventListeners() {
    // Add video button
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => showVideoForm());
    }
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', filterVideos);
    }
    
    // Subject filter
    if (filterSubject) {
        filterSubject.addEventListener('change', filterVideos);
    }
    
    // Video form submission
    if (videoForm) {
        videoForm.addEventListener('submit', handleVideoSubmit);
    }
    
    // Edit and delete buttons
    document.querySelectorAll('.edit-video').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const videoId = e.currentTarget.dataset.id;
            showVideoForm(videoId);
        });
    });
    
    document.querySelectorAll('.delete-video').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const videoId = e.currentTarget.dataset.id;
            const videoTitle = e.currentTarget.dataset.title;
            handleDeleteVideo(videoId, videoTitle);
        });
    });
}

// Initialize the admin dashboard
const initAdmin = async function() {
    console.log('Admin module loaded, checking authentication...');
    
    try {
        // Check if Firebase services are available
        if (!window.auth || !window.db) {
            console.error('Firebase services not properly initialized');
            throw new Error('Authentication service is not available. Please refresh the page.');
        }
        
        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
            console.log('No user signed in, redirecting to login...');
            window.location.href = 'login.html';
            return;
        }
        
        // Load videos
        loadVideos();
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up event delegation for dynamically added elements
        document.addEventListener('click', (e) => {
            // Handle edit button clicks on dynamically added elements
            if (e.target.closest('.edit-video')) {
                const btn = e.target.closest('.edit-video');
                const videoId = btn.dataset.id;
                showVideoForm(videoId);
            }
            
            // Handle delete button clicks on dynamically added elements
            if (e.target.closest('.delete-video')) {
                const btn = e.target.closest('.delete-video');
                const videoId = btn.dataset.id;
                const videoTitle = btn.dataset.title;
                handleDeleteVideo(videoId, videoTitle);
            }
        });
        
        console.log('Admin dashboard initialized');
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        showNotification('Error initializing admin dashboard. Please refresh the page.', 'danger');
        throw error; // Re-throw to be caught by the calling function
    }
    
    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
        console.log('No user signed in, redirecting to login...');
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

    // Get Firebase services from window object
    const db = window.db;
    const auth = window.auth;
    
    if (!db || !auth) {
        const errorMsg = 'Firebase services not properly initialized. Please refresh the page.';
        console.error(errorMsg);
        showNotification(errorMsg, 'error');
        throw new Error(errorMsg);
    }
    
    console.log('Firebase services initialized successfully');
    
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
        
        try {
            // Initialize all required DOM elements
            videoFormContainer = document.getElementById('video-form-container');
            videoForm = document.getElementById('video-form');
            videoIdInput = document.getElementById('video-id');
            videoUrlInput = document.getElementById('video-url');
            videoTitleInput = document.getElementById('video-title');
            videoDescriptionInput = document.getElementById('video-description');
            videoThumbnailInput = document.getElementById('video-thumbnail');
            subjectSelect = document.getElementById('subject');
            cancelVideoBtn = document.getElementById('cancel-video-btn');
            searchInput = document.getElementById('search-videos');
            subjectFilter = document.getElementById('subject-filter');
            videosList = document.getElementById('videos-list');
            sidebarLinks = document.querySelectorAll('.sidebar a[data-section]');
            contentSections = document.querySelectorAll('.content-section');
            
            console.log('UI Elements initialized:', {
                videoFormContainer: !!videoFormContainer,
                videoForm: !!videoForm,
                videoIdInput: !!videoIdInput,
                videoUrlInput: !!videoUrlInput,
                videoTitleInput: !!videoTitleInput,
                subjectSelect: !!subjectSelect
            });
            
            // Ensure the form is hidden by default
            if (videoFormContainer) {
                videoFormContainer.style.display = 'none';
            } else {
                console.error('Video form container not found in the DOM');
            }
            
            // Set default form values
            resetForm();
            
        } catch (error) {
            console.error('Error initializing UI components:', error);
            throw error; // Re-throw to be caught by the outer try-catch
        }
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

        // Add video button - simplified and more reliable approach
        console.log('Setting up add video button...');
        const addVideoBtn = document.getElementById('add-video-btn');
        
        if (addVideoBtn) {
            console.log('Found add video button, adding click handler');
            
            // Remove any existing click handlers first
            const newBtn = addVideoBtn.cloneNode(true);
            addVideoBtn.parentNode.replaceChild(newBtn, addVideoBtn);
            
            // Add new click handler
            newBtn.addEventListener('click', function(e) {
                console.log('Add video button clicked');
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    showVideoForm();
                } catch (error) {
                    console.error('Error in add video click handler:', error);
                    showNotification('Error opening video form. Please try again.', 'error');
                }
            });
            
            // Make sure the button is enabled
            newBtn.disabled = false;
            console.log('Add video button setup complete');
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
            console.log('Initializing video form...');
            
            // Re-initialize form elements in case they weren't available before
            if (!videoFormContainer) videoFormContainer = document.getElementById('video-form-container');
            if (!videoForm) videoForm = document.getElementById('video-form');
            if (!videoIdInput) videoIdInput = document.getElementById('video-id');
            if (!videoUrlInput) videoUrlInput = document.getElementById('video-url');
            if (!videoTitleInput) videoTitleInput = document.getElementById('video-title');
            if (!videoDescriptionInput) videoDescriptionInput = document.getElementById('video-description');
            if (!videoThumbnailInput) videoThumbnailInput = document.getElementById('video-thumbnail');
            if (!subjectSelect) subjectSelect = document.getElementById('subject');
            
            console.log('Form elements:', {
                videoFormContainer: !!videoFormContainer,
                videoForm: !!videoForm,
                videoIdInput: !!videoIdInput,
                videoUrlInput: !!videoUrlInput,
                videoTitleInput: !!videoTitleInput,
                subjectSelect: !!subjectSelect
            });
            
            if (!videoFormContainer) {
                throw new Error('Video form container not found in the DOM');
            }
            
            // Set form title
            const formTitle = document.querySelector('#video-form h3');
            if (formTitle) {
                formTitle.textContent = isEditMode ? 'Edit Video' : 'Add New Video';
                console.log('Form title set to:', formTitle.textContent);
            } else {
                console.warn('Form title element not found');
            }
            
            // Reset form first
            resetForm();
            
            // If editing, populate form with video data
            if (isEditMode) {
                console.log('Editing existing video:', video);
                currentEditId = video.id;
                if (videoIdInput) videoIdInput.value = video.id || '';
                if (videoUrlInput) videoUrlInput.value = video.url || '';
                if (videoTitleInput) videoTitleInput.value = video.title || '';
                if (videoDescriptionInput) videoDescriptionInput.value = video.description || '';
                if (videoThumbnailInput) videoThumbnailInput.value = video.thumbnail || '';
                if (subjectSelect) subjectSelect.value = video.subject || '';
            } else {
                console.log('Adding new video');
                currentEditId = null;
            }
            
            // Show the form with animation
            console.log('Showing video form');
            videoFormContainer.style.display = 'block';
            videoFormContainer.style.opacity = '0';
            
            // Force reflow to ensure the transition works
            void videoFormContainer.offsetHeight;
            
            videoFormContainer.style.opacity = '1';
            videoFormContainer.style.transition = 'opacity 0.3s ease-in-out';
            
            // Scroll to form
            setTimeout(() => {
                videoFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                // Focus first input field
                const firstInput = videoForm?.querySelector('input:not([type="hidden"]), select');
                if (firstInput) {
                    firstInput.focus();
                } else {
                    console.warn('Could not find first input field to focus');
                }
            }, 10);
            
        } catch (error) {
            console.error('Error in showVideoForm:', error);
            showNotification(`Error: ${error.message}. Please check console for details.`, 'error');
        }
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
        
        // Validate form
        if (!videoUrlInput.value.trim()) {
            showNotification('Please enter a YouTube video URL', 'error');
            videoUrlInput.focus();
            return;
        }
        
        if (!videoTitleInput.value.trim()) {
            showNotification('Please enter a video title', 'error');
            videoTitleInput.focus();
            return;
        }
        
        if (!subjectSelect.value) {
            showNotification('Please select a subject', 'error');
            subjectSelect.focus();
            return;
        }
        
        // Extract YouTube video ID
        const youtubeId = extractYouTubeId(videoUrlInput.value.trim());
        if (!youtubeId) {
            showNotification('Please enter a valid YouTube URL', 'error');
            videoUrlInput.focus();
            return;
        }
        
        // Get form values
        const videoData = {
            url: `https://www.youtube.com/watch?v=${youtubeId}`,
            title: videoTitleInput.value.trim(),
            description: videoDescriptionInput.value.trim(),
            thumbnail: videoThumbnailInput.value.trim() || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
            subject: subjectSelect.value,
            youtubeId: youtubeId,
            createdAt: isEditMode ? undefined : serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        try {
            // Show loading state
            const submitBtn = videoForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            if (isEditMode && currentEditId) {
                // Update existing video
                await updateVideo(videoData);
                showNotification('Video updated successfully!', 'success');
            } else {
                // Add new video
                await addVideo(videoData);
                showNotification('Video added successfully!', 'success');
            }
            
            // Reset form
            resetForm();
            
        } catch (error) {
            console.error('Error saving video:', error);
            showNotification(`Failed to save video: ${error.message}`, 'error');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    }

    // Extract YouTube video ID from URL
    function extractYouTubeId(url) {
        try {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        } catch (error) {
            console.error('Error extracting YouTube ID:', error);
            return null;
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
                }
                
                // Reset form
                resetForm();
                
            } catch (error) {
                console.error('Error saving video:', error);
                showNotification(`Failed to save video: ${error.message}`, 'error');
            } finally {
                // Reset button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        showNotification('Error initializing admin dashboard. Please refresh the page.', 'danger');
        throw error; // Re-throw to be caught by the calling function
    }
};

// Export the initAdmin function
export { initAdmin };

// Initialize the admin dashboard when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
    initializeAdmin();
}

async function initializeAdmin() {
    try {
        await initAdmin();
    } catch (error) {
        console.error('Error initializing admin:', error);
        // Show error to user if needed
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="alert alert-danger m-4">
                    <h4 class="alert-heading">Error Initializing Admin</h4>
                    <p>There was an error initializing the admin interface. Please try refreshing the page.</p>
                    <hr>
                    <p class="mb-0">${error.message || 'Unknown error occurred'}</p>
                </div>
            `;
        }
    }
}
