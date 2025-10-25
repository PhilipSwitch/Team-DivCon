const voiceBtn = document.getElementById('voice-btn');
const transcriptEl = document.getElementById('transcript');
const tasksList = document.getElementById('tasks-list');
const schedulesList = document.getElementById('schedules-list');
const loginBtn = document.getElementById('login');
const inputField = document.querySelector('.input');
const sendBtn = document.getElementById('send-btn');
const addScheduleBtn = document.getElementById('add-schedule-btn');
// --- Create "Add Task" and "Task Overview" Buttons ---
const tasksSection = document.querySelector('.tasks-section');

if (tasksSection) {
  const addTaskBtn = document.createElement('button');
  addTaskBtn.id = 'add-task-btn';
  addTaskBtn.textContent = 'Add Task';
  addTaskBtn.className = 'same-style-btn';

  const viewTasksBtn = document.createElement('button');
  viewTasksBtn.id = 'view-tasks-btn';
  viewTasksBtn.textContent = 'Task Overview';
  viewTasksBtn.className = 'same-style-btn';

  tasksSection.appendChild(addTaskBtn);
  tasksSection.appendChild(viewTasksBtn);
}


let recognition;
let isListening = false;
let finalTranscript = '';

/* --- Speech Recognition --- */
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
      if (event.results[i].isFinal) finalTranscript += transcript;
      else interimTranscript += transcript;
    }
    transcriptEl.textContent = `You said: "${finalTranscript}${interimTranscript}"`;
    if (finalTranscript) {
  const lowerText = finalTranscript.toLowerCase();

  // Detect which modal is open
  if (scheduleModal.style.display === 'flex') {
    // === Schedule modal open ===
    if (lowerText.includes('at')) {
      const [titlePart, timePart] = lowerText.split('at');
      scheduleTitleInput.value = titlePart.trim();
      scheduleTimeInput.value = timePart.trim().replace(/[^0-9:apm\s]/g, '');
    } else {
      scheduleTitleInput.value = lowerText;
    }
  } else if (addTaskModal.style.display === 'flex') {
    // === Task modal open ===
    if (lowerText.includes('due')) {
      const [taskPart, duePart] = lowerText.split('due');
      taskTitleInput.value = taskPart.trim();
      taskDueInput.value = duePart.trim().replace(/[^0-9:apm\s]/g, '');
    } else {
      taskTitleInput.value = lowerText;
    }
  } else {
    // === Otherwise, treat as general chat/command ===
    processVoiceInput(finalTranscript);
  }

  finalTranscript = '';
}
  };

  recognition.onend = () => {
    isListening = false;
    voiceBtn.classList.remove('listening');
    transcriptEl.textContent = 'Stopped listening.';
  };

  recognition.onerror = (e) => {
    console.error('Speech recognition error:', e.error);
    transcriptEl.textContent = 'Error occurred. Please try again.';
    isListening = false;
    voiceBtn.classList.remove('listening');
  };
} else {
  transcriptEl.textContent = 'Speech recognition not supported.';
  voiceBtn.disabled = true;
}

voiceBtn.addEventListener('click', () => {
  if (recognition) {
    if (isListening) recognition.stop();
    else recognition.start();
  }
});

