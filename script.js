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

// Initialize default users with proper hashes
const users = {
    'admin': { 
        password: simpleHash('admin123'),
        role: 'admin' 
    },
    'operator1': { 
        password: simpleHash('operator123'),
        role: 'operator' 
    },
    'analyst1': { 
        password: simpleHash('analyst123'),
        role: 'analyst' 
    }
};

// Session management
function createSession(username, role) {
    const sessionData = {
        username: username,
        role: role,
        loginTime: new Date().toISOString(),
        sessionId: Math.random().toString(36).substr(2, 9)
    };
    localStorage.setItem('iaps_session', JSON.stringify(sessionData));
    return sessionData;
}

function validateCredentials(username, password, role) {
    const hashedPassword = simpleHash(password);
    
    // Check default users first
    const user = users[username];
    if (user && user.password === hashedPassword && user.role === role) {
        return true;
    }
    
    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('iaps_registered_users') || '{}');
    const registeredUser = registeredUsers[username];
    
    if (registeredUser && registeredUser.status === 'approved' && 
        registeredUser.password === hashedPassword && registeredUser.role === role) {
        return true;
    }
    
    return false;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            if (!username || !password || !role) {
                showError('Please fill in all fields');
                return;
            }
            
            if (validateCredentials(username, password, role)) {
                const session = createSession(username, role);
                alert('Login successful! Redirecting to dashboard...');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Check if user exists but not approved
                const registeredUsers = JSON.parse(localStorage.getItem('iaps_registered_users') || '{}');
                const registeredUser = registeredUsers[username];
                
                if (registeredUser && registeredUser.status === 'pending') {
                    showError('Account pending admin approval');
                } else {
                    showError('Invalid credentials or role mismatch');
                }
            }
        });
    }
});

// Check if already logged in
window.addEventListener('load', function() {
    const session = localStorage.getItem('iaps_session');
    if (session) {
        const sessionData = JSON.parse(session);
        // Check if session is still valid (24 hours)
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            window.location.href = 'dashboard.html';
        } else {
            localStorage.removeItem('iaps_session');
        }
    }
});