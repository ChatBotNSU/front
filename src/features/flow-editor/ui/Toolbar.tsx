import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  useCreateFlow,
  useCreateFlowVersion,
  useDeleteFlow,
  useFlowVersions,
  useUpdateFlow,
  validateFlow,
} from "@/entities/flow/api";
import type { FlowDetail } from "@/entities/flow/model/types";
import { Button, toast } from "@/shared/ui";

import { useEditorStore } from "../model/editorStore";
import { planGrouping } from "../model/grouping";
import { flowToReactFlow, reactFlowToPayload } from "../model/mapping";
import { FlowInterfaceEditor } from "./FlowInterfaceEditor";
import { FlowVersionPreview } from "./FlowVersionPreview";

export function Toolbar({ flowId, onDemo }: { flowId: string; onDemo: () => void }) {
  const name = useEditorStore((s) => s.name);
  const setName = useEditorStore((s) => s.setName);
  const dirty = useEditorStore((s) => s.dirty);
  const toPayload = useEditorStore((s) => s.toPayload);
  const markSaved = useEditorStore((s) => s.markSaved);
  const setGraph = useEditorStore((s) => s.setGraph);
  const applyGrouping = useEditorStore((s) => s.applyGrouping);
  const metadata = useEditorStore((s) => s.metadata);
  const setMetadata = useEditorStore((s) => s.setMetadata);

  const navigate = useNavigate();
  const projectId = useEditorStore((s) => s.projectId);
  const update = useUpdateFlow(flowId);
  const createFlow = useCreateFlow();
  const deleteFlow = useDeleteFlow();
  const fileInput = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[] | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [interfaceOpen, setInterfaceOpen] = useState(false);
  const { data: versions } = useFlowVersions(flowId);
  const createVersion = useCreateFlowVersion(flowId);

  function restoreVersion(snapshot: FlowDetail) {
    const { nodes, edges } = flowToReactFlow(snapshot);
    setGraph(nodes, edges, { name: snapshot.name, startNode: snapshot.start_node });
    toast.info("Версия загружена в редактор — сохраните, чтобы применить");
  }

  async function snapshotVersion() {
    try {
      // Commit the current canvas: persist the draft first, then snapshot it.
      await update.mutateAsync(toPayload());
      markSaved();
      const info = await createVersion.mutateAsync();
      toast.success(`Создана версия v${info.version}`);
    } catch {
      toast.error("Не удалось создать версию");
    }
  }

  async function save() {
    try {
      await update.mutateAsync(toPayload());
      markSaved();
      toast.success("Сохранено");
    } catch {
      toast.error("Не удалось сохранить");
    }
  }

  async function saveAndValidate() {
    await save();
    const result = await validateFlow(flowId);
    setErrors(result.valid ? [] : result.errors);
    if (result.valid) toast.success("Флоу валиден");
    else toast.error(`Ошибок: ${result.errors.length}`);
  }

  function exportFlow() {
    const blob = new Blob([JSON.stringify(toPayload(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "flow"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFlow(file: File) {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Partial<FlowDetail>;
      const { nodes, edges } = flowToReactFlow({
        nodes: data.nodes ?? [],
        start_node: data.start_node ?? null,
      } as FlowDetail);
      setGraph(nodes, edges, { name: data.name ?? name, startNode: data.start_node ?? null });
      toast.success("Импортировано (не забудьте сохранить)");
    } catch {
      toast.error("Не удалось прочитать файл");
    }
  }

  async function group() {
    const { nodes, edges, projectId } = useEditorStore.getState();
    const plan = planGrouping(nodes, edges);
    if (!plan) {
      toast.info("Выделите минимум 2 ноды (рамкой или Shift+клик)");
      return;
    }
    const child = await createFlow.mutateAsync(
      reactFlowToPayload(plan.childNodes, plan.childEdges, {
        name: `${name} · подграф`,
        startNode: plan.childStartNode,
        projectId: projectId || undefined,
      }),
    );
    applyGrouping(plan.parentNodes, plan.parentEdges, plan.subgraphNodeId, child.id);
    toast.success("Ноды вынесены в подграф");
  }

  async function openDemo() {
    if (dirty) await save(); // demo runs the persisted flow, so save edits first
    onDemo();
  }

  async function remove() {
    if (!window.confirm(`Удалить флоу «${name}»? Это необратимо.`)) return;
    await deleteFlow.mutateAsync(flowId);
    navigate("/flows");
  }

  return (
    <header className="relative flex items-center gap-2 border-b border-border bg-panel px-4 py-2">
      <Link
        to={projectId ? `/projects/${projectId}` : "/projects"}
        className="text-sm text-muted hover:text-slate-200"
      >
        ←
      </Link>
      <input
        className="w-56 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-border focus:border-accent focus:outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {dirty && <span className="text-xs text-amber-400">● не сохранено</span>}
      {!dirty && versions?.draft_dirty && (
        <span
          className="text-xs text-amber-400"
          title="Черновик сохранён, но отличается от последней версии — нажмите «Создать версию», чтобы зафиксировать"
        >
          ● не в версии v{versions.latest}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        {errors !== null && (
          <span className={errors.length === 0 ? "text-xs text-emerald-400" : "text-xs text-red-400"}>
            {errors.length === 0 ? "✓ валиден" : `${errors.length} ошибк(и)`}
          </span>
        )}
        <Button variant="primary" onClick={openDemo} title="Запустить бота в браузере">
          ▶ Демо
        </Button>
        <Button variant="ghost" onClick={group} title="Вынести выделенные ноды в подграф">
          Группировать
        </Button>
        <Button
          variant="ghost"
          onClick={() => setInterfaceOpen(true)}
          title="Объявить входы и выходы этого флоу (контракт для вызова как подграф)"
        >
          Интерфейс
        </Button>
        <Button
          variant="ghost"
          onClick={snapshotVersion}
          disabled={createVersion.isPending || update.isPending}
          title="Сохранить текущее состояние как новую версию"
        >
          {createVersion.isPending ? "Сохранение…" : "Создать версию"}
        </Button>
        {versions && versions.latest >= 1 && (
          <Button
            variant="ghost"
            onClick={() => setVersionsOpen(true)}
            title="Просмотреть и восстановить прошлые версии"
          >
            Версии · v{versions.latest}
          </Button>
        )}
        <Button variant="ghost" onClick={exportFlow} title="Скачать JSON">
          Экспорт
        </Button>
        <Button variant="ghost" onClick={() => fileInput.current?.click()} title="Загрузить JSON">
          Импорт
        </Button>
        <Button variant="ghost" onClick={saveAndValidate} disabled={update.isPending}>
          Проверить
        </Button>
        <Button variant="danger" onClick={remove} disabled={deleteFlow.isPending}>
          Удалить
        </Button>
        <Button onClick={save} disabled={update.isPending || !dirty}>
          {update.isPending ? "Сохранение…" : "Сохранить"}
        </Button>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importFlow(file);
          e.target.value = "";
        }}
      />

      {interfaceOpen && (
        <FlowInterfaceEditor
          metadata={metadata}
          onSave={({ inputs, outputs }) => setMetadata({ inputs, outputs })}
          onClose={() => setInterfaceOpen(false)}
        />
      )}

      {versionsOpen && versions && (
        <FlowVersionPreview
          flowId={flowId}
          versions={versions.versions}
          latest={versions.latest}
          initialVersion={versions.latest}
          onRestore={restoreVersion}
          onClose={() => setVersionsOpen(false)}
        />
      )}

      {errors && errors.length > 0 && (
        <div className="absolute right-4 top-14 z-10 w-80 rounded-md border border-red-500/40 bg-panel-2 p-3 text-xs text-red-300 shadow-xl">
          <ul className="list-disc space-y-1 pl-4">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
