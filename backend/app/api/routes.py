from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.langgraph.workflow import summarize_transcript
from app.models.meeting import Meeting
from app.services.transcription import transcribe_audio

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/meetings/upload")
async def upload_meeting_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    transcript = await transcribe_audio(file)
    summary = summarize_transcript(transcript)

    meeting = Meeting(
        filename=file.filename or "uploaded-audio",
        transcript=transcript,
        summary=summary.summary,
        key_points=summary.key_points,
        decisions=summary.decisions,
        action_items=[item.model_dump() for item in summary.action_items],
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return {
        "id": meeting.id,
        "filename": meeting.filename,
        "transcript": meeting.transcript,
        "summary": meeting.summary,
        "key_points": meeting.key_points,
        "decisions": meeting.decisions,
        "action_items": meeting.action_items,
    }
