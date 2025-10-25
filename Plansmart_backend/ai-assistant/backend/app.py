from flask import Flask, request, jsonify, session, render_template, send_from_directory
from flask_cors import CORS
from models import db, Task, Schedule, User
from scheduler import start_scheduler, schedule_reminder
import re, os
from datetime import datetime, timedelta

app = Flask(__name__,
    template_folder='templates',  # <-- tell Flask where your HTMLs are
    static_folder='static'        # <-- tell Flask where your CSS/JS are
)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ai_assistant.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    start_scheduler()

def parse_input(text):
    # Mock AI: simple keyword parsing
    tasks = []
    schedules = []
    reminders = []

    # Detect tasks: "create task to [description]"
    task_match = re.search(r'create task to (.+)', text, re.IGNORECASE)
    if task_match:
        tasks.append(task_match.group(1).strip())

    # Detect schedules: "schedule [title] at [time]"
    schedule_match = re.search(r'schedule (.+?) at (.+)', text, re.IGNORECASE)
    if schedule_match:
        title = schedule_match.group(1).strip()
        time_str = schedule_match.group(2).strip()
        # Simple time parsing, assume today
        try:
            start_time = datetime.strptime(time_str, '%H:%M')
            start_time = datetime.combine(datetime.today(), start_time.time())
            schedules.append({'title': title, 'start_time': start_time})
        except ValueError:
            pass

    # Detect reminders: "remind me to [description] in [minutes] minutes"
    reminder_match = re.search(r'remind me to (.+?) in (\d+) minutes', text, re.IGNORECASE)
    if reminder_match:
        desc = reminder_match.group(1).strip()
        mins = int(reminder_match.group(2))
        reminder_time = datetime.now() + timedelta(minutes=mins)
        reminders.append({'description': desc, 'time': reminder_time})

    return {'tasks': tasks, 'schedules': schedules, 'reminders': reminders}

@app.route('/process_input', methods=['POST'])
def process_input():
    data = request.json
    text = data.get('text', '')
    parsed = parse_input(text)

    # Save to DB
    for task_desc in parsed['tasks']:
        task = Task(description=task_desc)
        db.session.add(task)

    for sched in parsed['schedules']:
        schedule = Schedule(title=sched['title'], start_time=sched['start_time'])
        db.session.add(schedule)

    for rem in parsed['reminders']:
        task = Task(description=rem['description'], due_date=rem['time'])
        db.session.add(task)
        schedule_reminder(task.id, rem['description'], rem['time'])

    db.session.commit()
    return jsonify({'message': 'Processed', 'parsed': parsed})

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