/* --- Backend Communication --- */
async function processVoiceInput(text) {
  try {
    const response = await fetch('http://localhost:5000/process_input', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    console.log('Processed:', data);
    loadTasks();
    loadSchedules();
  } catch (error) {
    console.error('Error processing input:', error);
  }
}

async function loadTasks() {
  try {
    const response = await fetch('http://localhost:5000/get_tasks');
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
  } catch (err) {
    console.error('Error loading tasks:', err);
  }
}

async function loadSchedules() {
  try {
    const response = await fetch('http://localhost:5000/get_schedules');
    const schedules = await response.json();
    schedulesList.innerHTML = '';
    schedules.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${s.title} - ${new Date(s.start_time).toLocaleString()}</span>
      `;
      schedulesList.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading schedules:', err);
  }
}

async function markDone(id) {
  try {
    await fetch(`http://localhost:5000/mark_done/${id}`, { method: 'PUT' });
    loadTasks();
  } catch (err) {
    console.error('Error marking done:', err);
  }
}

/* --- Manual Schedule Creation --- */
// Modal elements
const scheduleModal = document.getElementById('schedule-modal');
const saveScheduleBtn = document.getElementById('save-schedule');
const cancelScheduleBtn = document.getElementById('cancel-schedule');
const scheduleTitleInput = document.getElementById('schedule-title');
const scheduleTimeInput = document.getElementById('schedule-time');
const scheduleDescInput = document.getElementById('schedule-desc');

// Show modal when Add Schedule button is clicked
addScheduleBtn.addEventListener('click', () => {
  scheduleModal.style.display = 'flex';
});

// Hide modal
cancelScheduleBtn.addEventListener('click', () => {
  scheduleModal.style.display = 'none';
  scheduleTitleInput.value = '';
  scheduleTimeInput.value = '';
  scheduleDescInput.value = '';
});

// === Add Task Modal Logic ===
const addTaskBtn = document.getElementById('add-task-btn');
const addTaskModal = document.getElementById('add-task-modal');
const closeTaskModal = document.getElementById('close-task-modal');
const taskScheduleSelect = document.getElementById('task-schedule-select');
const submitTaskBtn = document.getElementById('submit-task-btn');
const taskTitleInput = document.getElementById('task-title-input');
const taskDueInput = document.getElementById('task-due-input');

// === Voice Input for Add Task Modal ===
const taskVoiceBtn = document.getElementById('task-voice-btn');

if (taskVoiceBtn) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const taskRecognition = new SpeechRecognition();
    taskRecognition.lang = 'en-US';
    taskRecognition.continuous = false;
    taskRecognition.interimResults = false;

    let isListeningTask = false;

    taskVoiceBtn.addEventListener('click', () => {
      if (isListeningTask) {
        taskRecognition.stop();
        isListeningTask = false;
        taskVoiceBtn.textContent = '🎤 Speak Task';
        taskVoiceBtn.classList.remove('listening');
      } else {
        taskRecognition.start();
        isListeningTask = true;
        taskVoiceBtn.textContent = '🎧 Listening...';
        taskVoiceBtn.classList.add('listening');
      }
    });

    taskRecognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Task voice input:', transcript);

      // Try to extract key details
      const scheduleMatch = transcript.match(/schedule (.+?)(?=$| due| in | at )/);
      const titleMatch = transcript.match(/(?:add|task|do|make)? ?(?:task )?(.*?)(?= in schedule| in | due | at |$)/);
      const timeMatch = transcript.match(/(?:due|at) (.+)$/);

      if (scheduleMatch) {
        await populateScheduleDropdown();
        const scheduleName = scheduleMatch[1].trim();
        // Find and select the schedule if exists
        const option = [...taskScheduleSelect.options].find(opt =>
          opt.textContent.toLowerCase().includes(scheduleName)
        );
        if (option) taskScheduleSelect.value = option.value;
      }

      if (titleMatch && titleMatch[1].trim().length > 0) {
        taskTitleInput.value = titleMatch[1].trim();
      }

      if (timeMatch) {
        try {
          const rawTime = timeMatch[1].trim();
          const parsed = new Date(rawTime);
          if (!isNaN(parsed)) {
            const localISO = parsed.toISOString().slice(0, 16);
            taskDueInput.value = localISO;
          }
        } catch (err) {
          console.warn('Could not parse time:', err);
        }
      }

      taskVoiceBtn.textContent = '🎤 Speak Task';
      taskVoiceBtn.classList.remove('listening');
      isListeningTask = false;
    };

    taskRecognition.onerror = (err) => {
      console.error('Speech recognition error (task):', err);
      isListeningTask = false;
      taskVoiceBtn.textContent = '🎤 Speak Task';
      taskVoiceBtn.classList.remove('listening');
      alert('Voice input error. Please try again.');
    };
  } else {
    taskVoiceBtn.disabled = true;
    taskVoiceBtn.textContent = '🎤 (Voice Not Supported)';
  }
}


// Open modal
addTaskBtn.addEventListener('click', async () => {
  addTaskModal.style.display = 'flex';
  await populateScheduleDropdown();
});

