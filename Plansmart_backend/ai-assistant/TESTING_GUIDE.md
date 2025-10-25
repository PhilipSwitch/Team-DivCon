# Testing AI Conversation Features

## ✅ Quick Start Test

### Step 1: Verify Files
Make sure these files exist:
- ✅ `backend/conversation_engine.py` (NEW)
- ✅ `backend/app.py` (UPDATED)
- ✅ `frontend/script.js` (UPDATED)
- ✅ `frontend/styles.css` (UPDATED)

### Step 2: Start Backend
```powershell
Set-Location "c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend"
python app.py
```

You should see Flask running on `http://localhost:5000`

### Step 3: Open Frontend
Open `c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\frontend\index.html` in your browser

## 🧪 Test Cases

### Test 1: Greeting Response
**Action:** Click microphone and say "Hello" or type "Hello" in the text box
**Expected Result:**
- ✅ AI responds with time-appropriate greeting (Good morning/afternoon/evening)
- ✅ AI asks about current state
- ✅ Response displays with purple background and emoji
- ✅ AI reads response aloud

**Example Response:**
```
🤖 AI Assistant:
Good morning! 🌅
Would you like to create a new schedule or add your first task?

What would you like to do?
• Create a new schedule
• Add tasks to existing schedules
• View your tasks
• View your schedules
```

---

### Test 2: Empty State (No Tasks/Schedules)
**Action:** Say or type "What should I do?"
**Expected Result:**
- ✅ AI detects no tasks or schedules
- ✅ Suggests creating a schedule or adding tasks
- ✅ Offers multiple action options

**Example Response:**
```
🤖 AI Assistant:
🎯 You're all set!
Would you like to create a new schedule or add your first task?

What would you like to do?
• Create a new schedule
• Add tasks to existing schedules
• View your tasks
• View your schedules
```

---

### Test 3: Create Task
**Action:** Say or type "Create task to finish my project"
**Expected Result:**
- ✅ Task is saved to database
- ✅ AI acknowledges the task
- ✅ Task appears in the sidebar task list
- ✅ AI suggests next steps

**Example Response:**
```
🤖 AI Assistant:
Great! Task created.
You now have 1 incomplete task(s).

What would you like to do?
• Create a new schedule
• Add tasks to existing schedules
• View your tasks
• View your schedules
```

---

### Test 4: View Tasks
**Action:** Say or type "Show my tasks"
**Expected Result:**
- ✅ AI detects "view_tasks" intent
- ✅ AI lists incomplete tasks
- ✅ AI asks if you want to schedule them

**Example Response:**
```
🤖 AI Assistant:
📋 You have 1 incomplete task(s):
• finish my project

Would you like to schedule these tasks or add more?
```

---

### Test 5: Create Schedule
**Action:** Say or type "Create schedule"
**Expected Result:**
- ✅ AI detects "create_schedule" intent
- ✅ AI asks for schedule name
- ✅ You can respond with the schedule details

**Example Response:**
```
🤖 AI Assistant:
Great! Let's create a new schedule.
What's the name of your schedule?
(e.g., 'Work Meeting', 'Workout Session')
```

---

### Test 6: Create Schedule (Full Command)
**Action:** Say or type "Schedule meeting at 14:00"
**Expected Result:**
- ✅ Schedule is saved with time parsing
- ✅ AI acknowledges
- ✅ Schedule appears in sidebar
- ✅ AI suggests adding tasks to it

**Example Response:**
```
🤖 AI Assistant:
✨ Everything looks organized!
What would you like to do next?

What would you like to do?
• Create a new schedule
• Add tasks to existing schedules
• View your tasks
• View your schedules
```

---

### Test 7: View Schedules
**Action:** Say or type "Show my schedules"
**Expected Result:**
- ✅ AI lists all schedules
- ✅ Shows today's schedules if any
- ✅ Offers to add more schedules or tasks

**Example Response:**
```
🤖 AI Assistant:
📅 You have 1 schedule(s).

Today's schedules (0):

Would you like to add more schedules or tasks?
```

---

