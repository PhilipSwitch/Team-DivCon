<<<<<<< HEAD
# from flask import Flask, request, jsonify, session
# from flask_cors import CORS
# from models import db, Task, Schedule, User
# from scheduler import start_scheduler, schedule_reminder
# from conversation_engine import get_ai_response, get_conversation_history, is_llm_enabled
# import re
# from datetime import datetime, timedelta
# import os
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# app = Flask(__name__)

# # Set secret key from environment or use a default for development
# app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# # Configure session
# app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
# app.config['SESSION_COOKIE_HTTPONLY'] = True
# app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# # CORS configuration for session handling
# CORS(app, 
#      supports_credentials=True,
#      origins=['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'],
#      allow_headers=['Content-Type', 'Authorization'],
#      methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ai_assistant.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)

# with app.app_context():
#     db.create_all()
#     start_scheduler()
#     # Print startup info
#     llm_status = "✅ LLM-Powered" if is_llm_enabled() else "📝 Rule-Based"
#     print(f"\n{'='*50}")
#     print(f"PLANSMART AI ASSISTANT")
#     print(f"Mode: {llm_status}")
#     print(f"{'='*50}\n")

# def parse_input(text):
#     # Mock AI: simple keyword parsing
#     tasks = []
#     schedules = []
#     reminders = []

#     # Detect tasks: "create task to [description]"
#     task_match = re.search(r'create task to (.+)', text, re.IGNORECASE)
#     if task_match:
#         tasks.append(task_match.group(1).strip())

#     # Detect schedules: "schedule [title] at [time]"
#     schedule_match = re.search(r'schedule (.+?) at (.+)', text, re.IGNORECASE)
#     if schedule_match:
#         title = schedule_match.group(1).strip()
#         time_str = schedule_match.group(2).strip()
#         # Simple time parsing, assume today
#         try:
#             start_time = datetime.strptime(time_str, '%H:%M')
#             start_time = datetime.combine(datetime.today(), start_time.time())
#             schedules.append({'title': title, 'start_time': start_time})
#         except ValueError:
#             pass

#     # Detect reminders: "remind me to [description] in [minutes] minutes"
#     reminder_match = re.search(r'remind me to (.+?) in (\d+) minutes', text, re.IGNORECASE)
#     if reminder_match:
#         desc = reminder_match.group(1).strip()
#         mins = int(reminder_match.group(2))
#         reminder_time = datetime.now() + timedelta(minutes=mins)
#         reminders.append({'description': desc, 'time': reminder_time})

#     return {'tasks': tasks, 'schedules': schedules, 'reminders': reminders}

# @app.route('/process_input', methods=['POST'])
# def process_input():
#     data = request.json
#     text = data.get('text', '')
#     user_id = session.get('user_id')
    
#     # Get AI response with suggestions
#     ai_response = get_ai_response(text, user_id)
    
#     # Parse input to extract and save tasks/schedules
#     parsed = parse_input(text)
#     created_reminder_tasks = []

#     # Save to DB
#     for task_desc in parsed['tasks']:
#         task = Task(description=task_desc, user_id=user_id)
#         db.session.add(task)

#     for sched in parsed['schedules']:
#         schedule = Schedule(title=sched['title'], start_time=sched['start_time'], user_id=user_id)
#         db.session.add(schedule)

#     for rem in parsed['reminders']:
#         task = Task(description=rem['description'], due_date=rem['time'], user_id=user_id)
#         db.session.add(task)
#         created_reminder_tasks.append((task, rem))

#     # Ensure IDs are assigned before scheduling
#     db.session.flush()

#     for task, rem in created_reminder_tasks:
#         schedule_reminder(task.id, rem['description'], rem['time'])

#     db.session.commit()
    
#     return jsonify({
#         'message': ai_response,
#         'parsed': parsed,
#         'ai_response': ai_response
#     })

# @app.route('/get_tasks', methods=['GET'])
# def get_tasks():
#     completed = request.args.get('completed')
#     user_id = session.get('user_id')
#     query = Task.query.filter_by(user_id=user_id)
#     if completed is not None:
#         val = str(completed).lower() in ('1', 'true', 'yes')
#         query = query.filter_by(completed=val)
#     tasks = query.all()
#     return jsonify([{
#         'id': t.id,
#         'description': t.description,
#         'due_date': t.due_date.isoformat() if t.due_date else None,
#         'completed': t.completed
#     } for t in tasks])

# @app.route('/mark_done/<int:task_id>', methods=['PUT'])
# def mark_done(task_id):
#     task = Task.query.get(task_id)
#     if task:
#         task.completed = True
#         db.session.commit()
#         return jsonify({'message': 'Task marked as done'})
#     return jsonify({'error': 'Task not found'}), 404

# @app.route('/get_schedules', methods=['GET'])
# def get_schedules():
#     user_id = session.get('user_id')
#     schedules = Schedule.query.filter_by(user_id=user_id).all()
#     return jsonify([{
#         'id': s.id,
#         'title': s.title,
#         'start_time': s.start_time.isoformat(),
#         'end_time': s.end_time.isoformat() if s.end_time else None,
#         'description': s.description
#     } for s in schedules])

