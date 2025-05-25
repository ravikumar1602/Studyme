// Teacher Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const videosList = document.getElementById('videosList');
    const videoForm = document.getElementById('videoForm');
    const videoModal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalTitle');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeBtn = document.querySelector('.close');
    const searchInput = document.getElementById('searchInput');
    const subjectFilter = document.getElementById('subjectFilter');
    
    // Teacher info elements
    const teacherName = document.getElementById('teacherName');
    const teacherSubject = document.getElementById('teacherSubject');
    const teacherAvatar = document.getElementById('teacherAvatar');
    
    // Form elements
    const videoIdInput = document.getElementById('videoId');
    const videoTitleInput = document.getElementById('videoTitle');
    const videoUrlInput = document.getElementById('videoUrl');
    const videoSubjectInput = document.getElementById('videoSubject');
    const videoDescriptionInput = document.getElementById('videoDescription');
    
    // State
    let videos = [];
    let subjects = [];
    let currentTeacher = null;
    
    // Initialize the teacher panel
    async function init() {
        // Get teacher ID from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        let teacherId = urlParams.get('teacher');
        
        // If no teacher ID in URL, check localStorage
        if (!teacherId) {
            teacherId = localStorage.getItem('teacherId');
            if (!teacherId) {
                // Redirect to login or show error
                showNotification('No teacher specified', 'error');
                return;
            }
        } else {
            // Save teacher ID to localStorage for future visits
            localStorage.setItem('teacherId', teacherId);
        }
        
        // Load teacher data
        await loadTeacher(teacherId);
        
        // Load subjects
        await loadSubjects();
        
        // Load videos
        await loadVideos();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Add video button
        addVideoBtn.addEventListener('click', () => showVideoForm());
        
        // Close modal buttons
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeModal();
            }
        });
        
        // Form submission
        videoForm.addEventListener('submit', handleFormSubmit);
        
        // Search and filter
        searchInput.addEventListener('input', filterVideos);
        subjectFilter.addEventListener('change', filterVideos);
        
        // Extract video info when URL changes
        videoUrlInput.addEventListener('blur', extractVideoInfo);
    }
    
    // Load teacher data
    async function loadTeacher(teacherId) {
        try {
            // In a real app, you would fetch this from your API
            // For now, we'll use a simple object
            const teacher = {
                id: teacherId,
                name: teacherId === 'khan' ? 'Khan Sir' : 
                      teacherId === 'sarah' ? 'Sarah Johnson' :
                      teacherId === 'david' ? 'David Miller' :
                      teacherId === 'priya' ? 'Priya Sharma' : 'Alex Chen',
                subject: teacherId === 'khan' ? 'History, GK' : 
                        teacherId === 'sarah' ? 'Mathematics, Reasoning' :
                        teacherId === 'david' ? 'Geography' :
                        teacherId === 'priya' ? 'Science' : 'English',
                avatar: `https://i.pravatar.cc/150?u=${teacherId}@example.com`
            };
            
            currentTeacher = teacher;
            
            // Update UI
            teacherName.textContent = teacher.name;
            teacherSubject.textContent = teacher.subject;
            teacherAvatar.src = teacher.avatar;
            teacherAvatar.alt = teacher.name;
            
            // Update page title
            document.title = `${teacher.name} - Teacher Panel`;
            
        } catch (error) {
            console.error('Error loading teacher:', error);
            showNotification('Failed to load teacher information', 'error');
        }
    }
    
    // Load subjects
    async function loadSubjects() {
        try {
            const response = await fetch('/api/subjects.php');
            if (!response.ok) throw new Error('Failed to load subjects');
            
            subjects = await response.json();
            
            // Populate subject filter
            subjectFilter.innerHTML = '<option value="">All Subjects</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                subjectFilter.appendChild(option);
            });
            
            // Populate subject dropdown in form
            videoSubjectInput.innerHTML = '<option value="">Select Subject</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                videoSubjectInput.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading subjects:', error);
            showNotification('Failed to load subjects', 'error');
        }
    }
    
    // Load videos
    async function loadVideos() {
        try {
            videosList.innerHTML = '<div class="loading">Loading videos...</div>';
            
            // Fetch videos for the current teacher
            const response = await fetch(`/api/videos.php?teacher=${currentTeacher.id}`);
            if (!response.ok) throw new Error('Failed to load videos');
            
            videos = await response.json();
            
            if (videos.length === 0) {
                videosList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-video-slash"></i>
                        <h3>No Videos Yet</h3>
                        <p>You haven't added any videos yet. Click the button below to add your first video.</p>
                        <button class="btn btn-primary" id="addFirstVideo">
                            <i class="fas fa-plus"></i> Add Your First Video
                        </button>
                    </div>
                `;
                
                document.getElementById('addFirstVideo')?.addEventListener('click', () => showVideoForm());
            } else {
                renderVideos(videos);
            }
            
        } catch (error) {
            console.error('Error loading videos:', error);
            videosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Videos</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-sync"></i> Try Again
                    </button>
                </div>
            `;
        }
    }
    
    // Render videos
    function renderVideos(videosToRender) {
        if (!videosToRender || videosToRender.length === 0) {
            videosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Videos Found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }
        
        videosList.innerHTML = videosToRender.map(video => `
            <div class="video-card" data-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail || 'https://via.placeholder.com/300x169?text=No+Thumbnail'}" alt="${video.title}">
                    <div class="play-icon">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${video.description || 'No description available'}</p>
                    <div class="video-meta">
                        <span class="video-subject">${getSubjectName(video.subject)}</span>
                        <span class="video-date">${formatDate(video.created_at)}</span>
                    </div>
                    <div class="video-actions">
                        <button class="btn btn-outline btn-edit" data-id="${video.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline btn-delete" data-id="${video.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to action buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = btn.dataset.id;
                editVideo(videoId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = btn.dataset.id;
                deleteVideo(videoId);
            });
        });
        
        // Add click event to video cards
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.video-actions')) {
                    const videoId = card.dataset.id;
                    const video = videos.find(v => v.id === videoId);
                    if (video) {
                        window.open(video.url, '_blank');
                    }
                }
            });
        });
    }
    
    // Filter videos based on search and subject
    function filterVideos() {
        const searchTerm = searchInput.value.toLowerCase();
        const subjectId = subjectFilter.value;
        
        let filteredVideos = [...videos];
        
        // Filter by subject
        if (subjectId) {
            filteredVideos = filteredVideos.filter(video => video.subject === subjectId);
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredVideos = filteredVideos.filter(video => 
                video.title.toLowerCase().includes(searchTerm) || 
                (video.description && video.description.toLowerCase().includes(searchTerm))
            );
        }
        
        renderVideos(filteredVideos);
    }
    
    // Show video form (for adding/editing)
    function showVideoForm(video = null) {
        if (video) {
            // Edit mode
            modalTitle.textContent = 'Edit Video';
            videoIdInput.value = video.id;
            videoTitleInput.value = video.title;
            videoUrlInput.value = video.url;
            videoSubjectInput.value = video.subject;
            videoDescriptionInput.value = video.description || '';
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Video';
            videoForm.reset();
            videoIdInput.value = '';
        }
        
        videoModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeModal() {
        videoModal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Reset form after animation
        setTimeout(() => {
            videoForm.reset();
        }, 300);
    }
    
    // Handle form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: videoTitleInput.value.trim(),
            url: videoUrlInput.value.trim(),
            subject: videoSubjectInput.value,
            description: videoDescriptionInput.value.trim(),
            teacher: currentTeacher.id
        };
        
        // Validate required fields
        if (!formData.title || !formData.url || !formData.subject) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate URL
        try {
            new URL(formData.url);
        } catch (e) {
            showNotification('Please enter a valid URL', 'error');
            return;
        }
        
        try {
            const videoId = videoIdInput.value;
            let response;
            
            if (videoId) {
                // Update existing video
                response = await fetch(`/api/videos.php/${videoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Create new video
                response = await fetch('/api/videos.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save video');
            }
            
            const result = await response.json();
            
            // Close modal and refresh videos
            closeModal();
            loadVideos();
            
            showNotification(
                videoId ? 'Video updated successfully' : 'Video added successfully',
                'success'
            );
            
        } catch (error) {
            console.error('Error saving video:', error);
            showNotification(error.message || 'Failed to save video', 'error');
        }
    }
    
    // Extract video info from URL
    async function extractVideoInfo() {
        const url = videoUrlInput.value.trim();
        if (!url) return;
        
        try {
            // Try to extract YouTube video ID
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
            const match = url.match(youtubeRegex);
            
            if (match && match[1]) {
                const videoId = match[1];
                
                // If we have a YouTube URL, we can try to get the video title
                // For now, we'll just show a loading state
                videoTitleInput.placeholder = 'Loading video info...';
                
                try {
                    // In a real app, you would use the YouTube API here
                    // For now, we'll just extract the title from the URL
                    videoTitleInput.value = 'YouTube Video';
                    
                    // Set a default thumbnail
                    if (!document.querySelector('#thumbnailPreview')) {
                        const thumbnailPreview = document.createElement('div');
                        thumbnailPreview.id = 'thumbnailPreview';
                        thumbnailPreview.style.marginTop = '10px';
                        thumbnailPreview.innerHTML = `
                            <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" 
                                 alt="Video Thumbnail" 
                                 style="max-width: 100%; border-radius: 4px;">
                        `;
                        videoUrlInput.insertAdjacentElement('afterend', thumbnailPreview);
                    } else {
                        const img = document.querySelector('#thumbnailPreview img');
                        if (img) img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }
                    
                } catch (e) {
                    console.error('Error fetching video info:', e);
                    videoTitleInput.placeholder = 'Enter video title';
                }
            } else {
                // Not a YouTube URL, just clear the preview
                const preview = document.querySelector('#thumbnailPreview');
                if (preview) preview.remove();
            }
        } catch (error) {
            console.error('Error extracting video info:', error);
        }
    }
    
    // Edit video
    async function editVideo(videoId) {
        try {
            const response = await fetch(`/api/videos.php/${videoId}`);
            if (!response.ok) throw new Error('Failed to load video');
            
            const video = await response.json();
            showVideoForm(video);
            
        } catch (error) {
            console.error('Error loading video:', error);
            showNotification('Failed to load video', 'error');
        }
    }
    
    // Delete video
    async function deleteVideo(videoId) {
        if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/videos.php/${videoId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete video');
            
            // Remove from local array and re-render
            videos = videos.filter(v => v.id !== videoId);
            renderVideos(videos);
            
            showNotification('Video deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting video:', error);
            showNotification('Failed to delete video', 'error');
        }
    }
    
    // Helper function to get subject name by ID
    function getSubjectName(subjectId) {
        const subject = subjects.find(s => s.id === subjectId);
        return subject ? subject.name : subjectId;
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Trigger reflow
        notification.offsetHeight;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Initialize the teacher panel
    init();
});
