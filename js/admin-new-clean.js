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

// Firebase instances will be passed during initialization
let db;
let auth;

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
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
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
    const spinner = button?.querySelector('.spinner-border');
    const buttonText = button?.querySelector('.button-text');
    
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

// Available teachers with display names
const TEACHERS = {
    'khan': 'Khan Sir',
    'sarah': 'Sarah Johnson',
    'david': 'David Miller',
    'priya': 'Priya Sharma',
    'other': 'Other'
};

// Render videos in the table
function renderVideos(videosToRender = []) {
    if (!videosToRender.length) {
        videosList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
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
                <td>
                    <span class="badge bg-info">${TEACHERS[video.teacher] || video.teacher || 'N/A'}</span>
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
                document.getElementById('videoTeacher').value = video.teacher || '';
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
            teacher: form.videoTeacher.value,
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

// Generate AI description using a prompt-based approach
async function generateAIDescription(title) {
    try {
        // Get the generate button and show loading state
        const generateBtn = document.getElementById('generateDescriptionBtn');
        const originalBtnText = generateBtn.innerHTML;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
        
        // This is a placeholder for the actual AI generation
        // In a production environment, you would call your AI service here
        // For now, we'll use a simple template-based approach
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate a simple description based on the title
        const subjects = {
            'history': 'history',
            'geography': 'geography',
            'mathematics': 'mathematics',
            'science': 'science',
            'english': 'English language',
            'gk': 'general knowledge',
            'reasoning': 'logical reasoning',
            'polity': 'political science',
            'economics': 'economics',
            'environment': 'environmental studies',
            'current-affairs': 'current affairs'
        };
        
        const subject = document.getElementById('videoSubject').value;
        const subjectName = subjects[subject] || 'this subject';
        
        const descriptions = [
            `In this comprehensive video, we dive deep into "${title}", exploring key concepts and insights about ${subjectName}. Perfect for students and enthusiasts looking to enhance their understanding.`,
            `Discover everything you need to know about "${title}" in this detailed tutorial. We cover all the essential aspects of ${subjectName} to help you master the topic.`,
            `Learn about "${title}" with our expert-led session. This video provides valuable knowledge and practical examples to help you understand ${subjectName} better.`,
            `Join us as we explore "${title}" in this informative video. We break down complex concepts into easy-to-understand segments for effective learning.`,
            `"${title}" explained in detail! This video covers all the important aspects of ${subjectName}, making it perfect for exam preparation and self-study.`
        ];
        
        // Return a random description from the array
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    } catch (error) {
        console.error('Error generating description:', error);
        showNotification('Failed to generate description. Please try again.', 'danger');
        return null;
    } finally {
        const generateBtn = document.getElementById('generateDescriptionBtn');
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic me-1"></i> Generate with AI';
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Add video button
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => showVideoForm());
    }
    
    // Generate AI description button
    document.addEventListener('click', async (e) => {
        if (e.target && (e.target.id === 'generateDescriptionBtn' || e.target.closest('#generateDescriptionBtn'))) {
            const title = document.getElementById('videoTitle').value.trim();
            const descriptionField = document.getElementById('videoDescription');
            
            if (!title) {
                showNotification('Please enter a video title first', 'warning');
                document.getElementById('videoTitle').focus();
                return;
            }
            
            const description = await generateAIDescription(title);
            if (description) {
                descriptionField.value = description;
            }
        }
    });
    
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
        
        // Add input event to enable/disable generate button based on title
        const titleInput = videoForm.querySelector('#videoTitle');
        const generateBtn = videoForm.querySelector('#generateDescriptionBtn');
        
        if (titleInput && generateBtn) {
            titleInput.addEventListener('input', () => {
                generateBtn.disabled = !titleInput.value.trim();
            });
        }
    }
    
    // Edit and delete buttons (for dynamically added elements)
    document.addEventListener('click', (e) => {
        // Handle edit button clicks
        if (e.target.closest('.edit-video')) {
            const btn = e.target.closest('.edit-video');
            const videoId = btn.dataset.id;
            showVideoForm(videoId);
        }
        
        // Handle delete button clicks
        if (e.target.closest('.delete-video')) {
            const btn = e.target.closest('.delete-video');
            const videoId = btn.dataset.id;
            const videoTitle = btn.dataset.title;
            handleDeleteVideo(videoId, videoTitle);
        }
    });
}

// Get current user from auth
async function getCurrentUser() {
    if (!auth) {
        console.error('Firebase Auth not initialized');
        return null;
    }
    return auth.currentUser;
}

// Initialize the admin dashboard with Firebase instances
const initAdmin = async function(firebaseInstances) {
    console.log('Admin module loaded, initializing...');
    
    try {
        // Set Firebase instances
        auth = firebaseInstances.auth;
        db = firebaseInstances.db;
        
        if (!auth || !db) {
            console.error('Firebase services not properly initialized');
            throw new Error('Authentication service is not available. Please refresh the page.');
        }
        
        // Check if user is authenticated
        const user = auth.currentUser;
        if (!user) {
            console.log('No user signed in, redirecting to login...');
            window.location.href = 'login.html';
            return;
        }
        
        // Initialize the UI
        loadVideos();
        setupEventListeners();
        
        console.log('Admin dashboard initialized');
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        showNotification('Error initializing admin dashboard. Please refresh the page.', 'danger');
        throw error;
    }
};

// Export the initAdmin function
export { initAdmin };

// Error handling for the admin module
function handleAdminError(error) {
    console.error('Error in admin module:', error);
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
