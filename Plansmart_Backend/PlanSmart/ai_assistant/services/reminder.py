from ..models import Reminder
from datetime import datetime

def set_reminder(user, task, time):
    reminder = Reminder.objects.create(
        user=user,
        task=task,
        time=datetime.strptime(time, "%H:%M")
    )
    return reminder