// Close modal
closeTaskModal.addEventListener('click', () => {
  addTaskModal.style.display = 'none';
});

// Click outside to close
window.addEventListener('click', (e) => {
  if (e.target === addTaskModal) addTaskModal.style.display = 'none';
});

// Load schedules into dropdown
async function populateScheduleDropdown() {
  try {
    const res = await fetch('http://localhost:5000/get_schedules');
    const schedules = await res.json();
    taskScheduleSelect.innerHTML = '<option value="">-- Choose Schedule --</option>';
    schedules.forEach(s => {
      const option = document.createElement('option');
      option.value = s.title;
      option.textContent = s.title;
      taskScheduleSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load schedules:', err);
  }
}

// Submit task
submitTaskBtn.addEventListener('click', async () => {
  const scheduleTitle = taskScheduleSelect.value;
  const title = taskTitleInput.value.trim();
  const dueDate = taskDueInput.value;

  if (!scheduleTitle || !title) {
    alert('Please select a schedule and enter a task title.');
    return;
  }

const taskData = {
  title: title,
  schedule: scheduleTitle,
  due_date: dueDate || null,
};


  try {
    console.log('Sending task data:', taskData);
    const res = await fetch('http://localhost:5000/add_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

if (res.ok) {
  alert('✅ Task added successfully!');
  addTaskModal.style.display = 'none';
  taskTitleInput.value = '';
  taskDueInput.value = '';

  // Refresh sidebar
  await loadTasks();

  // If user is currently viewing schedules or task overview, refresh that grid too
  const currentWrapper = document.querySelector('.schedule-view-wrapper, .schedule-grid');
  if (currentWrapper) {
    try {
      const response = await fetch('http://localhost:5000/get_schedules');
      const schedules = await response.json();
      currentWrapper.innerHTML = ''; // clear old cards

      schedules.forEach(s => {
        if (s.completed) return; // skip completed ones

        const card = document.createElement('div');
        card.classList.add('schedule-card');
        card.dataset.scheduleId = s.id;
        const date = new Date(s.start_time);
        card.innerHTML = `
          <h3>${s.title}</h3>
          <p>${date.toLocaleString()}</p>
          ${s.description ? `<p>${s.description}</p>` : ''}
        `;
        currentWrapper.appendChild(card);
      });
    } catch (err) {
      console.error('Error refreshing schedules after task add:', err);
    }
  }
} else {
  alert('❌ Failed to add task.');
}
  } catch (err) {
    console.error('Error adding task:', err);
  }
}); // closes submitTaskBtn event listener


// === Voice Input for Schedule Modal (Improved) ===
const scheduleVoiceBtn = document.getElementById('schedule-voice-btn');

if (scheduleVoiceBtn) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const scheduleRecognition = new SpeechRecognition();
    scheduleRecognition.lang = 'en-US';
    scheduleRecognition.continuous = false;
    scheduleRecognition.interimResults = false;

    let isListeningSchedule = false;

    scheduleVoiceBtn.addEventListener('click', () => {
      if (isListeningSchedule) {
        scheduleRecognition.stop();
        isListeningSchedule = false;
        scheduleVoiceBtn.classList.remove('listening');
        scheduleVoiceBtn.textContent = '🎤 Speak Schedule';
      } else {
        scheduleRecognition.start();
        isListeningSchedule = true;
        scheduleVoiceBtn.classList.add('listening');
        scheduleVoiceBtn.textContent = '🎧 Listening...';
      }
    });

    scheduleRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Voice heard (schedule):', transcript);

      // --- Simple fill logic ---
      // e.g. "meeting at 3pm about project review"
      const titleMatch = transcript.match(/^(.*?) at /);
      const timeMatch = transcript.match(/at ([0-9]{1,2}(:[0-9]{2})?( ?(am|pm))?)/);
      const descMatch = transcript.match(/about (.+)/);

      // Fallback: if user just says "meeting at 4", use the whole text as title
      if (!titleMatch && !timeMatch && !descMatch) {
        scheduleTitleInput.value = transcript;
      }

      if (titleMatch) scheduleTitleInput.value = titleMatch[1].trim();

      if (timeMatch) {
        let rawTime = timeMatch[1].trim().toUpperCase();
        try {
          const parsed = new Date(`1970-01-01T${rawTime}`);
          if (!isNaN(parsed)) {
            const hh = String(parsed.getHours()).padStart(2, '0');
            const mm = String(parsed.getMinutes()).padStart(2, '0');
            scheduleTimeInput.value = `${hh}:${mm}`;
          }
        } catch (err) {
          console.warn('Time parse failed:', err);
        }
      }

      if (descMatch) scheduleDescInput.value = descMatch[1].trim();

      // Stop listening after capturing once
      scheduleRecognition.stop();
      isListeningSchedule = false;
      scheduleVoiceBtn.classList.remove('listening');
      scheduleVoiceBtn.textContent = '🎤 Speak Schedule';
    };

    scheduleRecognition.onerror = (err) => {
      console.error('Speech recognition error (schedule):', err);
      isListeningSchedule = false;
      scheduleVoiceBtn.classList.remove('listening');
      scheduleVoiceBtn.textContent = '🎤 Speak Schedule';
      alert('Voice input error. Please try again.');
    };
  } else {
    scheduleVoiceBtn.disabled = true;
    scheduleVoiceBtn.textContent = '🎤 (Voice Not Supported)';
  }
}

