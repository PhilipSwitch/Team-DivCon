"""
Demo Data Seeding Script
This script creates a demo user account with sample tasks and schedules for testing the AI assistant.
"""

from app import app, db
from models import User, Task, Schedule
from datetime import datetime, timedelta

def seed_demo_data():
    """Create demo user with tasks and schedules"""
    
    with app.app_context():
        # Check if demo user already exists
        demo_user = User.query.filter_by(username='Moyo').first()
        
        if demo_user:
            print("❌ Demo user already exists. Deleting old data...")
            # Delete existing tasks and schedules for demo user
            Task.query.filter_by(user_id=demo_user.id).delete()
            Schedule.query.filter_by(user_id=demo_user.id).delete()
            db.session.commit()
            user = demo_user
        else:
            print("✅ Creating demo user...")
            user = User(username='Moyo')
            user.set_password('Demo@123')
            db.session.add(user)
            db.session.commit()
        
        print(f"✅ Demo user ID: {user.id}")
        
        # Create sample tasks
        tasks_data = [
            {
                'description': 'Complete project report',
                'due_date': datetime.now() + timedelta(days=1),
                'completed': False
            },
            {
                'description': 'Review code pull requests',
                'due_date': datetime.now() + timedelta(hours=2),
                'completed': False
            },
            {
                'description': 'Prepare presentation for team meeting',
                'due_date': datetime.now() + timedelta(days=2),
                'completed': False
            },
            {
                'description': 'Update documentation',
                'due_date': datetime.now() + timedelta(days=3),
                'completed': False
            },
            {
                'description': 'Schedule 1-on-1 with manager',
                'due_date': datetime.now() + timedelta(hours=5),
                'completed': False
            },
            {
                'description': 'Fix bug in authentication module',
                'due_date': datetime.now() + timedelta(hours=3),
                'completed': False
            },
            {
                'description': 'Send weekly status update',
                'due_date': datetime.now() + timedelta(days=1),
                'completed': True
            },
            {
                'description': 'Research new AI frameworks',
                'due_date': datetime.now() + timedelta(days=5),
                'completed': False
            }
        ]
        
        print(f"\n📝 Creating {len(tasks_data)} tasks...")
        for task_data in tasks_data:
            task = Task(
                description=task_data['description'],
                due_date=task_data['due_date'],
                completed=task_data['completed'],
                user_id=user.id
            )
            db.session.add(task)
        
        db.session.commit()
        print(f"✅ Tasks created successfully!")
        
        # Create sample schedules
        now = datetime.now()
        today_start = now.replace(hour=9, minute=0, second=0, microsecond=0)
        
        schedules_data = [
            {
                'title': 'Team Standup',
                'start_time': today_start + timedelta(hours=1),
                'end_time': today_start + timedelta(hours=1, minutes=30),
                'description': 'Daily team meeting'
            },
            {
                'title': 'Code Review Session',
                'start_time': today_start + timedelta(hours=3),
                'end_time': today_start + timedelta(hours=4),
                'description': 'Review pull requests and provide feedback'
            },
            {
                'title': 'Lunch Break',
                'start_time': today_start + timedelta(hours=5),
                'end_time': today_start + timedelta(hours=6),
                'description': 'Lunch time'
            },
            {
                'title': 'Project Planning Meeting',
                'start_time': today_start + timedelta(hours=7),
                'end_time': today_start + timedelta(hours=8, minutes=30),
                'description': 'Discuss upcoming project requirements'
            },
            {
                'title': 'Client Call',
                'start_time': today_start + timedelta(days=1, hours=2),
                'end_time': today_start + timedelta(days=1, hours=3),
                'description': 'Monthly client check-in'
            },
            {
                'title': 'Sprint Planning',
                'start_time': today_start + timedelta(days=2, hours=9),
                'end_time': today_start + timedelta(days=2, hours=11),
                'description': 'Plan next sprint tasks'
            },
            {
                'title': 'One-on-One with Manager',
                'start_time': today_start + timedelta(days=3, hours=14),
                'end_time': today_start + timedelta(days=3, hours=15),
                'description': 'Monthly 1:1 sync'
            },
            {
                'title': 'Training Session: Advanced Python',
                'start_time': today_start + timedelta(days=4, hours=10),
                'end_time': today_start + timedelta(days=4, hours=11, minutes=30),
                'description': 'Professional development training'
            }
        ]
        
        print(f"\n📅 Creating {len(schedules_data)} schedules...")
        for sched_data in schedules_data:
            schedule = Schedule(
                title=sched_data['title'],
                start_time=sched_data['start_time'],
                end_time=sched_data['end_time'],
                description=sched_data['description'],
                user_id=user.id
            )
            db.session.add(schedule)
        
        db.session.commit()
        print(f"✅ Schedules created successfully!")
        
        # Display summary
        print("\n" + "="*60)
        print("📊 DEMO DATA CREATED SUCCESSFULLY")
        print("="*60)
        print(f"\n👤 Demo User Credentials:")
        print(f"   Username: Moyo")
        print(f"   Password: Demo@123")
        print(f"\n📈 Data Summary:")
        print(f"   ✅ Tasks: {len(tasks_data)}")
        print(f"   ✅ Schedules: {len(schedules_data)}")
        print(f"   ✅ Total Items: {len(tasks_data) + len(schedules_data)}")
        
        print(f"\n🚀 Next Steps:")
        print(f"   1. Start the backend: python app.py")
        print(f"   2. Open login page in browser")
        print(f"   3. Login with Moyo / Demo@123")
        print(f"   4. You'll see all tasks and schedules in the dashboard")
        print(f"   5. Try interacting with the AI!")
        print(f"\n💡 Try these AI commands:")
        print(f"   - 'What tasks do I have?'")
        print(f"   - 'Show my schedule for today'")
        print(f"   - 'Create task to buy groceries'")
        print(f"   - 'Schedule meeting at 14:00'")
        print(f"   - 'What's on my calendar?'")
        print("="*60 + "\n")


if __name__ == '__main__':
    seed_demo_data()