# @app.route('/update_schedule/<int:schedule_id>', methods=['PUT'])
# def update_schedule(schedule_id):
#     data = request.json or {}
#     schedule = Schedule.query.get(schedule_id)
#     if not schedule:
#         return jsonify({'error': 'Schedule not found'}), 404
#     title = data.get('title')
#     start_time = data.get('start_time')
#     if title is not None:
#         schedule.title = title
#     if start_time is not None:
#         try:
#             # Expecting ISO string
#             schedule.start_time = datetime.fromisoformat(start_time)
#         except Exception:
#             return jsonify({'error': 'Invalid start_time format, expected ISO string'}), 400
#     db.session.commit()
#     return jsonify({'message': 'Schedule updated'})

# @app.route('/register', methods=['POST'])
# def register():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')
#     if not username or not password:
#         return jsonify({'error': 'Username and password required'}), 400
#     if User.query.filter_by(username=username).first():
#         return jsonify({'error': 'User already exists'}), 400
#     user = User(username=username)
#     user.set_password(password)
#     db.session.add(user)
#     db.session.commit()
#     return jsonify({'message': 'User registered successfully'})

# @app.route('/signup', methods=['POST'])
# def signup():
#     """Create a new user account"""
#     data = request.json
#     username = data.get('username', '').strip()
#     password = data.get('password', '')
    
#     # Validation
#     if not username or not password:
#         return jsonify({'message': 'Username and password required'}), 400
    
#     if len(username) < 3:
#         return jsonify({'message': 'Username must be at least 3 characters long'}), 400
    
#     if len(password) < 6:
#         return jsonify({'message': 'Password must be at least 6 characters long'}), 400
    
#     # Check if user exists
#     if User.query.filter_by(username=username).first():
#         return jsonify({'message': 'Username already exists'}), 400
    
#     # Create user
#     user = User(username=username)
#     user.set_password(password)
#     db.session.add(user)
#     db.session.commit()
    
#     # Set session
#     session['user_id'] = user.id
#     session['username'] = username
    
#     return jsonify({'message': 'Account created successfully', 'user_id': user.id}), 201

# @app.route('/login', methods=['POST'])
# def login():
#     """User login"""
#     data = request.json
#     username = data.get('username', '').strip()
#     password = data.get('password', '')
    
#     if not username or not password:
#         return jsonify({'message': 'Username and password required'}), 400
    
#     user = User.query.filter_by(username=username).first()
#     if user and user.check_password(password):
#         session['user_id'] = user.id
#         session['username'] = username
#         return jsonify({'message': 'Login successful', 'user_id': user.id}), 200
    
#     return jsonify({'message': 'Invalid username or password'}), 401

# @app.route('/guest', methods=['POST'])
# def guest():
#     """Create a guest session"""
#     # Create a guest user or use None for guest
#     session['user_id'] = None
#     session['is_guest'] = True
#     return jsonify({'message': 'Guest session started'}), 200

# @app.route('/check_auth', methods=['GET'])
# def check_auth():
#     """Check if user is authenticated"""
#     user_id = session.get('user_id')
#     username = session.get('username')
#     is_guest = session.get('is_guest', False)
    
#     if user_id or is_guest:
#         return jsonify({
#             'authenticated': True,
#             'user_id': user_id,
#             'username': username,
#             'is_guest': is_guest
#         }), 200
    
#     return jsonify({'authenticated': False}), 401

# @app.route('/logout', methods=['POST'])
# def logout():
#     """User logout"""
#     session.pop('user_id', None)
#     session.pop('username', None)
#     session.pop('is_guest', None)
#     return jsonify({'message': 'Logged out'}), 200

# @app.route('/get_suggestion', methods=['GET'])
# def get_suggestion():
#     """Get AI suggestion based on user's current state"""
#     user_id = session.get('user_id')
#     # Use a generic greeting/suggestion prompt
#     suggestion = get_ai_response("What should I do?", user_id)
#     return jsonify({'suggestion': suggestion})

# @app.route('/chat', methods=['POST'])
# def chat():
#     """Chat endpoint for conversational interaction"""
#     data = request.json
#     user_message = data.get('message', '')
#     user_id = session.get('user_id')
    
#     if not user_message:
#         return jsonify({'error': 'Message required'}), 400
    
#     # Get AI response
#     ai_response = get_ai_response(user_message, user_id)
    
#     return jsonify({
#         'user_message': user_message,
#         'ai_response': ai_response,
#         'timestamp': datetime.now().isoformat()
#     })

# @app.route('/get_conversation_history', methods=['GET'])
# def get_conv_history():
#     """Get conversation history"""
#     history = get_conversation_history()
#     return jsonify({'history': history})

# @app.route('/status', methods=['GET'])
# def status():
#     """Get API status and configuration"""
#     return jsonify({
#         'status': 'running',
#         'llm_enabled': is_llm_enabled(),
#         'mode': 'LLM-Powered' if is_llm_enabled() else 'Rule-Based',
#         'version': '1.1.0',
#         'features': [
#             'Speech Recognition',
#             'Text-to-Speech',
#             'Task Management',
#             'Schedule Management',
#             'AI Conversations',
#             'Smart Suggestions'
#         ]
#     })