// === View Schedule Logic (Fixed + Animated + Back Button) ===
const viewScheduleBtn = document.getElementById('view-schedule-btn');
const textPage = document.getElementById('textpage');
const voiceBtnMain = document.getElementById('voice-btn');
const transcriptElMain = document.getElementById('transcript');

viewScheduleBtn.addEventListener('click', async () => {
  try {
    // Fetch schedules from backend
    const response = await fetch('http://localhost:5000/get_schedules');
    const schedules = await response.json();

    // --- Animate Fade Out of Mic and Text ---
    voiceBtnMain.style.transition = 'opacity 0.4s ease';
    transcriptElMain.style.transition = 'opacity 0.4s ease';
    voiceBtnMain.style.opacity = '0';
    transcriptElMain.style.opacity = '0';

    // Wait for fade-out to finish before swapping content
    setTimeout(() => {
      voiceBtnMain.style.display = 'none';
      transcriptElMain.style.display = 'none';

      // --- Create new container for schedule view ---
      const wrapper = document.createElement('div');
      wrapper.classList.add('schedule-view-wrapper');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.width = '100%';
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'scale(0.95)';
      wrapper.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

      // --- Create Back Button ---
      const backBtn = document.createElement('button');
      backBtn.id = 'back-to-main-btn';
      backBtn.textContent = '⬅ Back to Main';
      backBtn.className = 'same-style-btn';
      backBtn.style.marginBottom = '15px';

      backBtn.addEventListener('click', () => {
        // Fade out the schedule view
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'scale(0.95)';

        setTimeout(() => {
          textPage.innerHTML = '';

          // Show mic and transcript again
          voiceBtnMain.style.display = 'flex';
          transcriptElMain.style.display = 'block';

          // Fade back in main view
          setTimeout(() => {
            voiceBtnMain.style.opacity = '1';
            transcriptElMain.style.opacity = '1';
          }, 50);
        }, 400);
      });
      document.addEventListener('click', async (e) => {
  const card = e.target.closest('.schedule-card');
  if (!card) return;

  const scheduleTitle = card.querySelector('h3')?.textContent;
  if (!scheduleTitle) return;

  // Fade out current grid
  const textPage = document.getElementById('textpage');
  const wrapper = card.closest('.schedule-view-wrapper');
  if (wrapper) {
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'scale(0.95)';
  }

  setTimeout(async () => {
    const newWrapper = document.createElement('div');
    newWrapper.classList.add('schedule-detail-view');
    newWrapper.style.display = 'flex';
    newWrapper.style.flexDirection = 'column';
    newWrapper.style.alignItems = 'center';
    newWrapper.style.width = '100%';
    newWrapper.style.opacity = '0';
    newWrapper.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    const backBtn = document.createElement('button');
    backBtn.textContent = '⬅ Back';
    backBtn.classList.add('same-style-btn');
    backBtn.style.marginBottom = '15px';
    backBtn.addEventListener('click', () => {
      loadSchedules();
      viewScheduleBtn.click(); // reopen view
    });

    const title = document.createElement('h2');
    title.textContent = `Tasks under "${scheduleTitle}"`;

    const taskGrid = document.createElement('div');
    taskGrid.classList.add('schedule-grid');

    try {
      const res = await fetch('http://localhost:5000/get_tasks');
      const tasks = await res.json();
      const related = tasks.filter(t =>
        t.description.toLowerCase().includes(scheduleTitle.toLowerCase())
      );

      if (related.length === 0) {
        taskGrid.innerHTML = '<p>No tasks yet for this schedule.</p>';
      } else {
        related.forEach(t => {
          const card = document.createElement('div');
          card.classList.add('schedule-card');
          card.innerHTML = `
            <h3>${t.description}</h3>
            ${t.due_date ? `<p>Due: ${new Date(t.due_date).toLocaleString()}</p>` : ''}
          `;
          taskGrid.appendChild(card);
        });
      }
    } catch (err) {
      console.error('Failed to load related tasks:', err);
    }

    newWrapper.appendChild(backBtn);
    newWrapper.appendChild(title);
    newWrapper.appendChild(taskGrid);

    textPage.innerHTML = '';
    textPage.appendChild(newWrapper);

    setTimeout(() => {
      newWrapper.style.opacity = '1';
      newWrapper.style.transform = 'scale(1)';
    }, 50);
  }, 400);
});


      // --- Click Schedule Folder to Expand ---
schedulesList.addEventListener('click', async (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  const scheduleTitle = li.textContent.split(' - ')[0].trim();

  try {
    // Smoothly fade out main mic view
    voiceBtnMain.style.transition = 'opacity 0.4s ease';
    transcriptElMain.style.transition = 'opacity 0.4s ease';
    voiceBtnMain.style.opacity = '0';
    transcriptElMain.style.opacity = '0';

    setTimeout(async () => {
      voiceBtnMain.style.display = 'none';
      transcriptElMain.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.classList.add('schedule-detail-view');
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'scale(0.95)';
      wrapper.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.width = '100%';

      const backBtn = document.createElement('button');
      backBtn.textContent = '⬅ Back';
      backBtn.id = 'back-to-list-btn';
      backBtn.className = 'same-style-btn';
      backBtn.style.marginBottom = '15px';
      backBtn.addEventListener('click', () => {
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'scale(0.95)';
        setTimeout(() => {
          textPage.innerHTML = '';
          voiceBtnMain.style.display = 'flex';
          transcriptElMain.style.display = 'block';
          setTimeout(() => {
            voiceBtnMain.style.opacity = '1';
            transcriptElMain.style.opacity = '1';
          }, 50);
        }, 400);
      });

      // Load all tasks linked to this schedule
      const response = await fetch('http://localhost:5000/get_tasks');
      const tasks = await response.json();
      const filtered = tasks.filter(t => t.description.toLowerCase().includes(scheduleTitle.toLowerCase()));

      const titleEl = document.createElement('h2');
      titleEl.textContent = `Tasks for "${scheduleTitle}"`;
// Add Task button inside folder view
const addTaskInFolderBtn = document.createElement('button');
addTaskInFolderBtn.textContent = '➕ Add New Task';
addTaskInFolderBtn.className = 'same-style-btn';
addTaskInFolderBtn.style.marginBottom = '15px';

addTaskInFolderBtn.addEventListener('click', async () => {
  addTaskModal.style.display = 'flex';
  await populateScheduleDropdown();
  taskScheduleSelect.value = scheduleTitle; // auto-select current folder
});

      const taskGrid = document.createElement('div');
      taskGrid.classList.add('schedule-grid');
      if (filtered.length === 0) {
        taskGrid.innerHTML = '<p style="text-align:center;">No tasks yet.</p>';
      } else {
        filtered.forEach(t => {
          const card = document.createElement('div');
          card.classList.add('schedule-card');
          card.innerHTML = `
            <h3>${t.description}</h3>
            ${t.due_date ? `<p>Due: ${new Date(t.due_date).toLocaleString()}</p>` : ''}
            ${t.completed ? `<p style="color:green;">✅ Completed</p>` : `<p style="color:red;">❌ Not Done</p>`}
          `;
          taskGrid.appendChild(card);
        });
      }

      wrapper.appendChild(backBtn);
      wrapper.appendChild(titleEl);
      wrapper.appendChild(addTaskInFolderBtn);
      wrapper.appendChild(taskGrid);
      textPage.innerHTML = '';
      textPage.appendChild(wrapper);

      setTimeout(() => {
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'scale(1)';
      }, 50);
    }, 400);
  } catch (err) {
    console.error('Error expanding schedule:', err);
  }
});


      // --- Create Schedule Grid ---
      const grid = document.createElement('div');
      grid.classList.add('schedule-grid');

      if (schedules.length === 0) {
        grid.innerHTML = `<p style="text-align:center;">No schedules yet.</p>`;
      } else {
        schedules.forEach((s) => {
          const card = document.createElement('div');
          card.classList.add('schedule-card');
          const date = new Date(s.start_time);
          card.innerHTML = `
            <h3>${s.title}</h3>
            <p>${date.toLocaleString()}</p>
            ${s.description ? `<p>${s.description}</p>` : ''}
          `;
  // If schedule is completed, make it look faded and ticked
      if (s.completed) {
  card.classList.add('completed');
  card.title = '✅ This schedule is completed';
  card.style.pointerEvents = 'none';
  card.style.opacity = '0.7';
}


          grid.appendChild(card);
        });
      }

      // --- Combine elements ---
      wrapper.appendChild(backBtn);
      wrapper.appendChild(grid);

      // Clear and insert wrapper into textPage
      textPage.innerHTML = '';
      textPage.appendChild(wrapper);

      // --- Animate wrapper fade+zoom in ---
      setTimeout(() => {
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'scale(1)';
      }, 50);
    }, 400);
  } catch (err) {
    console.error('Error loading schedules:', err);
    alert('Could not load schedules. Check if your backend is running.');
  }
});

