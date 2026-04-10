// Simple hash function for demo
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

function registerUser(userData) {
    // Get existing users or initialize
    let registeredUsers = JSON.parse(localStorage.getItem('iaps_registered_users') || '{}');
    
    // Check if username already exists
    if (registeredUsers[userData.username]) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Add new user
    registeredUsers[userData.username] = {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: simpleHash(userData.password),
        role: userData.role,
        status: 'pending', // Admin approval required
        registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem('iaps_registered_users', JSON.stringify(registeredUsers));
    return { success: true, message: 'Registration successful! Awaiting admin approval.' };
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        role: document.getElementById('requestedRole').value
    };
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.username || !formData.password || !formData.role) {
        showError('Please fill in all fields');
        return;
    }
    
    if (formData.password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    const result = registerUser(formData);
    
    if (result.success) {
        showSuccess(result.message);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        showError(result.message);
    }
});