# if __name__ == '__main__':
#     app.run(debug=True)






from flask import Flask, request, jsonify, session, render_template, send_from_directory

from flask_cors import CORS

from models import db, Task, Schedule, User, Request, Response

from scheduler import start_scheduler, schedule_reminder

import re, os

from datetime import datetime, timedelta

import openai

import os

import ollama

 

app = Flask(__name__,

    template_folder='templates',  # <-- tell Flask where your HTMLs are

    static_folder='static'        # <-- tell Flask where your CSS/JS are

)

CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ai_assistant.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

 

# Set OpenAI API key

openai.api_key = os.getenv('OPENAI_API_KEY')

 

with app.app_context():

    db.create_all()

    start_scheduler()

 

def parse_input_with_ollama(text, user_id=None):

    # Get recent conversation history (last 10 requests and responses for better context)

    history = []

    if user_id:

        recent_requests = Request.query.filter_by(user_id=user_id).order_by(Request.created_at.desc()).limit(10).all()

        for req in reversed(recent_requests[:-1]):  # Exclude current

            responses = Response.query.filter_by(request_id=req.id).all()

            response_text = responses[0].text if responses else "No response"

            history.append({"role": "user", "content": req.text})

            history.append({"role": "assistant", "content": response_text})

 

    # Get user data for personalization

    user_tasks = []

    user_schedules = []

    if user_id:

        user_tasks = Task.query.filter_by(user_id=user_id).order_by(Task.created_at.desc()).limit(5).all()

        user_schedules = Schedule.query.filter_by(user_id=user_id).order_by(Schedule.created_at.desc()).limit(5).all()

 

    tasks_str = "\n".join([f"- {t.description} (Due: {t.due_date.isoformat() if t.due_date else 'No due date'}, Completed: {t.completed})" for t in user_tasks])

    schedules_str = "\n".join([f"- {s.title} at {s.start_time.isoformat()}" for s in user_schedules])

 

    prompt = f"""

You are an advanced interactive AI assistant for a personal assistant app. You can create tasks, schedules, reminders, answer questions, and engage in natural conversation. Use the user's recent tasks and schedules to provide personalized suggestions and context.

 

User's recent tasks:

{tasks_str}

 

User's recent schedules:

{schedules_str}

 

User input: "{text}"

 

First, extract any actions if present:

- Tasks: List of task descriptions to create (be specific and actionable).

- Schedules: List of schedules with title and start_time (in ISO format, assume today if no date, infer reasonable times).

- Update Schedules: List of schedules to update with title and new_start_time.

- Reminders: List of reminders with description and time (in ISO format).

- Query: If querying tasks, set completed to true or false, or specify filters like "today's tasks".

- Clarification: If input is unclear, set to true and ask for more details.

 

Return a JSON object with keys: tasks, schedules, update_schedules, reminders, query, clarification.

 

Then, generate a conversational response that confirms actions, provides context from user data, engages the user, and asks follow-up questions if needed.

 

Example JSON:

{{

  "tasks": ["Finish the quarterly report by end of day"],

  "schedules": [{{"title": "Team Meeting", "start_time": "2023-10-01T14:00:00"}}],

  "update_schedules": [],

  "reminders": [{{"description": "Call dentist", "time": "2023-10-02T09:00:00"}}],

  "query": {{"completed": false, "filter": "today"}},

  "clarification": false,

  "response": "I've added 'Finish the quarterly report' to your tasks, noting you have a meeting at 2 PM. Do you need help with anything else today?"

}}

 

Handle multi-step requests, natural language, and provide helpful, personalized responses.

"""

    messages = history + [{"role": "user", "content": prompt}]

    try:

        response = ollama.chat(

            model='llama2',  # Assuming llama2 is available; can be changed to other models like mistral

            messages=messages,

            options={'temperature': 0.7, 'num_predict': 500}

        )

        result = response['message']['content'].strip()

        import json

        parsed = json.loads(result)

        return parsed

    except Exception as e:

        print(f"Ollama error: {e}")

        # Improved fallback

        return parse_input_improved(text)

 

