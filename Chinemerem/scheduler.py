from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from datetime import datetime
import logging

scheduler = BackgroundScheduler()
logger = logging.getLogger(__name__)

def send_reminder(task_description):
    # For simplicity, log the reminder. In real app, send email or push notification
    logger.info(f"Reminder: {task_description}")

def schedule_reminder(task_id, task_description, reminder_time):
    if reminder_time > datetime.now():
        scheduler.add_job(
            send_reminder,
            trigger=DateTrigger(run_date=reminder_time),
            args=[task_description],
            id=f"reminder_{task_id}"
        )
        logger.info(f"Scheduled reminder for task {task_id} at {reminder_time}")

def start_scheduler():
    scheduler.start()

def stop_scheduler():
    scheduler.shutdown()
