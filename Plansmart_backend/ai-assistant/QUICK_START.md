# PLANSMART Login System - Quick Start (5 Minutes)

## Step 1: Install & Configure (1 min)

```powershell
# Navigate to backend
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend"

# Install dependencies
pip install -r requirements.txt

# Copy environment template
Copy-Item ".env.example" ".env"
```

Edit `.env`:
```ini
SECRET_KEY=my-super-secret-key
```

---

## Step 2: Start Backend (30 sec)

```powershell
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend"
python app.py
```

✅ You should see:
```
==================================================
PLANSMART AI ASSISTANT
Mode: 📝 Rule-Based
==================================================

 * Running on http://127.0.0.1:5000
```

---

## Step 3: Open Login Page (30 sec)

**Option A: Direct file opening**
```
Open: c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\frontend\login.html
```

**Option B: Local server** (Recommended)
```powershell
# Open new PowerShell window in frontend directory
cd "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\frontend"
python -m http.server 8000
```

Then open: `http://localhost:8000/login.html`

---

## Step 4: Test Authentication (3 min)

### ✅ Test Registration
1. Click **"Sign Up"**
2. Enter:
   - Username: `john_doe`
   - Password: `Test123456`
   - Confirm: `Test123456`
3. Click **"Create Account"**
4. ✅ Should redirect to dashboard

### ✅ Test Login
1. Click **"Login"** (toggle back)
2. Enter:
   - Username: `john_doe`
   - Password: `Test123456`
3. ✅ Should login and show "john_doe (Logout)"

### ✅ Test Guest Mode
1. Go back to login.html
2. Click **"Continue as Guest"**
3. ✅ Should access dashboard as "Guest (Logout)"

### ✅ Test Logout
1. Click the logout button
2. ✅ Should return to login page

---

## 🎉 Success!

Your login system is working! The app now has:
- ✅ User registration
- ✅ User login with session
- ✅ Guest mode
- ✅ Logout functionality
- ✅ Protected dashboard
- ✅ Secure password hashing

---

## 🎨 UI Features

The login page includes:
- 🟣 Purple gradient background (matches app design)
- 📱 Responsive design
- ✨ Smooth animations
- 🔄 Toggle between login/signup
- 👤 Guest mode option
- ⚠️ Error messages
- ✅ Success messages
- 🔒 Password field
- 📝 Form validation

---

## 🚀 What's Next?

1. **Try the Dashboard**
   - Speak to the AI with the voice button 🎤
   - Add tasks
   - Create schedules
   - All data is saved per user!

2. **Connect OpenAI** (Optional)
   - Get API key from openai.com
   - Add to `.env`: `OPENAI_API_KEY=sk-...`
   - Restart Flask
   - AI responses will be more intelligent!

3. **Customize**
   - Edit `login.html` for different colors
   - Modify `styles.css` for custom fonts
   - Add your branding

---

## 📋 Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/signup` | POST | Create account |
| `/login` | POST | User login |
| `/guest` | POST | Guest session |
| `/logout` | POST | End session |
| `/check_auth` | GET | Check if logged in |
| `/process_input` | POST | Talk to AI |
| `/get_tasks` | GET | List tasks |
| `/get_schedules` | GET | List schedules |

---

## 🐛 Quick Fixes

**"Connection error"** → Start Flask with `python app.py`

**"Invalid credentials"** → Check username/password exact match

**"Redirect loop"** → Clear browser cookies and restart

**"Database error"** → Delete `instance/ai_assistant.db` and restart

---

**Enjoy your smart scheduling assistant! 🚀**