def parse_input_improved(text):

    # Improved fallback parsing with better regex and natural language handling

    tasks = []

    schedules = []

    update_schedules = []

    reminders = []

    query = {}

    clarification = False

 

    # Detect tasks: various patterns

    task_patterns = [

        r'(?:create|add|make) (?:a |an )?task(?: to)? (.+)',

        r'(?:i need to|i have to|i should) (.+)',

        r'(?:remind me|note) (.+)'

    ]

    for pattern in task_patterns:

        match = re.search(pattern, text, re.IGNORECASE)

        if match:

            tasks.append(match.group(1).strip())

            break

 

    # Detect schedules: various patterns

    schedule_patterns = [

        r'(?:schedule|set up|plan) (.+?) (?:at|for) (.+)',

        r'(?:meeting|appointment) (.+?) (?:at|on) (.+)'

    ]

    for pattern in schedule_patterns:

        match = re.search(pattern, text, re.IGNORECASE)

        if match:

            title = match.group(1).strip()

            time_str = match.group(2).strip()

            # Improved time parsing

            try:

                # Try HH:MM format

                start_time = datetime.strptime(time_str, '%H:%M')

                start_time = datetime.combine(datetime.today(), start_time.time())

                schedules.append({'title': title, 'start_time': start_time.isoformat()})

            except ValueError:

                try:

                    # Try "at 3pm" or similar

                    time_match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)', time_str, re.IGNORECASE)

                    if time_match:

                        hour = int(time_match.group(1))

                        minute = int(time_match.group(2)) if time_match.group(2) else 0

                        ampm = time_match.group(3).lower()

                        if ampm == 'pm' and hour != 12:

                            hour += 12

                        elif ampm == 'am' and hour == 12:

                            hour = 0

                        start_time = datetime.combine(datetime.today(), datetime.min.time().replace(hour=hour, minute=minute))

                        schedules.append({'title': title, 'start_time': start_time.isoformat()})

                    else:

                        clarification = True

                except:

                    clarification = True

            break

 

    # Detect update schedules

    update_match = re.search(r'(?:update|change|reschedule) (.+?) (?:to|at) (.+)', text, re.IGNORECASE)

    if update_match:

        title = update_match.group(1).strip()

        new_time_str = update_match.group(2).strip()

        # Similar parsing as above

        try:

            start_time = datetime.strptime(new_time_str, '%H:%M')

            start_time = datetime.combine(datetime.today(), start_time.time())

            update_schedules.append({'title': title, 'new_start_time': start_time.isoformat()})

        except ValueError:

            clarification = True

 

    # Detect reminders

    reminder_match = re.search(r'(?:remind me|set a reminder) (?:to )?(.+?) (?:in|at) (.+)', text, re.IGNORECASE)

    if reminder_match:

        desc = reminder_match.group(1).strip()

        time_part = reminder_match.group(2).strip()

        # Parse time

        mins_match = re.search(r'(\d+) minutes?', time_part, re.IGNORECASE)

        if mins_match:

            mins = int(mins_match.group(1))

            reminder_time = datetime.now() + timedelta(minutes=mins)

            reminders.append({'description': desc, 'time': reminder_time.isoformat()})

        else:

            clarification = True

 

    # Detect queries

    if re.search(r'(?:show|list|get) (?:done|completed) tasks?', text, re.IGNORECASE):

        query['completed'] = True

    elif re.search(r'(?:show|list|get) (?:undone|incomplete|pending) tasks?', text, re.IGNORECASE):

        query['completed'] = False

    elif re.search(r'(?:what|show) (?:do i have|are my) tasks?', text, re.IGNORECASE):

        query['completed'] = False

 

    response = "I'm not sure what you mean. Could you clarify?"

    if tasks or schedules or reminders:

        response = "Got it! I've processed your request."

    elif query:

        response = "Here are your tasks."

 

    return {'tasks': tasks, 'schedules': schedules, 'update_schedules': update_schedules, 'reminders': reminders, 'query': query, 'clarification': clarification, 'response': response}

 

@app.route('/process_input', methods=['POST'])

def process_input():

    data = request.json

    text = data.get('text', '')

    # Save the raw input as a request

    user_id = session.get('user_id')

    req = Request(text=text, user_id=user_id)

    db.session.add(req)

    db.session.commit()

    parsed = parse_input_with_ollama(text, user_id)

 

    # Save to DB

    for task_desc in parsed.get('tasks', []):

        task = Task(description=task_desc)

        db.session.add(task)

 

    for sched in parsed.get('schedules', []):

        start_time = datetime.fromisoformat(sched['start_time'])

        schedule = Schedule(title=sched['title'], start_time=start_time)

        db.session.add(schedule)

 

    for update_sched in parsed.get('update_schedules', []):

        schedule = Schedule.query.filter_by(title=update_sched['title']).first()

        if schedule:

            new_start_time = datetime.fromisoformat(update_sched['new_start_time'])

            schedule.start_time = new_start_time

            db.session.commit()

 

    for rem in parsed.get('reminders', []):

        time = datetime.fromisoformat(rem['time'])

        task = Task(description=rem['description'], due_date=time)

        db.session.add(task)

        schedule_reminder(task.id, rem['description'], time)

 

    db.session.commit()

 

    # Use AI response from parsed if available, else generate

    response_message = parsed.get('response', generate_ai_response(text, parsed))

 

    # Save the AI response to the database

    ai_response = Response(text=response_message, request_id=req.id)

    db.session.add(ai_response)

    db.session.commit()

 

    return jsonify({'message': response_message, 'parsed': parsed})

 

def generate_ai_response(user_input, parsed):

    prompt = f"""

You are a helpful AI assistant. The user said: "{user_input}"

 

Based on the parsed data: {parsed}

 

Generate a friendly, conversational response as if you're talking to the user while performing the task. For example, "Alright, I'm adding that task for you. Done! Task 'Finish report' has been created. Is there anything else on your mind today?"

 

Keep it natural, engaging, and end with a question to continue the conversation.

"""

    try:

        response = ollama.chat(

            model='llama2',

            messages=[{"role": "user", "content": prompt}],

            options={'temperature': 0.7, 'num_predict': 150}

        )

        return response['message']['content'].strip()

    except Exception as e:

        print(f"Ollama response error: {e}")

        return "Processed your request successfully. What do you have to do today?"

 

