<<<<<<< HEAD
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

=======
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
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
<<<<<<< HEAD
let keepListening = false; // Flag to keep listening continuously

const MAX_MESSAGES = 50; // Limit the number of messages in the transcript

function trimTranscript() {
    while (transcriptEl.children.length > MAX_MESSAGES) {
        transcriptEl.removeChild(transcriptEl.firstChild);
    }
}
=======
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
<<<<<<< HEAD
    recognition.maxAlternatives = 1;
=======
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
<<<<<<< HEAD
        transcriptEl.innerHTML += '<p>Listening...</p>';
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
=======
        transcriptEl.textContent = 'Listening...';
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
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
<<<<<<< HEAD
            transcriptEl.innerHTML += '<p>Stopped listening.</p>';
            transcriptEl.scrollTop = transcriptEl.scrollHeight;
        }
        // Restart listening if keepListening is true
        if (keepListening) {
            setTimeout(() => {
                recognition.start();
            }, 1000); // Restart after 1 second
=======
            transcriptEl.textContent = 'Stopped listening.';
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
<<<<<<< HEAD
        transcriptEl.innerHTML += '<p>Error occurred. Please try again.</p>';
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
=======
        transcriptEl.textContent = 'Error occurred. Please try again.';
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
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
<<<<<<< HEAD
    transcriptEl.innerHTML += '<p>Speech recognition not supported in this browser.</p>';
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
=======
    transcriptEl.textContent = 'Speech recognition not supported in this browser.';
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
    voiceBtn.disabled = true;
}

voiceBtn.addEventListener('click', () => {
    if (recognition) {
        if (isListening) {
<<<<<<< HEAD
            keepListening = false; // Stop continuous listening
            recognition.stop();
        } else {
            keepListening = true; // Start continuous listening
=======
            recognition.stop();
        } else {
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
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
<<<<<<< HEAD
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
=======
            body: JSON.stringify({ text }),
        });
        const data = await response.json();
        console.log('Processed:', data);
        // Display AI response
        displayMessage(data.message);
        // Check if query is present, load filtered tasks
        if (data.parsed.query.completed !== undefined) {
            loadTasks(data.parsed.query.completed);
        } else {
            loadTasks();
        }
        loadSchedules();
    } catch (error) {
        console.error('Error processing input:', error);
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
    }
}

function displayMessage(message) {
    const transcriptEl = document.getElementById('transcript');
    // Append AI response to conversation history
<<<<<<< HEAD
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
=======
    transcriptEl.innerHTML += `<p>AI: ${message}</p>`;
    transcriptEl.scrollTop = transcriptEl.scrollHeight; // Auto-scroll
    // Add TTS for AI responses
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
        window.speechSynthesis.speak(utterance);
    }
}

async function loadTasks(completedFilter) {
    try {
        let url = 'http://localhost:5000/get_tasks';
        if (completedFilter !== undefined) {
            url += `?completed=${completedFilter}`;
        }
<<<<<<< HEAD
        const response = await fetch(url, {
            credentials: 'include',
        });
        const tasks = await response.json();
        tasksList.innerHTML = '';
        if (tasks.length === 0) {
            tasksList.innerHTML = '<li style="color: rgb(180, 160, 200); font-size: 12px; padding: 10px;">No tasks yet. Add one to get started!</li>';
        }
=======
        const response = await fetch(url);
        const tasks = await response.json();
        tasksList.innerHTML = '';
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
<<<<<<< HEAD
                <span>${task.description}${task.due_date ? `<br><small style="opacity: 0.7;">Due: ${new Date(task.due_date).toLocaleString()}</small>` : ''}</span>
                ${!task.completed ? `<button class="complete-btn" onclick="markDone(${task.id})">✓</button>` : ''}
=======
                <span>${task.description} ${task.due_date ? `(Due: ${new Date(task.due_date).toLocaleString()})` : ''}</span>
                ${!task.completed ? `<button class="complete-btn" onclick="markDone(${task.id})">Mark Done</button>` : ''}
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
            `;
            tasksList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadSchedules() {
    try {
<<<<<<< HEAD
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
=======
        const response = await fetch('http://localhost:5000/get_schedules');
        const schedules = await response.json();
        schedulesList.innerHTML = '';
        schedules.forEach(schedule => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${schedule.title} - ${new Date(schedule.start_time).toLocaleString()}</span>
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
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
<<<<<<< HEAD
                credentials: 'include',
=======
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
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
<<<<<<< HEAD
            credentials: 'include',
=======
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
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

<<<<<<< HEAD
// Allow Enter key to send message
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
=======
// Login functionality
loginBtn.addEventListener('click', async () => {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    if (username && password) {
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Login successful!');
                // Optionally, update UI to show logged in state
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
    }
});

// Navigation functionality with AI integration
<<<<<<< HEAD
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
=======
document.getElementById('schedule-btn').addEventListener('click', () => {
    // Trigger AI-guided schedule creation
    const aiPrompt = "I want to add a new schedule. What details do you need?";
    // Append user message to transcript
    transcriptEl.innerHTML += `<p>You: "${aiPrompt}"</p>`;
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    processVoiceInput(aiPrompt);
});
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97

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
<<<<<<< HEAD

=======
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
