import openai

def transcribe_audio(audio_file):
    # Using OpenAI Whisper API (or SpeechRecognition library)
    transcription = openai.Audio.transcriptions.create(
        model="whisper-1",
        file=audio_file
    )
    return transcription.text
