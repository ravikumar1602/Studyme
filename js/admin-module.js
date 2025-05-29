// Admin Module

// Global variables
let videos = [];
let unsubscribeVideos = null;
let db = null;

// Safe function to show modal
function showModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
        console.error('Modal element not found:', modalId);
        return null;
    }
    
    try {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            return modal;
        } else {
            // Fallback if Bootstrap is not available
            console.warn('Bootstrap Modal not available, using fallback');
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            document.body.classList.add('modal-open');
            return {
                hide: () => {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                    document.body.classList.remove('modal-open');
                }
            };
        }
    } catch (error) {
        console.error('Error showing modal:', error);
        return null;
    }
}

// Initialize the admin dashboard
export async function initAdmin({ auth: authInstance, db: dbInstance }) {
    console.log('Initializing admin module...');
    auth = authInstance;
    db = dbInstance;
    
    try {
        // Check if user is authenticated
        const user = authInstance.currentUser;
        if (!user) {
            console.log('No user logged in, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('User authenticated:', user.email);
        
        // Show main content
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // Initialize UI components
        initializeUI();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start with dashboard
        navigateToSection('dashboard');
        
        // Log admin login
        await logActivity('Admin Login', 'Admin dashboard accessed');
        
    } catch (error) {
        console.error('Error initializing admin module:', error);
        showNotification('Error initializing admin: ' + (error.message || 'Unknown error'), 'error');
        
        // Make sure loading spinner is hidden
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        // Show main content even if there's an error
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    }
}

// Initialize UI components
function initializeUI() {
    console.log('Initializing UI components...');
    
    // Initialize any UI components here
    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => {
            // Handle add video button click
            console.log('Add video button clicked');
            // You can open a modal or form here
        });
    }
    
    // Initialize other UI components as needed
}

