import { useEffect, useRef, useState } from "react";

import { runFlow } from "@/entities/flow/api";
import type { BotMessage } from "@/entities/flow/model/types";
import { cn } from "@/shared/lib/cn";
import { Spinner } from "@/shared/ui";

type Bubble = { role: "user" | "bot" | "system"; text: string; buttons?: BotMessage["buttons"] };

export function DemoChat({ flowId, onClose }: { flowId: string; onClose: () => void }) {
  const [transcript, setTranscript] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const seenRef = useRef(0);
  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function applyResponse(res: Awaited<ReturnType<typeof runFlow>>) {
    const fresh = res.messages.slice(seenRef.current);
    seenRef.current = res.messages.length;
    const bubbles: Bubble[] = fresh.map((m) => ({
      role: "bot",
      text: m.text ?? "",
      buttons: m.buttons,
    }));
    if (res.waiting && res.slot_question) {
      bubbles.push({ role: "bot", text: res.slot_question });
    }
    if (res.error) bubbles.push({ role: "system", text: `Ошибка: ${res.error}` });
    if (res.state === "done") bubbles.push({ role: "system", text: "Диалог завершён." });
    setTranscript((t) => [...t, ...bubbles]);
    setSessionId(res.session_id);
    setWaiting(res.waiting);
    setDone(res.state === "done" || res.state === "error");
  }

  async function start() {
    setLoading(true);
    try {
      applyResponse(await runFlow(flowId, { message: "" }));
    } catch {
      setTranscript((t) => [...t, { role: "system", text: "Не удалось запустить флоу." }]);
    } finally {
      setLoading(false);
    }
  }

  async function send(text: string) {
    if (!text.trim() || loading || done) return;
    setTranscript((t) => [...t, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      applyResponse(await runFlow(flowId, { message: text, session_id: sessionId }));
    } catch {
      setTranscript((t) => [...t, { role: "system", text: "Ошибка запроса." }]);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    seenRef.current = 0;
    setSessionId(null);
    setWaiting(false);
    setDone(false);
    setTranscript([]);
    void start();
  }

  // Auto-start once when the panel opens (guard against StrictMode double-run).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, loading]);

  return (
    <div className="absolute right-0 top-0 z-20 flex h-full w-96 flex-col border-l border-border bg-panel shadow-2xl">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium">Демо · запуск бота</span>
        <div className="flex items-center gap-2">
          <button onClick={restart} className="text-xs text-muted hover:text-slate-200" title="Перезапустить">
            ↻
          </button>
          <button onClick={onClose} className="text-muted hover:text-slate-200">
            ✕
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {transcript.map((b, i) => (
          <div key={i} className={cn("flex", b.role === "user" ? "justify-end" : "justify-start")}>
            {b.role === "system" ? (
              <span className="mx-auto text-[11px] text-muted">{b.text}</span>
            ) : (
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  b.role === "user" ? "bg-accent text-white" : "bg-panel-2 text-slate-100",
                )}
              >
                {b.text}
                {b.buttons && b.buttons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {b.buttons.map((btn, j) => (
                      <button
                        key={j}
                        onClick={() => send(btn.value || btn.label || btn.text || "")}
                        className="rounded border border-border bg-panel px-2 py-0.5 text-xs hover:border-accent"
                      >
                        {btn.label || btn.text || btn.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-panel-2 px-3 py-2">
              <Spinner className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-border p-3">
        {done ? (
          <button
            onClick={restart}
            className="w-full rounded-md bg-accent py-2 text-sm font-medium text-white hover:bg-accent-soft"
          >
            Запустить заново
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              autoFocus
              className="flex-1 rounded-md border border-border bg-panel-2 px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder={waiting ? "Ваш ответ…" : "Сообщение…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-accent px-3 text-sm text-white disabled:opacity-50"
            >
              →
            </button>
          </form>
        )}
      </footer>
    </div>
  );
}
