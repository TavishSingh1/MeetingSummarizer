const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export type HealthResponse = {
  status: string;
};

export type MeetingSummaryResponse = {
  id: number;
  filename: string;
  transcript: string;
  summary: string;
  key_points: string[];
  decisions: string[];
  action_items: Array<{
    task: string;
    owner: string | null;
    due_date: string | null;
  }>;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("Backend health check failed.");
  }
  return response.json();
}

export async function uploadMeetingAudio(file: File): Promise<MeetingSummaryResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/meetings/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Audio upload failed. Please check the backend server and try again.";
    try {
      const payload = await response.json();
      if (typeof payload.detail === "string") {
        message = payload.detail;
      }
    } catch {
      // Keep the default message when the backend does not return JSON.
    }
    throw new Error(message);
  }

  return response.json();
}