@app.route('/get_tasks', methods=['GET'])

def get_tasks():

    completed_filter = request.args.get('completed')

    if completed_filter is not None:

        completed = completed_filter.lower() == 'true'

        tasks = Task.query.filter_by(completed=completed).all()

    else:

        tasks = Task.query.all()

    return jsonify([{

        'id': t.id,

        'description': t.description,

        'due_date': t.due_date.isoformat() if t.due_date else None,

        'completed': t.completed

    } for t in tasks])

 

@app.route('/mark_done/<int:task_id>', methods=['PUT'])

def mark_done(task_id):

    task = Task.query.get(task_id)

    if task:

        task.completed = True

        db.session.commit()

        return jsonify({'message': 'Task marked as done'})

    return jsonify({'error': 'Task not found'}), 404

 

@app.route('/mark_schedule_done/<int:schedule_id>', methods=['PUT'])

def mark_schedule_done(schedule_id):

    schedule = Schedule.query.get(schedule_id)

    if not schedule:

        return jsonify({'error': 'Schedule not found'}), 404

 

    # Mark schedule as completed

    schedule.completed = True

 

    # Optionally mark related tasks as done

    related_tasks = Task.query.filter(Task.description.ilike(f"%{schedule.title}%")).all()

    for t in related_tasks:

        t.completed = True

 

    try:

        db.session.commit()

        return jsonify({'message': f'Schedule \"{schedule.title}\" marked as completed.'})

    except Exception as e:

        print("Error updating schedule:", e)

        return jsonify({'error': 'Could not update schedule'}), 500




@app.route('/get_schedules', methods=['GET'])

def get_schedules():

    try:

        schedules = Schedule.query.all()

        return jsonify([

            {

                'id': s.id,

                'title': s.title,

                'start_time': s.start_time.isoformat(),

                'end_time': s.end_time.isoformat() if s.end_time else None,

                'description': s.description,

                'completed': s.completed

            }

            for s in schedules

        ])

    except Exception as e:

        import traceback

        print("Error fetching schedules:", e)

        traceback.print_exc()

        return jsonify({'error': 'Could not fetch schedules'}), 500




@app.route('/get_conversation_history', methods=['GET'])

def get_conversation_history():

    user_id = session.get('user_id')

    if not user_id:

        return jsonify({'error': 'User not logged in'}), 401

 

    # Get recent requests and their responses

    recent_requests = Request.query.filter_by(user_id=user_id).order_by(Request.created_at.desc()).limit(10).all()

    history = []

    for req in reversed(recent_requests):

        responses = Response.query.filter_by(request_id=req.id).all()

        response_text = responses[0].text if responses else "No response"

        history.append({

            'request': req.text,

            'response': response_text,

            'timestamp': req.created_at.isoformat()

        })

    return jsonify(history)

 

@app.route('/update_schedule/<int:schedule_id>', methods=['PUT'])

def update_schedule(schedule_id):

    data = request.json

    schedule = Schedule.query.get(schedule_id)

    if not schedule:

        return jsonify({'error': 'Schedule not found'}), 404

 

    schedule.title = data.get('title', schedule.title)

    new_time = data.get('start_time')

    if new_time:

        schedule.start_time = datetime.fromisoformat(new_time)

 

    db.session.commit()

    return jsonify({'message': 'Schedule updated'})

 

@app.route('/register', methods=['POST'])