### Test 8: Message Styling
**Action:** Any action that generates AI response
**Expected Result:**
- ✅ Messages have purple gradient background
- ✅ Messages slide in smoothly
- ✅ Messages have left border accent
- ✅ Emojis display correctly
- ✅ Text wraps properly

---

## 🎤 Speech Test

### Test Speech Recognition
**Action:** Click the microphone button and speak clearly
**Expected Result:**
- ✅ Button has pulsing animation while listening
- ✅ Your speech appears as "You: [transcript]"
- ✅ AI responds appropriately
- ✅ Keep speaking for continuous listening

---

## 🔊 Text-to-Speech Test

### Test AI Speaking
**Action:** Any action that generates AI response
**Expected Result:**
- ✅ Browser shows audio permission prompt (first time)
- ✅ AI response is read aloud
- ✅ Emojis are removed from speech (so it doesn't say "emoji name")
- ✅ Speed and voice are browser defaults

**To adjust voice settings:**
```javascript
// In browser console:
const utterance = new SpeechSynthesisUtterance("Test");
utterance.rate = 1.5; // Speed (0.1 to 10)
utterance.pitch = 1; // Pitch (0 to 2)
utterance.volume = 1; // Volume (0 to 1)
window.speechSynthesis.speak(utterance);
```

---

## 🌊 Full Conversation Flow Test

**Step-by-step conversation:**

1. **Say:** "Hello"
   - Expected: Time-based greeting with suggestions

2. **Say:** "What should I do?"
   - Expected: General suggestions for next action

3. **Say:** "Create task to finish project"
   - Expected: Task created, AI confirms

4. **Say:** "Schedule my tasks"
   - Expected: AI suggests creating a schedule or offers to add tasks to existing ones

5. **Say:** "Create schedule for tomorrow"
   - Expected: AI asks for more details or creates it

6. **Say:** "Show my schedules"
   - Expected: Lists your schedules

7. **Say:** "View my tasks"
   - Expected: Lists your incomplete tasks

---

## 🐛 Debugging

### If responses aren't showing:

1. **Check Browser Console (F12)**
   - Look for errors
   - Check network tab - is request being sent?

2. **Check Backend Console**
   ```
   Should see:
   - Processing input: "[user text]"
   - Detected intents: [...]
   - Response generated
   ```

3. **Check Database**
   - Verify tasks/schedules are being saved
   - Check file: `c:\Users\bensa\Documents\Team-DivCon\Plansmart_backend\ai-assistant\backend\instance\ai_assistant.db`

### If AI says "Processed" instead of smart response:

1. Verify `conversation_engine.py` exists
2. Check Python console for import errors
3. Restart Flask server

### If speech not working:

1. Check browser supports Web Speech API (Chrome, Edge, Safari)
2. Check audio permissions
3. Check microphone works in other apps
4. Verify browser volume isn't muted

---

## 📊 Data Verification

### Check Database Contents
Use any SQLite viewer to check:
- `ai_assistant.db` contains tables: `user`, `task`, `schedule`
- Tasks are being saved correctly
- Schedules have proper timestamps

### Check Conversation History
Visit endpoint: `http://localhost:5000/get_conversation_history`

You should see JSON like:
```json
{
  "history": [
    {
      "user": "hello",
      "ai": "Good morning! 🌅...",
      "timestamp": "2024-01-15T10:30:00.123456",
      "intents": ["greeting"]
    }
  ]
}
```

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] AI responds to user input
- [ ] Responses have smart suggestions
- [ ] Tasks are created and saved
- [ ] Schedules are created and saved
- [ ] Speech recognition works
- [ ] Text-to-speech works
- [ ] Messages display with styling
- [ ] Conversation history is tracked

---

## 🎯 Next Steps

Once testing is complete:

1. **Integrate LLM** (optional) - Use OpenAI or other APIs for more natural conversations
2. **Add More Intent Recognition** - Support more complex commands
3. **Implement User Preferences** - Remember user preferences
4. **Add Reminders** - Notify users at scheduled times
5. **Export Conversations** - Save conversation logs

---

**Everything working? Great!** 🎉 

**Issues?** Check the troubleshooting section above or provide details of what's not working.