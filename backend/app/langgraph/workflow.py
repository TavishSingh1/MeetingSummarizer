from typing import TypedDict

from langgraph.graph import END, StateGraph
from openai import OpenAI

from app.core.config import settings
from app.schemas.meeting import ActionItem, MeetingSummary


class SummaryState(TypedDict):
    transcript: str
    summary: MeetingSummary | None


def summarize_node(state: SummaryState) -> SummaryState:
    transcript = state["transcript"].strip()
    if settings.openai_api_key and transcript:
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
    model=settings.openai_summary_model,
    response_format={"type": "json_object"},
    messages=[
        {
            "role": "system",
            "content": (
                "You are a meeting summarization assistant. "
                "Return ONLY valid JSON with exactly these keys:\n"
                "- summary: string\n"
                "- key_points: array of strings\n"
                "- decisions: array of strings\n"
                "- action_items: array of objects, each containing:\n"
                "  - task: string\n"
                "  - owner: string or null\n"
                "  - due_date: string or null\n\n"
                "IMPORTANT:\n"
                "Each item in key_points must be a plain string.\n"
                "Each item in decisions must be a plain string, NOT an object.\n"
                "Do not add extra keys."
            ),
        },
        {"role": "user", "content": transcript},
    ],
)
        content = response.choices[0].message.content or "{}"
        state["summary"] = MeetingSummary.model_validate_json(content)
        return state

    fallback = transcript[:280] if transcript else "No transcript content was provided."

    state["summary"] = MeetingSummary(
        summary=fallback,
        key_points=[] if not transcript else ["Initial summarization workflow is connected."],
        decisions=[],
        action_items=[
            ActionItem(
                task="Replace placeholder summarization with an OpenAI-backed LangGraph node.",
                owner=None,
                due_date=None,
            )
        ],
    )
    return state


workflow = StateGraph(SummaryState)
workflow.add_node("summarize", summarize_node)
workflow.set_entry_point("summarize")
workflow.add_edge("summarize", END)
summary_app = workflow.compile()


def summarize_transcript(transcript: str) -> MeetingSummary:
    result = summary_app.invoke({"transcript": transcript, "summary": None})
    summary = result["summary"]
    if summary is None:
        raise RuntimeError("Summary workflow completed without a summary.")
    return summary