def register():

    data = request.json

    username = data.get('username')

    password = data.get('password')

    if not username or not password:

        return jsonify({'error': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():

        return jsonify({'error': 'User already exists'}), 400

    user = User(username=username)

    user.set_password(password)

    db.session.add(user)

    db.session.commit()

    return jsonify({'message': 'User registered successfully'})

 

@app.route('/login', methods=['POST'])

def login():

    data = request.json

    username = data.get('username')

    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):

        session['user_id'] = user.id

        return jsonify({'message': 'Login successful', 'user_id': user.id})

    return jsonify({'error': 'Invalid credentials'}), 401

 

@app.route('/logout', methods=['POST'])

def logout():

    session.pop('user_id', None)

    return jsonify({'message': 'Logged out'})




@app.route('/')

def home():

    return render_template('index.html')

 

@app.route('/<path:filename>')

def serve_static_files(filename):

    static_dir = os.path.join(app.root_path, 'static')

    return send_from_directory(static_dir, filename)

 

@app.route('/add_schedule', methods=['POST'])

def add_schedule():

    try:

        data = request.get_json()

        title = data.get('title')

        description = data.get('description')

        start_time = data.get('start_time')

        end_time = data.get('end_time')

 

        if not title or not start_time:

            return jsonify({'error': 'Missing title or start time'}), 400

 

        new_schedule = Schedule(

            title=title,

            description=description,

            start_time=datetime.fromisoformat(start_time),

            end_time=datetime.fromisoformat(end_time) if end_time else None,

            completed=False

        )

 

        db.session.add(new_schedule)

        db.session.commit()

        return jsonify({'message': 'Schedule added successfully!'})

 

    except Exception as e:

        import traceback

        print("Error saving schedule:", e)

        traceback.print_exc()  # print full error

        return jsonify({'error': 'Could not save schedule'}), 500

 

@app.route('/add_task', methods=['POST'])

def add_task():

    try:

        data = request.get_json()

        title = data.get('title')

        schedule_title = data.get('schedule')

        due_date = data.get('due_date')

 

        if not title or not schedule_title:

            return jsonify({'error': 'Missing task title or schedule'}), 400

 

        # Convert due date string to datetime if provided

        due = None

        if due_date:

            try:

                due = datetime.fromisoformat(due_date)

            except Exception:

                print("Invalid due date format received:", due_date)

 

        new_task = Task(

            description=f"{title} (Schedule: {schedule_title})",

            due_date=due,

            completed=False

        )

        db.session.add(new_task)

        db.session.commit()

        print(f"✅ Task added: {new_task.description}, due: {new_task.due_date}")

 

        return jsonify({'message': 'Task added successfully!'})

 

    except Exception as e:

        import traceback

        print("Error adding task:", e)

        traceback.print_exc()

        return jsonify({'error': 'Could not add task'}), 500




if __name__ == '__main__':

    app.run(debug=True)

 

 

=======
from flask import Flask, request, jsonify, session, render_template, send_from_directory
from flask_cors import CORS
from models import db, Task, Schedule, User, Request, Response
from scheduler import start_scheduler, schedule_reminder
import re, os
from datetime import datetime, timedelta
import openai
import os
import ollama

app = Flask(__name__,
    template_folder='templates',  # <-- tell Flask where your HTMLs are
    static_folder='static'        # <-- tell Flask where your CSS/JS are
)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ai_assistant.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

with app.app_context():
    db.create_all()
    start_scheduler()

def parse_input_with_ollama(text, user_id=None):
    # Get recent conversation history (last 10 requests and responses for better context)
    history = []
    if user_id:
        recent_requests = Request.query.filter_by(user_id=user_id).order_by(Request.created_at.desc()).limit(10).all()
        for req in reversed(recent_requests[:-1]):  # Exclude current
            responses = Response.query.filter_by(request_id=req.id).all()
            response_text = responses[0].text if responses else "No response"
            history.append({"role": "user", "content": req.text})
            history.append({"role": "assistant", "content": response_text})

    # Get user data for personalization
    user_tasks = []
    user_schedules = []
    if user_id:
        user_tasks = Task.query.filter_by(user_id=user_id).order_by(Task.created_at.desc()).limit(5).all()
        user_schedules = Schedule.query.filter_by(user_id=user_id).order_by(Schedule.created_at.desc()).limit(5).all()

    tasks_str = "\n".join([f"- {t.description} (Due: {t.due_date.isoformat() if t.due_date else 'No due date'}, Completed: {t.completed})" for t in user_tasks])
    schedules_str = "\n".join([f"- {s.title} at {s.start_time.isoformat()}" for s in user_schedules])

    prompt = f"""
You are an advanced interactive AI assistant for a personal assistant app. You can create tasks, schedules, reminders, answer questions, and engage in natural conversation. Use the user's recent tasks and schedules to provide personalized suggestions and context.

User's recent tasks:
{tasks_str}

User's recent schedules:
{schedules_str}

User input: "{text}"

First, extract any actions if present:
- Tasks: List of task descriptions to create (be specific and actionable).
- Schedules: List of schedules with title and start_time (in ISO format, assume today if no date, infer reasonable times).
- Update Schedules: List of schedules to update with title and new_start_time.
- Reminders: List of reminders with description and time (in ISO format).
- Query: If querying tasks, set completed to true or false, or specify filters like "today's tasks".
- Clarification: If input is unclear, set to true and ask for more details.

Return a JSON object with keys: tasks, schedules, update_schedules, reminders, query, clarification.

Then, generate a conversational response that confirms actions, provides context from user data, engages the user, and asks follow-up questions if needed.

Example JSON:
{{
  "tasks": ["Finish the quarterly report by end of day"],
  "schedules": [{{"title": "Team Meeting", "start_time": "2023-10-01T14:00:00"}}],
  "update_schedules": [],
  "reminders": [{{"description": "Call dentist", "time": "2023-10-02T09:00:00"}}],
  "query": {{"completed": false, "filter": "today"}},
  "clarification": false,
  "response": "I've added 'Finish the quarterly report' to your tasks, noting you have a meeting at 2 PM. Do you need help with anything else today?"
}}

Handle multi-step requests, natural language, and provide helpful, personalized responses.
"""
    messages = history + [{"role": "user", "content": prompt}]
    try:
        response = ollama.chat(
            model='llama2',  # Assuming llama2 is available; can be changed to other models like mistral
            messages=messages,
            options={'temperature': 0.7, 'num_predict': 500}
        )
        result = response['message']['content'].strip()
        import json
        parsed = json.loads(result)
        return parsed
    except Exception as e:
        print(f"Ollama error: {e}")
        # Improved fallback
        return parse_input_improved(text)

def parse_input_improved(text):
    # Improved fallback parsing with better regex and natural language handling
    tasks = []
    schedules = []
    update_schedules = []
    reminders = []
    query = {}
    clarification = False

    # Detect tasks: various patterns
    task_patterns = [
        r'(?:create|add|make) (?:a |an )?task(?: to)? (.+)',
        r'(?:i need to|i have to|i should) (.+)',
        r'(?:remind me|note) (.+)'
    ]
    for pattern in task_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            tasks.append(match.group(1).strip())
            break

    # Detect schedules: various patterns
    schedule_patterns = [
        r'(?:schedule|set up|plan) (.+?) (?:at|for) (.+)',
        r'(?:meeting|appointment) (.+?) (?:at|on) (.+)'
    ]
    for pattern in schedule_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            title = match.group(1).strip()
            time_str = match.group(2).strip()
            # Improved time parsing
            try:
                # Try HH:MM format
                start_time = datetime.strptime(time_str, '%H:%M')
                start_time = datetime.combine(datetime.today(), start_time.time())
                schedules.append({'title': title, 'start_time': start_time.isoformat()})
            except ValueError:
                try:
                    # Try "at 3pm" or similar
                    time_match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)', time_str, re.IGNORECASE)
                    if time_match:
                        hour = int(time_match.group(1))
                        minute = int(time_match.group(2)) if time_match.group(2) else 0
                        ampm = time_match.group(3).lower()
                        if ampm == 'pm' and hour != 12:
                            hour += 12
                        elif ampm == 'am' and hour == 12:
                            hour = 0
                        start_time = datetime.combine(datetime.today(), datetime.min.time().replace(hour=hour, minute=minute))
                        schedules.append({'title': title, 'start_time': start_time.isoformat()})
                    else:
                        clarification = True
                except:
                    clarification = True
            break

    # Detect update schedules
    update_match = re.search(r'(?:update|change|reschedule) (.+?) (?:to|at) (.+)', text, re.IGNORECASE)
    if update_match:
        title = update_match.group(1).strip()
        new_time_str = update_match.group(2).strip()
        # Similar parsing as above
        try:
            start_time = datetime.strptime(new_time_str, '%H:%M')
            start_time = datetime.combine(datetime.today(), start_time.time())
            update_schedules.append({'title': title, 'new_start_time': start_time.isoformat()})
        except ValueError:
            clarification = True

    # Detect reminders
    reminder_match = re.search(r'(?:remind me|set a reminder) (?:to )?(.+?) (?:in|at) (.+)', text, re.IGNORECASE)
    if reminder_match:
        desc = reminder_match.group(1).strip()
        time_part = reminder_match.group(2).strip()
        # Parse time
        mins_match = re.search(r'(\d+) minutes?', time_part, re.IGNORECASE)
        if mins_match:
            mins = int(mins_match.group(1))
            reminder_time = datetime.now() + timedelta(minutes=mins)
            reminders.append({'description': desc, 'time': reminder_time.isoformat()})
        else:
            clarification = True

    # Detect queries
    if re.search(r'(?:show|list|get) (?:done|completed) tasks?', text, re.IGNORECASE):
        query['completed'] = True
    elif re.search(r'(?:show|list|get) (?:undone|incomplete|pending) tasks?', text, re.IGNORECASE):
        query['completed'] = False
    elif re.search(r'(?:what|show) (?:do i have|are my) tasks?', text, re.IGNORECASE):
        query['completed'] = False

    response = "I'm not sure what you mean. Could you clarify?"
    if tasks or schedules or reminders:
        response = "Got it! I've processed your request."
    elif query:
        response = "Here are your tasks."

    return {'tasks': tasks, 'schedules': schedules, 'update_schedules': update_schedules, 'reminders': reminders, 'query': query, 'clarification': clarification, 'response': response}

