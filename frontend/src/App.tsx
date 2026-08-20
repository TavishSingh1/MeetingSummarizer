import { useEffect, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  FileAudio,
  FileText,
  ListChecks,
  Loader2,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";

import {
  getHealth,
  MeetingSummaryResponse,
  uploadMeetingAudio,
} from "./lib/api";

function App() {
  const [apiStatus, setApiStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<MeetingSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadMeetingAudio(selectedFile);
      setResult(response);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Something went wrong while processing the meeting.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setError(null);
  }

  const statusStyles = {
    online: "border-emerald-200 bg-emerald-50 text-emerald-700",
    offline: "border-rose-200 bg-rose-50 text-rose-700",
    checking: "border-zinc-200 bg-zinc-50 text-zinc-600",
  }[apiStatus];

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-zinc-950">
      <div className="mx-auto min-h-screen w-full max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-zinc-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI MEETING ASSISTANT
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Meeting Summarizer
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
              Turn meeting recordings into clear summaries, decisions, and
              actionable follow-ups.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold ${statusStyles}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus === "online"
                  ? "bg-emerald-500"
                  : apiStatus === "offline"
                    ? "bg-rose-500"
                    : "bg-zinc-400"
              }`}
            />
            <Activity className="h-3.5 w-3.5" />
            API {apiStatus}
          </div>
        </header>

        {/* Upload */}
        <section className="mt-8">
          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Analyze a meeting</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Upload an audio recording to generate an AI-powered recap.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group w-full rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center transition hover:border-zinc-400 hover:bg-zinc-100"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
                  <FileAudio className="h-7 w-7 text-zinc-700" />
                </div>

                {selectedFile ? (
                  <>
                    <p className="mt-4 text-sm font-semibold text-zinc-950">
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <p className="mt-3 text-xs font-medium text-zinc-500">
                      Click to choose a different file
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-4 text-sm font-semibold text-zinc-950">
                      Drop your meeting audio here
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      or click to browse your files
                    </p>
                    <p className="mt-3 text-xs text-zinc-400">
                      MP3, WAV, M4A, MP4 and other audio formats
                    </p>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                id="audio"
                type="file"
                accept="audio/*"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
                className="hidden"
              />

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing meeting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Summarize meeting
                    </>
                  )}
                </button>

                {selectedFile && !isUploading ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              {isUploading ? (
                <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
                  Your audio is being transcribed and processed through the AI
                  workflow. This may take a moment.
                </div>
              ) : null}

              {error ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
            </div>
          </form>
        </section>

        {/* Results */}
        {result ? (
          <section className="mt-10 space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold">Meeting recap</h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{result.filename}</p>
              </div>

              <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                Analysis complete
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {/* Summary */}
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-zinc-500" />
                  <h3 className="font-semibold">Summary</h3>
                </div>

                <p className="mt-4 text-sm leading-7 text-zinc-600">
                  {result.summary}
                </p>
              </article>

              {/* Decisions */}
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-zinc-500" />
                  <h3 className="font-semibold">Key decisions</h3>
                </div>

                {result.decisions.length ? (
                  <ul className="mt-4 space-y-3">
                    {result.decisions.map((decision) => (
                      <li
                        key={decision}
                        className="flex gap-3 rounded-xl bg-zinc-50 p-3 text-sm leading-6 text-zinc-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
                    No decisions detected.
                  </p>
                )}
              </article>
            </div>

            {/* Key points */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-zinc-500" />
                <h3 className="font-semibold">Key points</h3>
              </div>

              {result.key_points.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {result.key_points.map((point, index) => (
                    <div
                      key={point}
                      className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
                    >
                      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <p className="text-sm leading-6 text-zinc-600">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-500">
                  No key points detected.
                </p>
              )}
            </article>

            {/* Transcript */}
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-500" />
                <h3 className="font-semibold">Transcript</h3>
              </div>

              <div className="mt-4 max-h-80 overflow-y-auto rounded-xl bg-zinc-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-600">
                  {result.transcript}
                </p>
              </div>
            </article>

            {/* Action items */}
            <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-zinc-500" />
                  <h3 className="font-semibold">Action items</h3>
                </div>
              </div>

              {result.action_items.length ? (
                <div className="overflow-x-auto border-t border-zinc-100">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Task</th>
                        <th className="px-5 py-3 font-semibold">Owner</th>
                        <th className="px-5 py-3 font-semibold">Due date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100">
                      {result.action_items.map((item) => (
                        <tr key={`${item.task}-${item.owner ?? "unassigned"}`}>
                          <td className="px-5 py-4 font-medium text-zinc-800">
                            {item.task}
                          </td>
                          <td className="px-5 py-4 text-zinc-600">
                            {item.owner || "Unassigned"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                              {item.due_date || "Not set"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="border-t border-zinc-100 p-5 text-sm text-zinc-500">
                  No action items detected.
                </p>
              )}
            </article>
          </section>
        ) : (
          <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
              <FileText className="h-7 w-7 text-zinc-500" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No meeting analyzed yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Upload a meeting recording above and your transcript, summary,
              decisions, and action items will appear here.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;