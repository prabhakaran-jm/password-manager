// Form handling
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showNotification('Registration successful, please login');
            document.getElementById('login-tab').click();
            document.getElementById('register-form').reset();
        } else {
            showNotification(data.error, 'danger');
        }
    } catch (error) {
        showNotification('Registration failed', 'danger');
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            handleLoginSuccess(data.token);
        } else {
            showNotification(data.error, 'danger');
        }
    } catch (error) {
        showNotification('Login failed', 'danger');
    }
});

document.getElementById('add-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const website = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/passwords', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ website, username, password })
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('add-password-form').reset();
            loadPasswords();
            showNotification('Password saved successfully');
        } else {
            showNotification(data.error, 'danger');
        }
    } catch (error) {
        showNotification('Failed to save password', 'danger');
    }
});

// Password management functions
async function loadPasswords() {
    try {
        const response = await fetch('/passwords', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            displayPasswords(data.passwords);
        } else {
            showNotification(data.error, 'danger');
        }
    } catch (error) {
        showNotification('Failed to load passwords', 'danger');
    }
}

function displayPasswords(passwords) {
    const passwordsList = document.getElementById('passwords-list');
    passwordsList.innerHTML = '';
    
    if (passwords.length === 0) {
        passwordsList.innerHTML = '<div class="text-center p-3">No passwords saved yet</div>';
        return;
    }
    
    passwords.forEach(p => {
        const entry = document.createElement('div');
        entry.className = 'list-group-item password-entry';
        entry.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${p.website}</h5>
                    <div>Username: <span class="username-field">${p.username}</span></div>
                    <div>Password: <span class="password-field" id="password-${p.id}">${p.password}</span></div>
                </div>
                <div class="password-actions">
                    <i class="fa fa-eye reveal-button" onclick="revealPassword(${p.id})" title="Toggle Password"></i>
                    <i class="fa fa-copy copy-button" onclick="copyUsername(${p.id})" title="Copy Username"></i>
                    <i class="fa fa-copy copy-button" onclick="copyPassword(${p.id})" title="Copy Password"></i>
                    <i class="fa fa-trash delete-button" onclick="showDeleteConfirmation(${p.id})" title="Delete Password"></i>
                </div>
            </div>
        `;
        passwordsList.appendChild(entry);
    });
}

async function revealPassword(id) {
    const passwordField = document.getElementById(`password-${id}`);
    const eyeIcon = event.target;

    // If password is already revealed (not showing dots), hide it
    if (passwordField.textContent !== '••••••••') {
        passwordField.textContent = '••••••••';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
        return;
    }

    try {
        const response = await fetch(`/passwords/${id}/reveal`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            passwordField.textContent = data.password;
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
            
            // Optional: Hide password after 30 seconds
            setTimeout(() => {
                if (passwordField.textContent !== '••••••••') {
                    passwordField.textContent = '••••••••';
                    eyeIcon.classList.remove('fa-eye-slash');
                    eyeIcon.classList.add('fa-eye');
                }
            }, 30000);
        } else {
            showNotification(data.error, 'danger');
        }
    } catch (error) {
        showNotification('Failed to reveal password', 'danger');
    }
}

async function copyUsername(id) {
    const entry = document.getElementById(`password-${id}`).closest('.password-entry');
    const username = entry.querySelector('.username-field').textContent;
    await navigator.clipboard.writeText(username);
    showNotification('Username copied to clipboard');
}

async function copyPassword(id) {
    try {
        const response = await fetch(`/passwords/${id}/reveal`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            await navigator.clipboard.writeText(data.password);
            showNotification('Password copied to clipboard');
        } else {
            showNotification(data.error, 'danger');
        }
    } catch (error) {
        showNotification('Failed to copy password', 'danger');
    }
}

// Delete functionality
let deletePasswordId = null;
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

document.getElementById('confirmDelete').addEventListener('click', async () => {
    if (deletePasswordId) {
        try {
            const response = await fetch(`/passwords/${deletePasswordId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                deleteModal.hide();
                loadPasswords();
                showNotification('Password deleted successfully');
            } else {
                showNotification('Failed to delete password', 'danger');
            }
        } catch (error) {
            showNotification('Failed to delete password', 'danger');
        }
    }
    deletePasswordId = null;
});

function showDeleteConfirmation(id) {
    deletePasswordId = id;
    deleteModal.show();
}

// UI helpers
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '1050';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

async function handleLoginSuccess(token) {
    localStorage.setItem('token', token);
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('password-section').style.display = 'block';
    document.getElementById('login-form').reset();
    await loadPasswords();
    showNotification('Logged in successfully');
}

function logout() {
    localStorage.removeItem('token');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('password-section').style.display = 'none';
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    document.getElementById('add-password-form').reset(); // Clear Add New Password form
    showNotification('Logged out successfully');
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const entries = document.querySelectorAll('.password-entry');
    
    entries.forEach(entry => {
        const website = entry.querySelector('h5').textContent.toLowerCase();
        const username = entry.querySelector('.username-field').textContent.toLowerCase();
        
        if (website.includes(searchTerm) || username.includes(searchTerm)) {
            entry.style.display = '';
        } else {
            entry.style.display = 'none';
        }
    });
});

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        handleLoginSuccess(token);
    }
});
