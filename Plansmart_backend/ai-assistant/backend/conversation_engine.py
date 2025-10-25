"""
Conversation engine for AI-powered suggestions and responses
Supports both rule-based and LLM-powered responses
"""
from datetime import datetime, timedelta
from models import Task, Schedule, db
import re
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Initialize OpenAI client if API key is available
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
USE_LLM = OPENAI_AVAILABLE and OPENAI_API_KEY

if USE_LLM:
    client = OpenAI(api_key=OPENAI_API_KEY)
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    OPENAI_MAX_TOKENS = int(os.getenv('OPENAI_MAX_TOKENS', '500'))
    OPENAI_TEMPERATURE = float(os.getenv('OPENAI_TEMPERATURE', '0.7'))
    print("✅ LLM Mode Enabled: Using OpenAI API for conversations")
else:
    if OPENAI_AVAILABLE:
        print("⚠️  LLM Mode: OpenAI library available but API key not set")
    else:
        print("⚠️  LLM Mode: OpenAI library not installed")
    print("📝 Using rule-based conversation engine")


class ConversationEngine:
    """Handles AI conversation logic and suggestions"""
    
    def __init__(self):
        self.conversation_history = []
        self.user_context = {}
    
    def get_user_state(self, user_id=None):
        """Get user's current state: tasks, schedules, patterns"""
        try:
            tasks = Task.query.filter_by(user_id=user_id).all() if user_id else Task.query.all()
            schedules = Schedule.query.filter_by(user_id=user_id).all() if user_id else Schedule.query.all()
            
            incomplete_tasks = [t for t in tasks if not t.completed]
            completed_tasks = [t for t in tasks if t.completed]
            today_schedules = [s for s in schedules if s.start_time.date() == datetime.today().date()]
            
            return {
                'total_tasks': len(tasks),
                'incomplete_tasks': len(incomplete_tasks),
                'completed_tasks': len(completed_tasks),
                'total_schedules': len(schedules),
                'today_schedules': len(today_schedules),
                'has_tasks': len(incomplete_tasks) > 0,
                'has_schedules': len(schedules) > 0,
                'incomplete_task_list': [t.description for t in incomplete_tasks[:5]],
                'today_schedule_list': [s.title for s in today_schedules],
            }
        except Exception as e:
            print(f"Error getting user state: {e}")
            return {}
    
    def detect_intent(self, text):
        """Detect user's intent from text"""
        text_lower = text.lower()
        
        intents = {
            'create_schedule': ['create schedule', 'new schedule', 'schedule', 'add schedule', 'make schedule'],
            'add_task': ['create task', 'add task', 'new task', 'add to do', 'add activity'],
            'view_tasks': ['show tasks', 'my tasks', 'list tasks', 'what tasks', 'view tasks'],
            'view_schedules': ['show schedules', 'my schedules', 'view schedules', 'list schedules', 'what schedules'],
            'help': ['help', 'what can you do', 'commands', 'suggest', 'advice'],
            'greeting': ['hi', 'hello', 'hey', 'good morning', 'good evening'],
            'mark_done': ['mark done', 'complete task', 'finished', 'done with'],
        }
        
        detected = []
        for intent, keywords in intents.items():
            if any(keyword in text_lower for keyword in keywords):
                detected.append(intent)
        
        return detected if detected else ['general_query']
    
    def generate_response(self, user_input, user_id=None):
        """Generate AI response with suggestions"""
        user_state = self.get_user_state(user_id)
        intents = self.detect_intent(user_input)
        
        # Use LLM if available, otherwise use rule-based
        if USE_LLM:
            response = self._generate_llm_response(user_input, user_state, intents)
        else:
            response = self._generate_rule_based_response(user_input, user_state, intents)
        
        # Store in history
        self.conversation_history.append({
            'user': user_input,
            'ai': response,
            'timestamp': datetime.now().isoformat(),
            'intents': intents,
            'mode': 'LLM' if USE_LLM else 'Rule-based'
        })
        
        return response
    
    def _generate_llm_response(self, user_input, user_state, intents):
        """Generate response using OpenAI LLM"""
        try:
            # Build context for the LLM
            context = self._build_context(user_state)
            
            # Create system prompt
            system_prompt = f"""You are PLANSMART, an intelligent scheduling and task management AI assistant.
You help users create schedules, manage tasks, and organize their time effectively.
You are friendly, concise, and use emojis to make interactions engaging.

Current User State:
{context}

Guidelines:
- Give suggestions based on their current state
- If they have no schedules, suggest creating one
- If they have tasks but no schedule, suggest organizing them
- Be conversational but concise (max 3-4 sentences for main message)
- Use relevant emojis (📅 for schedules, ✅ for tasks, ⏰ for time, etc.)
- Always end with actionable suggestions or next steps
- Don't repeat previous responses
"""
            
            # Call OpenAI API
            completion = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=OPENAI_MAX_TOKENS,
                temperature=OPENAI_TEMPERATURE,
            )
            
            response = completion.choices[0].message.content
            return response
        
        except Exception as e:
            print(f"LLM Error: {e}")
            # Fallback to rule-based if LLM fails
            return self._generate_rule_based_response(user_input, user_state, intents)
    
    def _generate_rule_based_response(self, user_input, user_state, intents):
        """Generate response using rule-based engine"""
        # Build response based on intents
        if 'greeting' in intents:
            response = self._greeting_response(user_state)
        elif 'help' in intents or 'general_query' in intents:
            response = self._suggestion_response(user_state)
        elif 'create_schedule' in intents:
            response = self._create_schedule_response()
        elif 'add_task' in intents:
            response = self._add_task_response()
        elif 'view_tasks' in intents:
            response = self._view_tasks_response(user_state)
        elif 'view_schedules' in intents:
            response = self._view_schedules_response(user_state)
        else:
            response = self._suggestion_response(user_state)
        
        return response
    
    def _build_context(self, user_state):
        """Build user context for LLM prompt"""
        context = f"""
- Incomplete Tasks: {user_state['incomplete_tasks']}
- Completed Tasks: {user_state['completed_tasks']}
- Total Schedules: {user_state['total_schedules']}
- Today's Schedules: {user_state['today_schedules']}
"""
        
        if user_state['incomplete_task_list']:
            context += f"- Recent Tasks: {', '.join(user_state['incomplete_task_list'])}\n"
        
        if user_state['today_schedule_list']:
            context += f"- Today's Events: {', '.join(user_state['today_schedule_list'])}\n"
        
        return context
    
    def _greeting_response(self, user_state):
        """Greeting response with contextual suggestions"""
        time_hour = datetime.now().hour
        
        if time_hour < 12:
            greeting = "Good morning! 🌅"
        elif time_hour < 18:
            greeting = "Good afternoon! ☀️"
        else:
            greeting = "Good evening! 🌙"
        
        if user_state['today_schedules'] > 0:
            return f"{greeting} You have {user_state['today_schedules']} schedule(s) for today. Would you like to add tasks to complete them, or view your full schedule?"
        elif user_state['incomplete_tasks'] > 0:
            return f"{greeting} You have {user_state['incomplete_tasks']} incomplete task(s). Should I help you create a schedule for them?"
        else:
            return f"{greeting} Would you like to create a new schedule or add some tasks?"
    
    def _suggestion_response(self, user_state):
        """Main suggestion response"""
        suggestions = []
        
        if user_state['has_schedules'] and not user_state['has_tasks']:
            suggestions.append("📅 You have schedules but no tasks. Would you like to add tasks to your existing schedules?")
        elif not user_state['has_schedules'] and user_state['has_tasks']:
            suggestions.append("✅ You have tasks but no schedule. Should I create a schedule to organize them?")
        elif not user_state['has_schedules'] and not user_state['has_tasks']:
            suggestions.append("🎯 You're all set! Would you like to create a new schedule or add your first task?")
        elif user_state['incomplete_tasks'] > 0 and user_state['today_schedules'] == 0:
            suggestions.append(f"⏰ You have {user_state['incomplete_tasks']} incomplete tasks. Want to schedule them for today?")
        else:
            suggestions.append("✨ Everything looks organized! What would you like to do next?")
        
        options = "\n\nWhat would you like to do?\n"
        options += "• Create a new schedule\n"
        options += "• Add tasks to existing schedules\n"
        options += "• View your tasks\n"
        options += "• View your schedules"
        
        return suggestions[0] + options
    
    def _create_schedule_response(self):
        """Response for creating schedule"""
        return "Great! Let's create a new schedule. What's the name of your schedule? (e.g., 'Work Meeting', 'Workout Session')"
    
    def _add_task_response(self):
        """Response for adding task"""
        return "Perfect! I'll help you add a task. What's the task description? (e.g., 'Complete project report')"
    
    def _view_tasks_response(self, user_state):
        """Response for viewing tasks"""
        if user_state['incomplete_tasks'] == 0:
            return "✅ All done! You have no incomplete tasks."
        
        response = f"📋 You have {user_state['incomplete_tasks']} incomplete task(s):\n"
        for task in user_state['incomplete_task_list']:
            response += f"• {task}\n"
        
        response += "\nWould you like to schedule these tasks or add more?"
        return response
    
    def _view_schedules_response(self, user_state):
        """Response for viewing schedules"""
        if user_state['total_schedules'] == 0:
            return "📅 No schedules yet. Would you like to create one?"
        
        response = f"📅 You have {user_state['total_schedules']} schedule(s).\n"
        if user_state['today_schedules'] > 0:
            response += f"\nToday's schedules ({user_state['today_schedules']}):\n"
            for schedule in user_state['today_schedule_list']:
                response += f"• {schedule}\n"
        
        response += "\nWould you like to add more schedules or tasks?"
        return response


# Initialize engine
conversation_engine = ConversationEngine()


def get_ai_response(user_input, user_id=None):
    """Public function to get AI response"""
    return conversation_engine.generate_response(user_input, user_id)


def get_conversation_history():
    """Get conversation history"""
    return conversation_engine.conversation_history


def is_llm_enabled():
    """Check if LLM is enabled"""
    return USE_LLM