// === Task Overview Logic (similar to View Schedule) ===
const viewTasksBtn = document.getElementById('view-tasks-btn');
const confirmModal = document.getElementById('confirm-completion-modal');
const confirmBtn = document.getElementById('confirm-complete-btn');
const cancelBtn = document.getElementById('cancel-complete-btn');
let selectedCard = null;

viewTasksBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:5000/get_schedules');
    const schedules = await response.json();

    // Fade out mic view
    voiceBtnMain.style.transition = 'opacity 0.4s ease';
    transcriptElMain.style.transition = 'opacity 0.4s ease';
    voiceBtnMain.style.opacity = '0';
    transcriptElMain.style.opacity = '0';

    setTimeout(() => {
      voiceBtnMain.style.display = 'none';
      transcriptElMain.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.classList.add('schedule-grid');
      wrapper.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'scale(0.95)';

      // Back button
      const backBtn = document.createElement('button');
      backBtn.textContent = '⬅ Back';
      backBtn.className = 'same-style-btn';
      backBtn.style.marginBottom = '15px';
      backBtn.addEventListener('click', () => {
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'scale(0.95)';
        setTimeout(() => {
          textPage.innerHTML = '';
          voiceBtnMain.style.display = 'flex';
          transcriptElMain.style.display = 'block';
          setTimeout(() => {
            voiceBtnMain.style.opacity = '1';
            transcriptElMain.style.opacity = '1';
          }, 50);
        }, 400);
      });

      textPage.innerHTML = '';
      textPage.appendChild(backBtn);
      textPage.appendChild(wrapper);

      if (schedules.length === 0) {
        wrapper.innerHTML = `<p style="text-align:center;">No schedules yet.</p>`;
      } else {
        schedules.forEach(s => {
          const card = document.createElement('div');
          card.classList.add('schedule-card');
          const date = new Date(s.start_time);

          card.innerHTML = `
            <h3>${s.title}</h3>
            <p>${date.toLocaleString()}</p>
            ${s.description ? `<p>${s.description}</p>` : ''}
          `;

          // Add tick button
          const tickBtn = document.createElement('button');
          tickBtn.classList.add('tick-btn');
          tickBtn.textContent = '✔';
          card.appendChild(tickBtn);

          tickBtn.addEventListener('click', () => {
            selectedCard = card;
            confirmModal.style.display = 'flex';
          });

          wrapper.appendChild(card);
        });
      }

      setTimeout(() => {
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'scale(1)';
      }, 50);
    }, 400);
  } catch (err) {
    console.error('Error loading schedules:', err);
    alert('Could not load schedules for Task Overview.');
  }
});

