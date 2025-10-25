<<<<<<< HEAD
# TODO: Integrate Templates from Plansmart_Frontend - Copy

- [x] Create getStarted.html as the landing page in ai-assistant/frontend/
- [x] Update index.html to dashboard.html with dashboard layout from dashBoard.html
- [x] Integrate voice section and lists into the dashboard layout
- [x] Update styles.css with styles from dashBoard.css and getStarted.css
- [x] Add navigation from getStarted.html to dashboard.html
- [x] Test the sequence: landing page first, then dashboard
- [x] Integrate color codes from Plansmart_Frontend - Copy to existing styles.css
- [x] Customize index.html page to have the AI microphone in that pig box with dynamic text change on listening
- [x] Add visual microphone / audio-driven animation microphone effect
- [x] Customize dashboard page to be standard and aesthetic, remove removable elements

# TODO: Make Login Button Interact with Database

- [x] Add User model to models.py
- [x] Add login endpoint to app.py
- [x] Update script.js to handle login functionality
- [x] Test login interaction

# TODO: Improve Speech Recognition

- [x] Update script.js to use continuous recognition with interim results for immediate output
- [x] Set language to 'en-US' for better accuracy
- [x] Handle speech events to start listening on user speech detection
- [x] Test the improved speech recognition for real-time feedback and precision
 lo
=======
# TODO for Improving AI Assistant

- [x] Enhance input parsing: Improve OpenAI prompt in app.py to handle complex natural language, multi-step requests, and clarifications
- [x] Utilize conversation history: Pass full history to OpenAI for contextual responses
- [x] Add personalization: Include user tasks and schedules in prompts for tailored suggestions
- [x] Improve error handling: Better fallbacks and user feedback for parsing failures in app.py
- [x] Add TTS: Implement text-to-speech for AI responses in script.js
- [x] Integrate buttons with AI: Update sidebar button event listeners in script.js to trigger AI-guided prompts
- [x] Improve conversation persistence: Modify script.js to append messages to transcript instead of overwriting for better user experience
- [x] Connect to open source AI: Integrate Ollama for interactive responses using llama2 model
- [x] Update index.html: Add TTS controls if needed
- [x] Test improvements: Run Flask app, interact via voice/text, verify context, TTS, and button integrations
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
