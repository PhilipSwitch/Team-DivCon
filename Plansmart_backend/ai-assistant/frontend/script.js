// Authentication check on page load
async function checkAuthentication() {
    try {
        const response = await fetch('http://localhost:5000/check_auth', {
            credentials: 'include',
        });
        
        if (!response.ok) {
            // Not authenticated - allow as guest
            updateLoginButton('Login');
            return false;
        }
        
        const data = await response.json();
        if (data.is_guest) {
            updateLoginButton('Guest (Logout)');
        } else if (data.username) {
            updateLoginButton(`${data.username} (Logout)`);
        }
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        // Allow guest access if auth check fails
        updateLoginButton('Login');
        return false;
    }
}

// Update login button to show username and logout
function updateLoginButton(label) {
    const loginBtn = document.getElementById('login');
    if (loginBtn) {
        loginBtn.textContent = label;
        loginBtn.addEventListener('click', logout);
    }
}

// Logout function
async function logout() {
    try {
        await fetch('http://localhost:5000/logout', {
            method: 'POST',
            credentials: 'include',
        });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
}

// Check auth on page load
window.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

const voiceBtn = document.getElementById('voice-btn');
const transcriptEl = document.getElementById('transcript');
const tasksList = document.getElementById('tasks-list');
const schedulesList = document.getElementById('schedules-list');
const loginBtn = document.getElementById('login');
const inputField = document.querySelector('.input');
const sendBtn = document.getElementById('send-btn');

let recognition;
let isListening = false;
let finalTranscript = '';
let keepListening = false; // Flag to keep listening continuously

const MAX_MESSAGES = 50; // Limit the number of messages in the transcript

function trimTranscript() {
    while (transcriptEl.children.length > MAX_MESSAGES) {
        transcriptEl.removeChild(transcriptEl.firstChild);
    }
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        transcriptEl.innerHTML += '<p>Listening...</p>';
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
        finalTranscript = '';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        // Update interim display without overwriting history
        const lastMessage = transcriptEl.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('interim')) {
            lastMessage.textContent = `You (interim): "${finalTranscript}${interimTranscript}"`;
        } else {
            transcriptEl.innerHTML += `<p class="interim">You (interim): "${finalTranscript}${interimTranscript}"</p>`;
        }
        transcriptEl.scrollTop = transcriptEl.scrollHeight; // Auto-scroll
        if (finalTranscript) {
            // Append final user message
            transcriptEl.innerHTML += `<p>You: "${finalTranscript}"</p>`;
            // Remove interim
            const interimEl = transcriptEl.querySelector('.interim');
            if (interimEl) interimEl.remove();
            processVoiceInput(finalTranscript);
            finalTranscript = ''; // Reset for next utterance
        }
    };

    recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        if (!finalTranscript) {
            transcriptEl.innerHTML += '<p>Stopped listening.</p>';
            transcriptEl.scrollTop = transcriptEl.scrollHeight;
        }
        // Restart listening if keepListening is true
        if (keepListening) {
            setTimeout(() => {
                recognition.start();
            }, 1000); // Restart after 1 second
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        transcriptEl.innerHTML += '<p>Error occurred. Please try again.</p>';
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
        isListening = false;
        voiceBtn.classList.remove('listening');
    };

    recognition.onspeechstart = () => {
        // Optional: Handle when speech starts
    };

    recognition.onspeechend = () => {
        // Optional: Handle when speech ends
    };
} else {
    transcriptEl.innerHTML += '<p>Speech recognition not supported in this browser.</p>';
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    voiceBtn.disabled = true;
}

voiceBtn.addEventListener('click', () => {
    if (recognition) {
        if (isListening) {
            keepListening = false; // Stop continuous listening
            recognition.stop();
        } else {
            keepListening = true; // Start continuous listening
            recognition.start();
        }
    }
});

async function processVoiceInput(text) {
    try {
        const response = await fetch('http://localhost:5000/process_input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ text }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error:', response.status, errorText);
            displayMessage(`Error from backend (${response.status}): ${errorText || 'Unknown error'}`);
            return;
        }
        
        const data = await response.json();
        console.log('Processed:', data);
        // Display AI response (prefer ai_response over message)
        const aiMessage = data.ai_response || data.message || 'Done!';
        displayMessage(aiMessage);
        // Always reload lists after processing
        loadTasks();
        loadSchedules();
    } catch (error) {
        console.error('Error processing input:', error);
        displayMessage(`Error: ${error.message || 'An unexpected error occurred'}`);
    }
}

