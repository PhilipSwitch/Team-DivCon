from celery import shared_task
from django.core.mail import send_mail

from PlanSmart.ai_assistant.models import Reminder

@shared_task
def send_reminder_email(reminder_id):
    reminder = Reminder.objects.get(id=reminder_id)
    send_mail(
        "Reminder",
        f"Don’t forget: {reminder.task}",
        "noreply@plansmart.ai",
        [reminder.user.email],
    )
