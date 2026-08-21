import json
from typing import TypedDict

from langgraph.graph import END, StateGraph
from openai import OpenAI

from app.core.config import settings
from app.schemas.meeting import ActionItem, MeetingSummary


class SummaryState(TypedDict):
    transcript: str
    result: MeetingSummary | None


def prepare_transcript(state: SummaryState) -> SummaryState:
    """Prepare transcript before sending it to the LLM."""
    state["transcript"] = state["transcript"].strip()
    return state


def analyze_meeting(state: SummaryState) -> SummaryState:
    """
    Perform the complete meeting analysis in a single OpenAI API call.
    """

    transcript = state["transcript"]

    if not settings.openai_api_key or not transcript:
        fallback = (
            transcript[:280]
            if transcript
            else "No transcript content was provided."
        )

        state["result"] = MeetingSummary(
            summary=fallback,
            key_points=(
                []
                if not transcript
                else ["Initial summarization workflow is connected."]
            ),
            decisions=[],
            action_items=[],
        )

        return state

    client = OpenAI(api_key=settings.openai_api_key)

    response = client.chat.completions.create(
        model=settings.openai_summary_model,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a meeting intelligence assistant.\n\n"
                    "Analyze the provided meeting transcript and return "
                    "ONLY valid JSON with exactly these keys:\n\n"
                    "{\n"
                    '  "summary": "string",\n'
                    '  "key_points": ["string"],\n'
                    '  "decisions": ["string"],\n'
                    '  "action_items": [\n'
                    "    {\n"
                    '      "task": "string",\n'
                    '      "owner": "string or null",\n'
                    '      "due_date": "string or null"\n'
                    "    }\n"
                    "  ]\n"
                    "}\n\n"
                    "Rules:\n"
                    "- summary must be concise and professional.\n"
                    "- key_points must contain plain strings.\n"
                    "- decisions must contain plain strings, never objects.\n"
                    "- action_items must contain task, owner, and due_date.\n"
                    "- Use null when owner or due_date is not mentioned.\n"
                    "- Do not invent information.\n"
                    "- Preserve names, responsibilities, and deadlines accurately.\n"
                    "- Do not add extra keys."
                ),
            },
            {
                "role": "user",
                "content": transcript,
            },
        ],
    )

    content = response.choices[0].message.content or "{}"

    try:
        data = json.loads(content)

        action_items = [
            ActionItem(
                task=item.get("task", ""),
                owner=item.get("owner"),
                due_date=item.get("due_date"),
            )
            for item in data.get("action_items", [])
        ]

        state["result"] = MeetingSummary(
            summary=data.get("summary", ""),
            key_points=data.get("key_points", []),
            decisions=data.get("decisions", []),
            action_items=action_items,
        )

    except (json.JSONDecodeError, TypeError, ValueError) as exc:
        raise RuntimeError(
            f"OpenAI returned invalid meeting analysis JSON: {exc}"
        ) from exc

    return state


def validate_output(state: SummaryState) -> SummaryState:
    """
    Validate the final structured result using the existing Pydantic schema.
    No API call.
    """

    result = state["result"]

    if result is None:
        raise RuntimeError("Meeting analysis produced no result.")

    # Re-validate using the existing Pydantic model.
    state["result"] = MeetingSummary.model_validate(
        result.model_dump()
    )

    return state


workflow = StateGraph(SummaryState)

workflow.add_node("prepare_transcript", prepare_transcript)
workflow.add_node("analyze_meeting", analyze_meeting)
workflow.add_node("validate_output", validate_output)

workflow.set_entry_point("prepare_transcript")

workflow.add_edge("prepare_transcript", "analyze_meeting")
workflow.add_edge("analyze_meeting", "validate_output")
workflow.add_edge("validate_output", END)

summary_app = workflow.compile()


def summarize_transcript(transcript: str) -> MeetingSummary:
    result = summary_app.invoke(
        {
            "transcript": transcript,
            "result": None,
        }
    )

    summary = result["result"]

    if summary is None:
        raise RuntimeError(
            "Summary workflow completed without a summary."
        )

    return summary