function displayMessage(message) {
    const transcriptEl = document.getElementById('transcript');
    // Append AI response to conversation history
    const aiMessage = document.createElement('div');
    aiMessage.className = 'ai-message';
    aiMessage.innerHTML = `<strong>🤖 AI Assistant:</strong><p>${message.replace(/\n/g, '<br>')}</p>`;
    transcriptEl.appendChild(aiMessage);
    trimTranscript(); // Trim if necessary
    transcriptEl.scrollTop = transcriptEl.scrollHeight; // Auto-scroll
    // Add TTS for AI responses - read only the main message without formatting
    if ('speechSynthesis' in window) {
        // Clean message for speech (remove emojis and extra formatting)
        const cleanMessage = message.replace(/[🤖📅✅⏰✨📋📉🌅☀️🌙🎯]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanMessage);
        window.speechSynthesis.speak(utterance);
    }
}

async function loadTasks(completedFilter) {
    try {
        let url = 'http://localhost:5000/get_tasks';
        if (completedFilter !== undefined) {
            url += `?completed=${completedFilter}`;
        }
        const response = await fetch(url, {
            credentials: 'include',
        });
        const tasks = await response.json();
        tasksList.innerHTML = '';
        if (tasks.length === 0) {
            tasksList.innerHTML = '<li style="color: rgb(180, 160, 200); font-size: 12px; padding: 10px;">No tasks yet. Add one to get started!</li>';
        }
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span>${task.description}${task.due_date ? `<br><small style="opacity: 0.7;">Due: ${new Date(task.due_date).toLocaleString()}</small>` : ''}</span>
                ${!task.completed ? `<button class="complete-btn" onclick="markDone(${task.id})">✓</button>` : ''}
            `;
            tasksList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadSchedules() {
    try {
        const response = await fetch('http://localhost:5000/get_schedules', {
            credentials: 'include',
        });
        const schedules = await response.json();
        schedulesList.innerHTML = '';
        if (schedules.length === 0) {
            schedulesList.innerHTML = '<li style="color: rgb(180, 160, 200); font-size: 12px; padding: 10px;">No schedules yet. Create one to get started!</li>';
        }
        schedules.forEach(schedule => {
            const li = document.createElement('li');
            li.className = 'schedule-item';
            li.innerHTML = `
                <span>${schedule.title}<br><small style="opacity: 0.7;">${new Date(schedule.start_time).toLocaleString()}</small></span>
                <button class="edit-btn" onclick="editSchedule(${schedule.id}, '${schedule.title}', '${schedule.start_time}')">Edit</button>
            `;
            schedulesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
}

async function editSchedule(id, title, startTime) {
    const newTitle = prompt('Edit title:', title);
    const newTime = prompt('Edit start time (YYYY-MM-DDTHH:MM):', new Date(startTime).toISOString().slice(0, 16));
    if (newTitle && newTime) {
        try {
            await fetch(`http://localhost:5000/update_schedule/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ title: newTitle, start_time: newTime }),
            });
            loadSchedules();
        } catch (error) {
            console.error('Error updating schedule:', error);
        }
    }
}

async function markDone(taskId) {
    try {
        await fetch(`http://localhost:5000/mark_done/${taskId}`, {
            method: 'PUT',
            credentials: 'include',
        });
        loadTasks();
    } catch (error) {
        console.error('Error marking task done:', error);
    }
}

// Text input functionality
sendBtn.addEventListener('click', () => {
    const text = inputField.value.trim();
    if (text) {
        // Append user message to transcript
        transcriptEl.innerHTML += `<p>You: "${text}"</p>`;
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
        processVoiceInput(text);
        inputField.value = '';
    }
});

// Allow Enter key to send message
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

// Navigation functionality with AI integration
// Hook up existing buttons
const addScheduleBtn = document.getElementById('add-schedule-btn');
if (addScheduleBtn) {
    addScheduleBtn.addEventListener('click', () => {
        const aiPrompt = 'I want to add a new schedule. What details do you need?';
        transcriptEl.innerHTML += `<p>You: "${aiPrompt}"</p>`;
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
        processVoiceInput(aiPrompt);
    });
}

const addTaskBtn = document.getElementById('add-task-btn');
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
        const aiPrompt = 'I want to add a new task. What task would you like me to create?';
        transcriptEl.innerHTML += `<p>You: "${aiPrompt}"</p>`;
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
        processVoiceInput(aiPrompt);
    });
}

document.getElementById('task-overview-btn').addEventListener('click', () => {
    // Trigger AI-guided task overview
    const aiPrompt = "Show me my tasks.";
    // Append user message to transcript
    transcriptEl.innerHTML += `<p>You: "${aiPrompt}"</p>`;
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    processVoiceInput(aiPrompt);
});

// Load data on page load
window.addEventListener('load', () => {
    loadTasks();
    loadSchedules();
});

