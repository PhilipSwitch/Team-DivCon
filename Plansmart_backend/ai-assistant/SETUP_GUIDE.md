# PLANSMART Login System - Complete Setup Guide

## 🎯 Overview
Your Plansmart application now includes a complete authentication system with:
- **User Registration** - Create new accounts
- **User Login** - Authenticate with credentials
- **Guest Mode** - Continue without account
- **Session Management** - Secure session handling
- **Logout** - End session

---

## 📦 Prerequisites

### System Requirements
- Python 3.8+
- Flask 2.3.3
- SQLAlchemy
- Node.js or any static server (for frontend)

### Python Dependencies
All required packages are in `requirements.txt`:
```
Flask==2.3.3
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.0.5
APScheduler==3.10.4
openai==1.3.0
python-dotenv==1.0.0
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend"
pip install -r requirements.txt
```

### 2. Create .env File
Copy the example file and add your configuration:
```powershell
# Copy template
Copy-Item ".env.example" ".env"
```

Edit `.env` and add:
```ini
OPENAI_API_KEY=your_openai_api_key_here  # Optional
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
```

### 3. Initialize Database
```powershell
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend"
python app.py
```
The Flask app will automatically create the SQLite database on first run.

### 4. Start the Backend Server
```powershell
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend"
python app.py
```

You should see:
```
==================================================
PLANSMART AI ASSISTANT
Mode: 📝 Rule-Based
==================================================

 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### 5. Open Frontend
Open your browser and navigate to:
```
file:///c:/Users/bensa/Documents/Team-DivCon/Plansmart_backend/ai-assistant/frontend/login.html
```

Or use a local server:
```powershell
# Using Python's built-in server
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\frontend"
python -m http.server 8000
```
Then visit: `http://localhost:8000/login.html`

---

## 🔑 Authentication Flow

### User Registration
1. Click **"Sign Up"** on the login page
2. Enter username (3+ characters)
3. Create password (6+ characters)
4. Confirm password
5. Click **"Create Account"**
6. Automatically logged in and redirected to dashboard

### User Login
1. Enter username
2. Enter password
3. Click **"Login"**
4. Redirected to dashboard
5. Button shows **"[username] (Logout)"**

### Guest Mode
1. Click **"Continue as Guest"**
2. Immediate access to dashboard
3. Button shows **"Guest (Logout)"**
4. Data is still saved but linked to guest user_id

### Logout
1. Click the **logout button** in the sidebar (shows your username or "Guest")
2. Redirected to login page
3. Session cleared

---

## 🗂️ File Structure

### Frontend Files
```
frontend/
├── login.html          # Login/Signup page with beautiful UI
├── login.js            # Authentication logic
├── index.html          # Dashboard (protected)
├── script.js           # Dashboard logic (updated with auth)
└── styles.css          # Shared styling
```

### Backend Files
```
backend/
├── app.py              # Flask app with login endpoints
├── models.py           # Database models (User, Task, Schedule)
├── conversation_engine.py  # AI conversation logic
├── scheduler.py        # Task scheduling
├── requirements.txt    # Python dependencies
├── .env.example        # Environment configuration template
└── .env                # Environment variables (don't commit!)
```

---

## 🔐 Security Features

### Session Management
- **HttpOnly Cookies** - Prevents JavaScript access to session tokens
- **SameSite Protection** - Prevents CSRF attacks
- **Secure Flag** - HTTPS-only in production

### Password Security
- **Hashed Passwords** - Using Werkzeug's `generate_password_hash`
- **Salted Hashing** - Default bcrypt algorithm
- **No Plain Text** - Passwords never stored or logged

### Input Validation
```javascript
// Frontend validation
- Username: 3+ characters
- Password: 6+ characters
- Password confirmation must match
- All fields required

// Backend validation
- Same checks on server side
- Username uniqueness check
- Input sanitization
- Error messages are generic (security)
```

### CORS Configuration
- Only localhost allowed
- Credentials enabled
- Limited HTTP methods

---

## 🧪 Testing the Login System

### Test Case 1: New User Registration
1. Go to login.html
2. Click "Sign Up"
3. Enter:
   - Username: `testuser123`
   - Password: `password123`
   - Confirm: `password123`
4. Click "Create Account"
5. ✅ Should see "Account created successfully!" and redirect

### Test Case 2: Login with Created Account
1. Go to login.html
2. Enter:
   - Username: `testuser123`
   - Password: `password123`
3. Click "Login"
4. ✅ Should redirect to index.html
5. ✅ Button should show "testuser123 (Logout)"

### Test Case 3: Wrong Password
1. Go to login.html
2. Enter:
   - Username: `testuser123`
   - Password: `wrongpassword`
