import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useCreateFlow,
  useDeleteFlow,
  useDuplicateFlow,
  useFlows,
  useFlowUsage,
  useGenerateFlow,
  useRenameFlow,
} from "@/entities/flow/api";
import { Button, Field, fieldInput, Modal, Spinner, toast } from "@/shared/ui";

export function FlowsTab({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { data: flows, isLoading } = useFlows(projectId);
  const { data: usage } = useFlowUsage(projectId);
  const createFlow = useCreateFlow();
  const deleteFlow = useDeleteFlow();
  const duplicateFlow = useDuplicateFlow();
  const renameFlow = useRenameFlow();
  const generateFlow = useGenerateFlow();

  const [query, setQuery] = useState("");
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [genOpen, setGenOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (flows ?? []).filter((f) => !q || f.name.toLowerCase().includes(q));
  }, [flows, query]);

  async function create() {
    try {
      const flow = await createFlow.mutateAsync({
        name: "Новый флоу",
        project_id: projectId,
        nodes: [],
        start_node: null,
      });
      navigate(`/flows/${flow.id}`);
    } catch {
      toast.error("Не удалось создать флоу");
    }
  }

  async function generate() {
    if (!prompt.trim()) return;
    try {
      const flow = await generateFlow.mutateAsync({ prompt, projectId });
      const offline = (flow.metadata as { generated?: string })?.generated === "offline";
      toast[offline ? "info" : "success"](
        offline ? "LLM не подключён — создан стартовый каркас" : "Флоу сгенерирован ✨",
      );
      setGenOpen(false);
      setPrompt("");
      navigate(`/flows/${flow.id}`);
    } catch {
      toast.error("Не удалось сгенерировать");
    }
  }

  async function duplicate(id: string) {
    try {
      await duplicateFlow.mutateAsync(id);
      toast.success("Флоу продублирован");
    } catch {
      toast.error("Не удалось продублировать");
    }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Удалить флоу «${name}»?`)) return;
    try {
      await deleteFlow.mutateAsync(id);
      toast.success("Флоу удалён");
    } catch {
      toast.error("Не удалось удалить");
    }
  }

  async function rename() {
    if (!renameTarget) return;
    try {
      await renameFlow.mutateAsync({ id: renameTarget.id, name: renameTarget.name });
      toast.success("Переименовано");
      setRenameTarget(null);
    } catch {
      toast.error("Не удалось переименовать");
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">
          Флоу проекта. Любой флоу можно вызвать из другого как подграф (нода «Подграф»).
        </p>
        <div className="flex gap-2">
          <Button onClick={() => setGenOpen(true)}>✨ Сгенерировать по промпту</Button>
          <Button variant="ghost" onClick={create} disabled={createFlow.isPending}>
            + Пустой
          </Button>
        </div>
      </div>

      {flows && flows.length > 3 && (
        <input
          className={`${fieldInput} mb-3`}
          placeholder="Поиск флоу…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {flows && flows.length === 0 && <p className="text-muted">Пока нет флоу.</p>}

      <ul className="grid gap-2">
        {filtered.map((f) => (
          <li
            key={f.id}
            className="group flex items-center justify-between rounded-lg border border-border bg-panel px-4 py-3"
          >
            <button onClick={() => navigate(`/flows/${f.id}`)} className="flex-1 text-left">
              <span className="block font-medium">{f.name}</span>
              <span className="text-xs text-muted">
                {f.node_count} нод · v{f.version}
                {usage?.[f.id] && (usage[f.id].bots > 0 || usage[f.id].subgraph_refs > 0) && (
                  <>
                    {" · "}
                    {usage[f.id].bots > 0 && `в ${usage[f.id].bots} ботах`}
                    {usage[f.id].bots > 0 && usage[f.id].subgraph_refs > 0 && ", "}
                    {usage[f.id].subgraph_refs > 0 && `сабграф в ${usage[f.id].subgraph_refs} флоу`}
                  </>
                )}
              </span>
            </button>
            <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setRenameTarget({ id: f.id, name: f.name })}
                className="text-xs text-muted hover:text-slate-200"
              >
                Переименовать
              </button>
              <button
                onClick={() => duplicate(f.id)}
                className="text-xs text-muted hover:text-slate-200"
              >
                Дублировать
              </button>
              <button onClick={() => remove(f.id, f.name)} className="text-xs text-muted hover:text-red-400">
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>

      {genOpen && (
        <Modal title="Сгенерировать флоу" onClose={() => setGenOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); void generate(); }} className="flex flex-col gap-4">
            <Field label="Опишите бота на естественном языке">
              <textarea
                className={`${fieldInput} h-28`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Бот для записи в барбершоп: спросить имя, услугу, дату и время, подтвердить запись"
                autoFocus
              />
            </Field>
            <p className="-mt-2 text-[11px] text-muted">
              С подключённым LLM получится полноценный граф; без него — стартовый каркас, который можно
              доработать в редакторе.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setGenOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={!prompt.trim() || generateFlow.isPending}>
                {generateFlow.isPending ? "Генерация…" : "Сгенерировать"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {renameTarget && (
        <Modal title="Переименовать флоу" onClose={() => setRenameTarget(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void rename();
            }}
            className="flex flex-col gap-4"
          >
            <Field label="Название">
              <input
                className={fieldInput}
                value={renameTarget.name}
                onChange={(e) => setRenameTarget({ ...renameTarget, name: e.target.value })}
                autoFocus
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenameTarget(null)}>
                Отмена
              </Button>
              <Button type="submit" disabled={!renameTarget.name.trim() || renameFlow.isPending}>
                Сохранить
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