@app.route('/process_input', methods=['POST'])
def process_input():
    data = request.json
    text = data.get('text', '')
    # Save the raw input as a request
    user_id = session.get('user_id')
    req = Request(text=text, user_id=user_id)
    db.session.add(req)
    db.session.commit()
    parsed = parse_input_with_ollama(text, user_id)

    # Save to DB
    for task_desc in parsed.get('tasks', []):
        task = Task(description=task_desc)
        db.session.add(task)

    for sched in parsed.get('schedules', []):
        start_time = datetime.fromisoformat(sched['start_time'])
        schedule = Schedule(title=sched['title'], start_time=start_time)
        db.session.add(schedule)

    for update_sched in parsed.get('update_schedules', []):
        schedule = Schedule.query.filter_by(title=update_sched['title']).first()
        if schedule:
            new_start_time = datetime.fromisoformat(update_sched['new_start_time'])
            schedule.start_time = new_start_time
            db.session.commit()

    for rem in parsed.get('reminders', []):
        time = datetime.fromisoformat(rem['time'])
        task = Task(description=rem['description'], due_date=time)
        db.session.add(task)
        schedule_reminder(task.id, rem['description'], time)

    db.session.commit()

    # Use AI response from parsed if available, else generate
    response_message = parsed.get('response', generate_ai_response(text, parsed))

    # Save the AI response to the database
    ai_response = Response(text=response_message, request_id=req.id)
    db.session.add(ai_response)
    db.session.commit()

    return jsonify({'message': response_message, 'parsed': parsed})