3. Click "Login"
4. ✅ Should show "Invalid username or password"

### Test Case 4: Guest Mode
1. Go to login.html
2. Click "Continue as Guest"
3. ✅ Should immediately go to dashboard
4. ✅ Button should show "Guest (Logout)"
5. ✅ Can still use all features

### Test Case 5: Duplicate Username
1. Register user `testuser456`
2. Try to register again with same username
3. ✅ Should show "Username already exists"

### Test Case 6: Logout
1. Login as user
2. Click logout button
3. ✅ Should redirect to login.html
4. ✅ Session should be cleared

### Test Case 7: Direct Access Protection
1. Try to access `index.html` without logging in
2. ✅ Should automatically redirect to `login.html`

---

## 📊 Database Schema

### User Table
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Task Table
```sql
CREATE TABLE task (
    id INTEGER PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    due_date DATETIME,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER FOREIGN KEY REFERENCES user(id)
)
```

### Schedule Table
```sql
CREATE TABLE schedule (
    id INTEGER PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    description VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER FOREIGN KEY REFERENCES user(id)
)
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### POST `/signup`
Create a new user account
```json
Request:
{
    "username": "newuser",
    "password": "password123"
}

Response (201):
{
    "message": "Account created successfully",
    "user_id": 1
}

Response (400):
{
    "message": "Username already exists"
}
```

#### POST `/login`
Authenticate user
```json
Request:
{
    "username": "testuser",
    "password": "password123"
}

Response (200):
{
    "message": "Login successful",
    "user_id": 1
}

Response (401):
{
    "message": "Invalid username or password"
}
```

#### POST `/guest`
Create guest session
```json
Response (200):
{
    "message": "Guest session started"
}
```

#### GET `/check_auth`
Check authentication status
```json
Response (200):
{
    "authenticated": true,
    "user_id": 1,
    "username": "testuser",
    "is_guest": false
}

Response (401):
{
    "authenticated": false
}
```

#### POST `/logout`
End user session
```json
Response (200):
{
    "message": "Logged out"
}
```

---

## 🐛 Troubleshooting

### Issue: "Connection error. Please check if the server is running."

**Solution:**
1. Ensure Flask backend is running: `python app.py` in backend folder
2. Check if running on `http://localhost:5000`
3. Check browser console (F12) for CORS errors

### Issue: "Login failed" with no specific error

**Solution:**
1. Check browser console (F12 → Console tab)
2. Check backend console for error messages
3. Verify database file exists: `instance/ai_assistant.db`
4. Clear browser cache and try again

### Issue: Session not persisting

**Solution:**
1. Ensure `credentials: 'include'` is set in fetch calls
2. Check that browser allows cookies
3. Verify CORS configuration in app.py
4. Check browser's cookie settings (F12 → Storage → Cookies)

### Issue: Database errors

**Solution:**
1. Delete old database: `Remove-Item instance/ai_assistant.db`
2. Restart Flask: `python app.py`
3. Database will be recreated automatically

### Issue: Redirect loop between login and dashboard

**Solution:**
1. Clear browser cookies
2. Check `/check_auth` endpoint response in Network tab (F12)
3. Verify session is being set correctly
4. Restart browser and Flask

---

## 📝 Configuration Options

### Environment Variables (.env)

```ini
# OpenAI API (Optional - for LLM-powered responses)
OPENAI_API_KEY=sk-your-key-here

# Flask
FLASK_ENV=development          # or production
FLASK_DEBUG=True              # or False for production
SECRET_KEY=your-secure-key    # Change this!

# Database
DATABASE_URL=sqlite:///ai_assistant.db

# OpenAI Model (Optional)
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a secure random string
- [ ] Set `FLASK_DEBUG=False`
- [ ] Use HTTPS (set `SESSION_COOKIE_SECURE=True`)
- [ ] Use a production database (PostgreSQL recommended)
- [ ] Add rate limiting for login attempts
- [ ] Add email verification for new accounts
- [ ] Add password reset functionality
- [ ] Enable HTTPS CORS origins only
- [ ] Set up proper logging and monitoring
- [ ] Add password strength requirements
- [ ] Implement account lockout after failed attempts

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console (F12)
3. Check backend console output
4. Review error messages carefully
5. Check file paths are correct
6. Verify all dependencies installed

---

## ✅ Next Steps

After successful setup:

1. **Customize** - Modify login page colors/text
2. **Add Features** - Email verification, password reset
3. **Enhance Security** - Rate limiting, CAPTCHA
4. **Scale** - Move to production database
5. **Monitor** - Add logging and analytics
6. **Integrate** - Connect with external services

---

Happy coding! 🎉