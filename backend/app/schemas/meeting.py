from pydantic import BaseModel


class ActionItem(BaseModel):
    task: str
    owner: str | None = None
    due_date: str | None = None


class MeetingSummary(BaseModel):
    summary: str
    key_points: list[str]
    decisions: list[str]
    action_items: list[ActionItem]