// === Confirm Completion Modal Actions (Backend Synced) ===
confirmBtn.addEventListener('click', async () => {
  if (selectedCard) {
    const scheduleId = selectedCard.dataset.scheduleId; // set earlier when building cards
    if (!scheduleId) {
      console.error('No schedule ID found on card.');
      confirmModal.style.display = 'none';
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/mark_schedule_done/${scheduleId}`, {
        method: 'PUT'
      });

      if (res.ok) {
        selectedCard.classList.add('completed');
        selectedCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        selectedCard.style.transform = 'scale(0.9)';
        setTimeout(() => {
          selectedCard.style.display = 'none';
        }, 600);
      } else {
        const data = await res.json();
        alert('❌ Failed to mark as done: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error marking schedule done:', err);
      alert('⚠️ Error connecting to backend.');
    }
  }

  confirmModal.style.display = 'none';
  selectedCard = null;
});

cancelBtn.addEventListener('click', () => {
  confirmModal.style.display = 'none';
  selectedCard = null;
});



// Save schedule (improved + instant view)
saveScheduleBtn.addEventListener('click', async () => {
  const title = scheduleTitleInput.value.trim();
  const time = scheduleTimeInput.value.trim();
  const desc = scheduleDescInput.value.trim();

  if (!title || !time) {
    alert('Please enter a title and time.');
    return;
  }

const today = new Date();
const datePart = today.toISOString().split('T')[0];
const startDateTime = `${datePart}T${time}`;

  const payload = {
    title: title,
    description: desc,
    start_time: startDateTime,
    end_time: null
  };

  try {
    const res = await fetch('http://localhost:5000/add_schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Schedule saved successfully!');
      scheduleModal.style.display = 'none';
      scheduleTitleInput.value = '';
      scheduleTimeInput.value = '';
      scheduleDescInput.value = '';

      // Instantly show schedules grid with smooth fade
      await showSchedulesGrid();
    } else {
      alert('❌ ' + (data.error || 'Error saving schedule'));
    }
  } catch (err) {
    console.error('Error saving schedule:', err);
    alert('❌ Could not save schedule');
  }
});



/* --- Text input send button --- */
sendBtn.addEventListener('click', () => {
  const text = inputField.value.trim();
  if (text) {
    processVoiceInput(text);
    inputField.value = '';
  }
});

/* --- Login --- */
loginBtn.addEventListener('click', async () => {
  const username = prompt('Enter username:');
  const password = prompt('Enter password:');
  if (username && password) {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) alert('Login successful!');
      else alert(data.error);
    } catch (err) {
      console.error('Login error:', err);
    }
  }
});

async function showSchedulesGrid() {
  try {
    const response = await fetch('http://localhost:5000/get_schedules');
    const schedules = await response.json();

    const textPage = document.getElementById('textpage');
    const wrapper = document.createElement('div');
    wrapper.classList.add('schedule-grid');
    textPage.innerHTML = '';

    if (schedules.length === 0) {
      wrapper.innerHTML = `<p style="text-align:center;">No schedules yet.</p>`;
    } else {
      schedules.forEach((s) => {
        const card = document.createElement('div');
        card.classList.add('schedule-card');
        card.dataset.scheduleId = s.id;  // store schedule ID for backend sync
        const date = new Date(s.start_time);
          // Skip completed schedules so they don't appear in Task Overview
  if (s.completed) return;

        card.innerHTML = `
          <h3>${s.title}</h3>
          <p>${date.toLocaleString()}</p>
          ${s.description ? `<p>${s.description}</p>` : ''}
        `;
        wrapper.appendChild(card);
      });
    }

    textPage.appendChild(wrapper);
  } catch (err) {
    console.error('Error showing schedules grid:', err);
  }
}

/* --- Load data on page load --- */
window.addEventListener('load', () => {
  loadTasks();
  loadSchedules();
});
