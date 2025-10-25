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

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        transcriptEl.textContent = 'Listening...';
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
            transcriptEl.textContent = 'Stopped listening.';
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        transcriptEl.textContent = 'Error occurred. Please try again.';
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
    transcriptEl.textContent = 'Speech recognition not supported in this browser.';
    voiceBtn.disabled = true;
}

voiceBtn.addEventListener('click', () => {
    if (recognition) {
        if (isListening) {
            recognition.stop();
        } else {
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
    }
}

function displayMessage(message) {
    const transcriptEl = document.getElementById('transcript');
    // Append AI response to conversation history
    transcriptEl.innerHTML += `<p>AI: ${message}</p>`;
    transcriptEl.scrollTop = transcriptEl.scrollHeight; // Auto-scroll
    // Add TTS for AI responses
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(utterance);
    }
}

async function loadTasks(completedFilter) {
    try {
        let url = 'http://localhost:5000/get_tasks';
        if (completedFilter !== undefined) {
            url += `?completed=${completedFilter}`;
        }
        const response = await fetch(url);
        const tasks = await response.json();
        tasksList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span>${task.description} ${task.due_date ? `(Due: ${new Date(task.due_date).toLocaleString()})` : ''}</span>
                ${!task.completed ? `<button class="complete-btn" onclick="markDone(${task.id})">Mark Done</button>` : ''}
            `;
            tasksList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadSchedules() {
    try {
        const response = await fetch('http://localhost:5000/get_schedules');
        const schedules = await response.json();
        schedulesList.innerHTML = '';
        schedules.forEach(schedule => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${schedule.title} - ${new Date(schedule.start_time).toLocaleString()}</span>
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
    }
});

// Navigation functionality with AI integration
document.getElementById('schedule-btn').addEventListener('click', () => {
    // Trigger AI-guided schedule creation
    const aiPrompt = "I want to add a new schedule. What details do you need?";
    // Append user message to transcript
    transcriptEl.innerHTML += `<p>You: "${aiPrompt}"</p>`;
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    processVoiceInput(aiPrompt);
});

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
