import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import JSONResponse
from google.cloud import texttospeech
from pydantic import BaseModel
import assemblyai as aai

speechtotext = FastAPI()
load_dotenv()

ASSEMBLYAI_API_KEY = os.environ.get("ASSEMBLYAI_API_KEY")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = 'my-project-402913-fa265bd29f95.json'


# aai.settings.api_key = "d8d6f486ea2243bdbe4e91f0577b4232"
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = 'my-project-402913-fa265bd29f95.json'
client = texttospeech.TextToSpeechClient()

class TranscriptionRequest(BaseModel):
    text: str


# Function to transcribe the text
def synthesize_text(text):
    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",  # Adjust based on the language
        name="en-US-Wavenet-D",  # Adjust based on the desired voice
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    return response.audio_content


# Route for TTS
@speechtotext.post("/tts")
async def tts(request: Request, text_request: TranscriptionRequest):
    try:
        audio_content = synthesize_text(text_request.text)
        return JSONResponse({"audio_content": audio_content.decode("utf-8")})
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Route for transcribing text
@speechtotext.post("/transcribe")
async def transcribe(text: TranscriptionRequest):
    try:
        transcript = aai.RealtimeTranscript(text)
        if isinstance(transcript, aai.RealtimeFinalTranscript):
            return JSONResponse({"transcript": transcript.text})
        else:
            return JSONResponse(content=transcript.text)
    except Exception as e:
        return JSONResponse({"error": str(e)})
