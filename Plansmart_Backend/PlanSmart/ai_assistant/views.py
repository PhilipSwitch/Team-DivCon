from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .services.speech_recognition import transcribe_audio
from .services.openai_integration import process_command

class VoiceInputView(APIView):
    def post(self, request):
        audio_file = request.FILES.get("audio")
        user = request.user

        # Step 1: Transcribe speech to text
        text = transcribe_audio(audio_file)

        # Step 2: Send text to AI for intent + schedule generation
        ai_response = process_command(user, text)

        return Response({
            "text": text,
            "ai_response": ai_response
        })