// Render videos in the UI
function renderVideos() {
    console.log('Rendering videos...');
    const videosList = document.getElementById('videosList');
    
    if (!videosList) {
        console.warn('Videos list element not found');
        return;
    }
    
    if (videos.length === 0) {
        videosList.innerHTML = '<tr><td colspan="5" class="text-center py-4">No videos found</td></tr>';
        return;
    }
    
    // Clear existing content
    videosList.innerHTML = '';
    
    // Add each video to the list
    videos.forEach(video => {
        const videoRow = document.createElement('tr');
        const videoId = video.videoUrl ? extractVideoId(video.videoUrl) : '';
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 'https://via.placeholder.com/120x68?text=No+Thumbnail';
        
        videoRow.innerHTML = `
            <td class="align-middle">
                <div class="video-thumbnail" style="width: 120px;">
                    <img src="${thumbnailUrl}" alt="${video.title || 'Video Thumbnail'}" 
                         class="img-thumbnail p-0 border-0" style="width: 100%; height: auto;">
                </div>
            </td>
            <td class="align-middle">
                <div class="fw-bold">${video.title || 'Untitled'}</div>
                ${video.description ? `<div class="text-muted small">${video.description.substring(0, 60)}${video.description.length > 60 ? '...' : ''}</div>` : ''}
            </td>
            <td class="align-middle">
                <span class="badge bg-primary">${video.subject || 'N/A'}</span>
            </td>
            <td class="align-middle">
                <div class="small">${formatDate(video.createdAt?.toDate()) || 'N/A'}</div>
                <div class="badge ${video.status === 'published' ? 'bg-success' : 'bg-warning text-dark'}">
                    ${video.status || 'draft'}
                </div>
            </td>
            <td class="text-end align-middle">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary edit-video" data-id="${video.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger delete-video" data-id="${video.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        videosList.appendChild(videoRow);
    });
    
    console.log('Videos rendered');
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
    if (!url) return '';
    
    // Handle youtu.be URLs
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : '';
}

// Format date for display
function formatDate(date) {
    if (!date) return 'N/A';
    
    try {
        // If it's a Firestore timestamp, convert to Date
        const dateObj = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        
        // Format the date
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        return new Intl.DateTimeFormat('en-US', options).format(dateObj);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Date Error';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // You can implement a notification system here
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Simple alert for now
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container-fluid');
    if (container) {
        container.prepend(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Navigation function
function navigateToSection(sectionId) {
    console.log('Navigating to section:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkSection = link.getAttribute('data-section');
        if (linkSection === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Load section-specific data
    if (sectionId === 'dashboard') {
        loadDashboardData();
    } else if (sectionId === 'videos') {
        loadVideos();
    }
    // Add more sections as needed
}

// Load dashboard data
async function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    try {
        // Load videos count
        const videosSnapshot = await db.collection('videos').get();
        const totalVideos = videosSnapshot.size;
        document.getElementById('totalVideos').textContent = totalVideos;
        
        // Load users count (you'll need to enable Firestore for users if not already)
        try {
            const usersSnapshot = await db.collection('users').get();
            document.getElementById('totalUsers').textContent = usersSnapshot.size;
        } catch (error) {
            console.warn('Could not load users count:', error);
            document.getElementById('totalUsers').textContent = 'N/A';
        }
        
        // Load categories count (assuming you have a categories collection)
        try {
            const categoriesSnapshot = await db.collection('categories').get();
            document.getElementById('totalCategories').textContent = categoriesSnapshot.size;
        } catch (error) {
            console.warn('Could not load categories count:', error);
            document.getElementById('totalCategories').textContent = 'N/A';
        }
        
        // Simulate active users (in a real app, you'd track this in your database)
        document.getElementById('activeUsers').textContent = Math.floor(Math.random() * 50) + 1;
        
        // Load recent activity
        loadRecentActivity();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const activityRef = db.collection('activity').orderBy('timestamp', 'desc').limit(10);
        const snapshot = await activityRef.get();
        
        const activityBody = document.getElementById('recentActivityBody');
        if (!activityBody) return;
        
        activityBody.innerHTML = ''; // Clear existing content
        
        if (snapshot.empty) {
            activityBody.innerHTML = '<tr><td colspan="4" class="text-center">No recent activity</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const activity = doc.data();
            const row = document.createElement('tr');
            
            // Format timestamp
            const timestamp = activity.timestamp?.toDate ? 
                activity.timestamp.toDate().toLocaleString() : 
                'Just now';
                
            row.innerHTML = `
                <td>${activity.action || 'Unknown'}</td>
                <td>${activity.details || ''}</td>
                <td>${activity.userEmail || 'System'}</td>
                <td>${timestamp}</td>
            `;
            
            activityBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
        const activityBody = document.getElementById('recentActivityBody');
        if (activityBody) {
            activityBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading activity</td></tr>';
        }
    }
}

// Log activity
async function logActivity(action, details = '') {
    if (!auth?.currentUser?.email || !db) return;
    
    try {
        await db.collection('activity').add({
            action,
            details,
            userEmail: auth.currentUser.email,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Add Video Button
    const addVideoBtn = document.getElementById('addVideoBtn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => {
            console.log('Add video button clicked');
            // Reset form
            const videoForm = document.getElementById('videoForm');
            if (videoForm) videoForm.reset();
            
            // Set default values
            const videoIdInput = document.getElementById('videoId');
            if (videoIdInput) videoIdInput.value = '';
            
            // Show modal using safe function
            showModal('videoFormModal');
        });
    }
    
    // Quick Action Buttons
    const quickActionBtns = {
        'importVideosBtn': () => showModal('importPlaylistModal'),
        'manageCategoriesBtn': () => navigateToSection('categories'),
        'viewReportsBtn': () => navigateToSection('reports')
    };
    
    Object.entries(quickActionBtns).forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    });
    
    // Generate AI Description Button
    const generateDescBtn = document.getElementById('generateDescriptionBtn');
    if (generateDescBtn) {
        generateDescBtn.addEventListener('click', generateAIDescription);
    }
    
    // Save Video Form
    const videoForm = document.getElementById('videoForm');
    if (videoForm) {
        videoForm.addEventListener('submit', handleVideoSubmit);
    }
    
    // Add event delegation for dynamic elements
    document.addEventListener('click', (e) => {
        // Handle edit video
        if (e.target.closest('.edit-video')) {
            const button = e.target.closest('.edit-video');
            const videoId = button.dataset.id;
            console.log('Edit video:', videoId);
            editVideo(videoId);
        }
        
        // Handle delete video
        if (e.target.closest('.delete-video')) {
            const button = e.target.closest('.delete-video');
            const videoId = button.dataset.id;
            const videoTitle = button.closest('tr').querySelector('td:nth-child(2)').textContent;
            console.log('Delete video:', videoId, videoTitle);
            confirmDeleteVideo(videoId, videoTitle);
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchVideos');
    if (searchInput) {
        searchInput.addEventListener('input', filterVideos);
    }
    
    // Filter by subject
    const filterSubject = document.getElementById('filterSubject');
    if (filterSubject) {
        filterSubject.addEventListener('change', filterVideos);
    }
}

// Load videos from Firestore
async function loadVideos() {
    console.log('Loading videos...');
    
    if (!db) {
        console.error('Database not initialized');
        showNotification('Database connection error', 'error');
        return;
    }
    
    try {
        // Show loading state
        const videosList = document.getElementById('videosList');
        if (videosList) {
            videosList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 mb-0">Loading videos...</p>
                    </td>
                </tr>`;
        }
        
        // Unsubscribe from previous listener if exists
        if (unsubscribeVideos) {
            console.log('Unsubscribing from previous listener');
            unsubscribeVideos();
        }
        
        // Get reference to videos collection
        const videosRef = db.collection('videos');
        
        // Set up real-time listener
        unsubscribeVideos = videosRef
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                (snapshot) => {
                    console.log('Received snapshot with', snapshot.size, 'videos');
                    videos = [];
                    snapshot.forEach((doc) => {
                        videos.push({ id: doc.id, ...doc.data() });
                    });
                    
                    console.log('Videos loaded:', videos.length);
                    renderVideos();
                    
                    // Hide loading spinner
                    const loadingSpinner = document.getElementById('loadingSpinner');
                    if (loadingSpinner) {
                        loadingSpinner.style.display = 'none';
                    }
                },
                (error) => {
                    console.error('Error loading videos:', error);
                    showNotification('Error loading videos: ' + (error.message || 'Unknown error'), 'error');
                    
                    // Show empty state
                    const videosList = document.getElementById('videosList');
                    if (videosList) {
                        videosList.innerHTML = `
                            <tr>
                                <td colspan="5" class="text-center py-4">
                                    <i class="fas fa-exclamation-circle text-danger mb-2" style="font-size: 2rem;"></i>
                                    <p class="mb-0">Failed to load videos. Please try again.</p>
                                </td>
                            </tr>`;
                    }
                    
                    // Hide loading spinner
                    const loadingSpinner = document.getElementById('loadingSpinner');
                    if (loadingSpinner) {
                        loadingSpinner.style.display = 'none';
                    }
                }
            );
            
    } catch (error) {
        console.error('Error in loadVideos:', error);
        showNotification('Error: ' + (error.message || 'Failed to load videos'), 'error');
        
        // Hide loading spinner
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
}

