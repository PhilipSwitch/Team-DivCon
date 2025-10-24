from django.db import models

# Create your models here.

from django.contrib.auth.models import User

class Reminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.CharField(max_length=255)
    time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

class DailySchedule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.CharField(max_length=255)
    time = models.DateTimeField()
    completed = models.BooleanField(default=False)
