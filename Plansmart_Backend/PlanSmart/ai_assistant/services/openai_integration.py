import openai
from .scheduler import create_schedule
from .reminder import set_reminder

def process_command(user, text):
    prompt = f"""
    The user said: "{text}".
    Determine if they want to create a reminder, schedule a task, or ask a question.
    Respond in structured JSON like:
    {{ "intent": "reminder", "task": "call John", "time": "18:00" }}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
    )

    data = eval(response.choices[0].message.content)  # convert JSON text to dict

    if data["intent"] == "reminder":
        set_reminder(user, data["task"], data["time"])
    elif data["intent"] == "schedule":
        create_schedule(user, data["task"], data["time"])

    return data