// Filter videos based on search and subject
function filterVideos() {
    const searchTerm = document.getElementById('searchVideos')?.value.toLowerCase() || '';
    const subjectFilter = document.getElementById('filterSubject')?.value || '';
    
    const filteredVideos = videos.filter(video => {
        const matchesSearch = !searchTerm || 
            (video.title && video.title.toLowerCase().includes(searchTerm)) ||
            (video.description && video.description.toLowerCase().includes(searchTerm));
            
        const matchesSubject = !subjectFilter || video.subject === subjectFilter;
        
        return matchesSearch && matchesSubject;
    });
    
    renderFilteredVideos(filteredVideos);
}

// Render filtered videos
function renderFilteredVideos(filteredVideos) {
    const videosList = document.getElementById('videosList');
    if (!videosList) return;
    
    if (filteredVideos.length === 0) {
        videosList.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <i class="fas fa-search text-muted mb-2" style="font-size: 2rem;"></i>
                    <p class="mb-0">No videos found matching your criteria</p>
                </td>
            </tr>`;
        return;
    }
    
    // Use the same rendering logic as renderVideos but with filtered list
    videosList.innerHTML = '';
    filteredVideos.forEach(video => {
        const videoRow = document.createElement('tr');
        const videoId = video.videoUrl ? extractVideoId(video.videoUrl) : '';
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 'https://via.placeholder.com/120x68?text=No+Thumbnail';
        
        videoRow.innerHTML = `
            <td class="align-middle">
                <div class="video-thumbnail" style="width: 120px;">
                    <img src="${thumbnailUrl}" alt="${video.title || 'Video Thumbnail'}" 
                         class="img-thumbnail p-0 border-0" style="width: 100%; height: auto;">
                </div>
            </td>
            <td class="align-middle">
                <div class="fw-bold">${video.title || 'Untitled'}</div>
                ${video.description ? `<div class="text-muted small">${video.description.substring(0, 60)}${video.description.length > 60 ? '...' : ''}</div>` : ''}
            </td>
            <td class="align-middle">
                <span class="badge bg-primary">${video.subject || 'N/A'}</span>
            </td>
            <td class="align-middle">
                <div class="small">${formatDate(video.createdAt?.toDate?.()) || 'N/A'}</div>
                <div class="badge ${video.status === 'published' ? 'bg-success' : 'bg-warning text-dark'}">
                    ${video.status || 'draft'}
                </div>
            </td>
            <td class="text-end align-middle">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary edit-video" data-id="${video.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger delete-video" data-id="${video.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        videosList.appendChild(videoRow);
    });
}

// Edit video function
async function editVideo(videoId) {
    try {
        console.log('Editing video:', videoId);
        const video = videos.find(v => v.id === videoId);
        if (!video) {
            throw new Error('Video not found');
        }
        
        // Populate form
        const videoForm = document.getElementById('videoForm');
        if (videoForm) {
            const videoIdInput = document.getElementById('videoId');
            if (videoIdInput) videoIdInput.value = video.id;
            
            const titleInput = document.getElementById('videoTitle');
            if (titleInput) titleInput.value = video.title || '';
            
            const descriptionInput = document.getElementById('videoDescription');
            if (descriptionInput) descriptionInput.value = video.description || '';
            
            const subjectSelect = document.getElementById('videoSubject');
            if (subjectSelect) subjectSelect.value = video.subject || '';
            
            const urlInput = document.getElementById('videoUrl');
            if (urlInput) urlInput.value = video.videoUrl || '';
            
            const statusSelect = document.getElementById('videoStatus');
            if (statusSelect) statusSelect.value = video.status || 'draft';
            
            // Update modal title
            const modalTitle = document.getElementById('videoModalLabel');
            if (modalTitle) modalTitle.textContent = 'Edit Video';
            
            // Show modal
            const videoModal = new bootstrap.Modal(document.getElementById('videoFormModal'));
            videoModal.show();
        }
    } catch (error) {
        console.error('Error editing video:', error);
        showNotification('Error: ' + (error.message || 'Failed to edit video'), 'error');
    }
}

// Confirm delete video
function confirmDeleteVideo(videoId, videoTitle) {
    if (!confirm(`Are you sure you want to delete "${videoTitle}"? This action cannot be undone.`)) {
        return;
    }
    
    deleteVideo(videoId);
}

// Delete video from Firestore
async function deleteVideo(videoId) {
    if (!db) {
        console.error('Database not initialized');
        showNotification('Database connection error', 'error');
        return;
    }
    
    try {
        await db.collection('videos').doc(videoId).delete();
        showNotification('Video deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting video:', error);
        showNotification('Error: ' + (error.message || 'Failed to delete video'), 'error');
    }
}

// Generate AI description based on video title
async function generateAIDescription() {
    const titleInput = document.getElementById('videoTitle');
    const descriptionInput = document.getElementById('videoDescription');
    const generateBtn = document.getElementById('generateDescriptionBtn');
    
    if (!titleInput || !descriptionInput || !generateBtn) return;
    
    const title = titleInput.value.trim();
    if (!title) {
        showNotification('Please enter a video title first', 'warning');
        return;
    }
    
    // Save original button content
    const originalContent = generateBtn.innerHTML;
    
    try {
        // Show loading state
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
        
        // In a real implementation, you would call an AI API here
        // For now, we'll simulate it with a timeout and a simple template
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple template for now - replace with actual AI call
        const description = `In this video, we'll be discussing "${title}". 

Key points covered in this video:
• Introduction to ${title}
• Main concepts and principles
• Practical examples and applications
• Summary and key takeaways

Don't forget to like and subscribe for more educational content!`;
        
        // Set the generated description
        descriptionInput.value = description;
        
    } catch (error) {
        console.error('Error generating description:', error);
        showNotification('Failed to generate description. Please try again.', 'error');
    } finally {
        // Restore button state
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalContent;
    }
}

// Handle video form submission
async function handleVideoSubmit(e) {
    e.preventDefault();
    
    if (!db) {
        console.error('Database not initialized');
        showNotification('Database connection error', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('saveVideoBtn');
    if (!saveBtn) return;
    
    // Set loading state
    const spinner = saveBtn.querySelector('.spinner-border');
    const btnText = saveBtn.querySelector('.btn-text');
    
    if (spinner) spinner.classList.remove('d-none');
    if (btnText) btnText.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
        const formData = new FormData(e.target);
        const existingVideoId = formData.get('id');
        
        // Basic validation
        const title = formData.get('title')?.trim();
        const videoUrl = formData.get('videoUrl')?.trim();
        const subject = formData.get('subject')?.trim();
        
        if (!title) {
            throw new Error('Please enter a video title');
        }
        
        if (!videoUrl) {
            throw new Error('Please enter a video URL');
        }
        
        if (!subject) {
            throw new Error('Please select a subject');
        }
        
        // Extract video ID from YouTube URL if necessary
        let videoIdFromUrl = '';
        try {
            const url = new URL(videoUrl);
            if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
                videoIdFromUrl = url.searchParams.get('v') || url.pathname.split('/').pop();
            }
        } catch (e) {
            console.warn('Error parsing video URL:', e);
        }
        
        // Prepare video data
        const videoData = {
            title,
            description: formData.get('description')?.trim() || '',
            subject,
            teacher: formData.get('teacher') || 'other',
            videoUrl,
            videoId: videoIdFromUrl,
            status: formData.get('status') || 'draft',
            thumbnailUrl: formData.get('thumbnailUrl')?.trim() || '',
            tags: formData.get('tags')?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
            updatedAt: new Date()
        };
        
        // Set created time for new videos
        if (!existingVideoId) {
            videoData.createdAt = new Date();
        }
        
        if (!videoData.videoUrl.trim()) {
            throw new Error('Video URL is required');
        }
        
        // If no thumbnail URL provided but we have a video ID, use YouTube's thumbnail
        if (!videoData.thumbnailUrl && videoData.videoId) {
            videoData.thumbnailUrl = `https://img.youtube.com/vi/${videoData.videoId}/hqdefault.jpg`;
        }
        
        // Save to Firestore
        try {
            if (existingVideoId) {
                // Update existing video
                await db.collection('videos').doc(existingVideoId).update(videoData);
                showNotification('Video updated successfully', 'success');
            } else {
                // Add new video
                await db.collection('videos').add(videoData);
                showNotification('Video added successfully', 'success');
            }
            
            // Hide modal
            const modalElement = document.getElementById('videoFormModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // Fallback if Bootstrap modal is not available
                    modalElement.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                }
            }
            
            // Reset the form
            const form = document.getElementById('videoForm');
            if (form) form.reset();
            
        } catch (error) {
            console.error('Firestore error:', error);
            throw new Error('Failed to save video to database');
        }
        
    } catch (error) {
        console.error('Error saving video:', error);
        showNotification('Error: ' + (error.message || 'Failed to save video'), 'error');
    } finally {
        // Reset button state
        if (spinner) spinner.classList.add('d-none');
        if (btnText) btnText.textContent = 'Save Video';
        saveBtn.disabled = false;
    }
}

// Make sure to export all necessary functions
export { 
    initializeUI, 
    setupEventListeners, 
    loadVideos, 
    filterVideos, 
    renderFilteredVideos, 
    editVideo, 
    confirmDeleteVideo, 
    deleteVideo,
    generateAIDescription,
    handleVideoSubmit,
    navigateToSection,
    loadDashboardData,
    logActivity
};