def generate_ai_response(user_input, parsed):
    prompt = f"""
You are a helpful AI assistant. The user said: "{user_input}"

Based on the parsed data: {parsed}

Generate a friendly, conversational response as if you're talking to the user while performing the task. For example, "Alright, I'm adding that task for you. Done! Task 'Finish report' has been created. Is there anything else on your mind today?"

Keep it natural, engaging, and end with a question to continue the conversation.
"""
    try:
        response = ollama.chat(
            model='llama2',
            messages=[{"role": "user", "content": prompt}],
            options={'temperature': 0.7, 'num_predict': 150}
        )
        return response['message']['content'].strip()
    except Exception as e:
        print(f"Ollama response error: {e}")
        return "Processed your request successfully. What do you have to do today?"

# @app.route('/add_schedule', methods=['POST'])
# def add_schedule():
#     data = request.get_json()
#     title = data.get('title')
#     description = data.get('description')
#     start_time = data.get('start_time')
#     end_time = data.get('end_time')

#     if not title or not start_time:
#         return jsonify({'error': 'Missing title or start time'}), 400

#     try:
#         new_schedule = Schedule(
#             title=title,
#             description=description,
#             start_time=datetime.fromisoformat(start_time),
#             end_time=datetime.fromisoformat(end_time) if end_time else None
#         )
#         db.session.add(new_schedule)
#         db.session.commit()
#         return jsonify({'message': 'Schedule added successfully!'})
#     except Exception as e:
#         print("Error saving schedule:", e)
#         return jsonify({'error': 'Could not save schedule'}), 500


@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    completed_filter = request.args.get('completed')
    if completed_filter is not None:
        completed = completed_filter.lower() == 'true'
        tasks = Task.query.filter_by(completed=completed).all()
    else:
        tasks = Task.query.all()
    return jsonify([{
        'id': t.id,
        'description': t.description,
        'due_date': t.due_date.isoformat() if t.due_date else None,
        'completed': t.completed
    } for t in tasks])

@app.route('/mark_done/<int:task_id>', methods=['PUT'])
def mark_done(task_id):
    task = Task.query.get(task_id)
    if task:
        task.completed = True
        db.session.commit()
        return jsonify({'message': 'Task marked as done'})
    return jsonify({'error': 'Task not found'}), 404

@app.route('/get_schedules', methods=['GET'])
def get_schedules():
    schedules = Schedule.query.all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'start_time': s.start_time.isoformat(),
        'end_time': s.end_time.isoformat() if s.end_time else None,
        'description': s.description
    } for s in schedules])

@app.route('/get_conversation_history', methods=['GET'])
def get_conversation_history():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401

    # Get recent requests and their responses
    recent_requests = Request.query.filter_by(user_id=user_id).order_by(Request.created_at.desc()).limit(10).all()
    history = []
    for req in reversed(recent_requests):
        responses = Response.query.filter_by(request_id=req.id).all()
        response_text = responses[0].text if responses else "No response"
        history.append({
            'request': req.text,
            'response': response_text,
            'timestamp': req.created_at.isoformat()
        })
    return jsonify(history)

@app.route('/update_schedule/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    data = request.json
    schedule = Schedule.query.get(schedule_id)
    if schedule:
        schedule.title = data.get('title', schedule.title)
        schedule.start_time = datetime.fromisoformat(data.get('start_time', schedule.start_time.isoformat()))
        db.session.commit()
        return jsonify({'message': 'Schedule updated'})
    return jsonify({'error': 'Schedule not found'}), 404

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'User already exists'}), 400
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful', 'user_id': user.id})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

@app.route('/update_schedule/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    data = request.json
    new_time = data.get('start_time')
    schedule = Schedule.query.get(schedule_id)
    if schedule and new_time:
        schedule.start_time = datetime.fromisoformat(new_time)
        db.session.commit()
        return jsonify({'message': 'Schedule updated'})
    return jsonify({'error': 'Invalid schedule or time'}), 400

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    static_dir = os.path.join(app.root_path, 'static')
    return send_from_directory(static_dir, filename)

@app.route('/add_schedule', methods=['POST'])
def add_schedule():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    start_time = data.get('start_time')
    end_time = data.get('end_time')

    if not title or not start_time:
        return jsonify({'error': 'Missing title or start time'}), 400

    try:
        new_schedule = Schedule(
            title=title,
            description=description,
            start_time=datetime.fromisoformat(start_time),
            end_time=datetime.fromisoformat(end_time) if end_time else None
        )
        db.session.add(new_schedule)
        db.session.commit()
        return jsonify({'message': 'Schedule added successfully!'})
    except Exception as e:
        print("Error saving schedule:", e)
        return jsonify({'error': 'Could not save schedule'}), 500



if __name__ == '__main__':
    app.run(debug=True)
>>>>>>> 59bb2c1d88c8d1282a6ea935485986ff7bd3de97
