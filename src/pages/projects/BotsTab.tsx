import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { CHANNELS, useBots, useCreateBot, useDeleteBot } from "@/entities/bot/api";
import { useFlows } from "@/entities/flow/api";
import { Button, Field, fieldInput, Modal, Spinner, toast } from "@/shared/ui";

export function BotsTab({ projectId }: { projectId: string }) {
  const { data: bots, isLoading } = useBots(projectId);
  const { data: flows } = useFlows(projectId);
  const flowName = (id: string) => flows?.find((f) => f.id === id)?.name ?? "флоу";
  const createBot = useCreateBot();
  const deleteBot = useDeleteBot();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [flowId, setFlowId] = useState("");
  const [channel, setChannel] = useState("telegram");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (bots ?? []).filter((b) => !q || b.name.toLowerCase().includes(q));
  }, [bots, query]);

  function reset() {
    setOpen(false);
    setName("");
    setFlowId("");
    setChannel("telegram");
    setToken("");
    setError(null);
  }

  async function create() {
    if (!name.trim() || !flowId) {
      setError("Укажите название и флоу");
      return;
    }
    try {
      await createBot.mutateAsync({ name, flow_id: flowId, channel, token, project_id: projectId });
      toast.success("Бот создан");
      reset();
    } catch {
      setError("Не удалось создать бота");
    }
  }

  async function removeBot(id: string, botName: string) {
    if (!window.confirm(`Удалить бота «${botName}»?`)) return;
    try {
      await deleteBot.mutateAsync(id);
      toast.success("Бот удалён");
    } catch {
      toast.error("Не удалось удалить");
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">Боты публикуют флоу в каналы. Webhook регистрируется автоматически.</p>
        <Button onClick={() => setOpen(true)}>+ Бот</Button>
      </div>

      {bots && bots.length > 3 && (
        <input
          className={`${fieldInput} mb-3`}
          placeholder="Поиск ботов…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {bots && bots.length === 0 && <p className="text-muted">Пока нет ботов.</p>}

      <ul className="grid gap-2">
        {filtered.map((b) => (
          <li key={b.id} className="group rounded-lg border border-border bg-panel px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{b.name}</span>
                <span className="ml-2 rounded bg-panel-2 px-1.5 py-0.5 text-[10px] uppercase text-muted">
                  {b.channel}
                </span>
              </div>
              <button
                onClick={() => removeBot(b.id, b.name)}
                className="text-xs text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                Удалить
              </button>
            </div>
            <div className="mt-1 text-xs text-muted">
              флоу:{" "}
              <Link to={`/flows/${b.flow_id}`} className="text-accent hover:underline">
                {flowName(b.flow_id)}
              </Link>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted">
              <span className="truncate font-mono">{b.webhook_url}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(b.webhook_url);
                  toast.success("Webhook скопирован");
                }}
                className="shrink-0 hover:text-slate-200"
                title="Скопировать webhook"
              >
                ⧉
              </button>
            </div>
          </li>
        ))}
      </ul>

      {open && (
        <Modal title="Новый бот" onClose={reset}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
            className="flex flex-col gap-4"
          >
            <Field label="Название">
              <input className={fieldInput} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Флоу">
              <select className={fieldInput} value={flowId} onChange={(e) => setFlowId(e.target.value)}>
                <option value="">— выберите флоу —</option>
                {flows?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Канал">
              <select className={fieldInput} value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Токен канала">
              <input
                className={fieldInput}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={channel === "whatsapp" ? "PHONE_NUMBER_ID:ACCESS_TOKEN" : "токен бота"}
              />
            </Field>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={reset}>
                Отмена
              </Button>
              <Button type="submit" disabled={createBot.isPending}>
                Создать
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
