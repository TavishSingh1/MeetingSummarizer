from fastapi import UploadFile
from openai import AsyncOpenAI

from app.core.config import settings


async def transcribe_audio(file: UploadFile) -> str:
    if not settings.openai_api_key:
        return "Transcription placeholder: configure OPENAI_API_KEY to enable Whisper transcription."

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    audio_bytes = await file.read()
    transcription = await client.audio.transcriptions.create(
        model="whisper-1",
        file=(file.filename or "meeting-audio", audio_bytes, file.content_type or "audio/mpeg"),
    )
    return transcription.text
