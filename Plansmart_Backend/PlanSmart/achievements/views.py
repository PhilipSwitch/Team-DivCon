from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import DailySchedule, Reminder

class OverviewView(APIView):
    def get(self, request):
        user = request.user
        reminders = Reminder.objects.filter(user=user)
        schedules = DailySchedule.objects.filter(user=user)

        return Response({
            "reminders": list(reminders.values()),
            "schedules": list(schedules.values()),
            "summary": f"You’ve completed {schedules.filter(completed=True).count()} tasks today."
        })
