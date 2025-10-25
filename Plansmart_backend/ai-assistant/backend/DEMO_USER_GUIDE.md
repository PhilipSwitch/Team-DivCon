# 🎮 Demo User Setup Guide

This guide will help you create a demo user with sample tasks and schedules to test the AI assistant.

---

## 🚀 Quick Setup (2 Minutes)

### Option 1: PowerShell Script (Recommended)

```powershell
# Navigate to backend directory
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend"

# Run the setup script
.\setup_demo.ps1
```

This script will:
- ✅ Install dependencies
- ✅ Create `.env` file
- ✅ Initialize database
- ✅ Seed demo data
- ✅ Display login credentials

### Option 2: Manual Python Script

```powershell
# Navigate to backend directory
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend"

# First, install dependencies
pip install -r requirements.txt

# Copy environment file
Copy-Item ".env.example" ".env"

# Seed the database
python seed_demo_data.py
```

---

## 📊 What Gets Created

The seed script creates:

### 👤 Demo User Account
```
Username: Moyo
Password: Demo@123
```

### 📝 Sample Tasks (8 tasks)
- Complete project report
- Review code pull requests  
- Prepare presentation for team meeting
- Update documentation
- Schedule 1-on-1 with manager
- Fix bug in authentication module
- Send weekly status update (completed)
- Research new AI frameworks

### 📅 Sample Schedules (8 schedules)
- Team Standup (today)
- Code Review Session (today)
- Lunch Break (today)
- Project Planning Meeting (today)
- Client Call (tomorrow)
- Sprint Planning (in 2 days)
- One-on-One with Manager (in 3 days)
- Training Session: Advanced Python (in 4 days)

---

## ▶️ Running the Application

### 1. Start Backend Server

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

 * Running on http://127.0.0.1:5000
```

### 2. Start Frontend Server (New Terminal)

```powershell
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\frontend"
python -m http.server 8000
```

### 3. Open Browser

Navigate to:
```
http://localhost:8000/login.html
```

### 4. Login with Demo Credentials

- **Username:** `Moyo`
- **Password:** `Demo@123`

---

## 💡 Try These AI Commands

Once logged in, click the 🎤 voice button or type in the chat to test:

### Task-Related
- "What tasks do I have?"
- "Show my pending tasks"
- "What's due today?"
- "Create task to buy groceries"
- "List my urgent tasks"

### Schedule-Related
- "What's on my schedule?"
- "Show my calendar"
- "What meetings do I have today?"
- "Schedule a call at 15:00"
- "When is my next meeting?"

### Combined
- "Tell me about my day"
- "What should I work on next?"
- "Summarize my workload"
- "Show tasks and schedules for today"

---

## 🔄 Reset Demo Data

To reset and recreate demo data:

### Option 1: Delete Database and Re-seed

```powershell
# Delete the old database
Remove-Item "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend\instance\ai_assistant.db" -Force

# Re-run the seed script
python seed_demo_data.py
```

### Option 2: Use Setup Script

```powershell
# The setup script will ask if you want to reset
.\setup_demo.ps1
# Select 'n' when asked to keep existing database
```

---

## 🔐 Account Security

The demo password is simple for testing. In production:
- Passwords are hashed using bcrypt
- Passwords are never stored in plain text
- Passwords are never logged
- Each user can only access their own data

---

## 📁 File Structure

```
backend/
├── app.py                    # Flask application
├── models.py                 # Database models
├── seed_demo_data.py         # Demo data seeding script
├── setup_demo.ps1            # Setup PowerShell script
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables
├── .env.example              # Template .env
├── instance/
│   └── ai_assistant.db       # SQLite database
└── ...
```

---

## 🐛 Troubleshooting

### Issue: "Connection error" on login page

**Solution:**
1. Make sure backend is running: `python app.py`
2. Check backend is on `http://127.0.0.1:5000`
3. Open browser console (F12) to see error details

### Issue: Demo user already exists

**Solution:**
The script will detect existing demo user and clear its old data. If you want a completely fresh setup:

```powershell
# Delete the database
Remove-Item "instance/ai_assistant.db" -Force

# Run seed script again
python seed_demo_data.py
```

### Issue: "Database locked" error

**Solution:**
1. Stop the Flask server
2. Delete the database
3. Start Flask again (it will recreate the database)
4. Run seed script

### Issue: Tasks/Schedules not showing up

**Solution:**
1. Verify you're logged in correctly (check button shows "demo_user (Logout)")
2. Open browser console (F12 → Console) to check for errors
3. Check backend logs for error messages
4. Refresh the page (F5)

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

## 🎓 Learning Resources

- **QUICK_START.md** - 5-minute quick start
- **SETUP_GUIDE.md** - Comprehensive setup guide
- **IMPLEMENTATION_GUIDE.md** - Technical implementation details
- **TESTING_GUIDE.md** - Testing procedures

---

## 🎉 Success!

You now have:
- ✅ Demo user account
- ✅ 8 sample tasks
- ✅ 8 sample schedules
- ✅ AI assistant ready to interact
- ✅ Full database functionality

**Have fun testing the PLANSMART AI Assistant! 🚀**