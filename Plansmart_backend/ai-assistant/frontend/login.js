// Login page functionality
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const toggleBtn = document.getElementById('toggle-btn');
const toggleMode = document.getElementById('toggle-mode');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

let isLoginMode = true;

// Toggle between login and signup
toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        toggleMode.innerHTML = "Don't have an account? <button type=\"button\" id=\"toggle-btn\">Sign Up</button>";
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        toggleMode.innerHTML = "Already have an account? <button type=\"button\" id=\"toggle-btn\">Login</button>";
    }
    
    // Reattach event listener to new toggle button
    document.getElementById('toggle-btn').addEventListener('click', arguments.callee);
    
    // Clear messages
    hideMessages();
});

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

// Hide messages
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Show loading spinner
function showLoading(button) {
    const spinner = button.querySelector('.loading-spinner');
    const text = button.querySelector('span');
    spinner.style.display = 'inline-block';
    text.textContent = 'Loading...';
    button.disabled = true;
}

// Hide loading spinner
function hideLoading(button, originalText) {
    const spinner = button.querySelector('.loading-spinner');
    const text = button.querySelector('span');
    spinner.style.display = 'none';
    text.textContent = originalText;
    button.disabled = false;
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const button = document.getElementById('login-btn');
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    showLoading(button);
    
    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError(data.message || 'Login failed. Please try again.');
            hideLoading(button, 'Login');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please check if the server is running.');
        hideLoading(button, 'Login');
    }
});

// Signup handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();
    
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const button = document.getElementById('signup-btn');
    
    if (!username || !password || !confirm) {
        showError('Please fill in all fields');
        return;
    }
    
    if (username.length < 3) {
        showError('Username must be at least 3 characters long');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirm) {
        showError('Passwords do not match');
        return;
    }
    
    showLoading(button);
    
    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Account created successfully! Logging in...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError(data.message || 'Signup failed. Please try again.');
            hideLoading(button, 'Create Account');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('Connection error. Please check if the server is running.');
        hideLoading(button, 'Create Account');
    }
});

