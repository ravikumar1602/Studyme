// Utility function for showing notifications
export function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create notification element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.role = 'alert';
    alertDiv.style.zIndex = '9999';
    
    // Add appropriate icon based on message type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'danger') icon = 'exclamation-triangle';
    if (type === 'warning') icon = 'exclamation-circle';
    
    alertDiv.innerHTML = `
        <i class="fas fa-${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to the document
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}
