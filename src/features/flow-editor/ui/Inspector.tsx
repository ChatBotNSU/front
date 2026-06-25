import { useEffect, useState } from "react";

import { useFlow, useFlows, useFlowVersions } from "@/entities/flow/api";
import { readFlowInterface } from "@/entities/flow/model/types";
import { useIntegrations } from "@/entities/integration/api";
import { getConfigFields } from "@/entities/node/model/configSchema";
import {
  CONDITION_OPERATORS,
  NODE_CATALOG,
  OPERATOR_LABELS,
  VALUELESS_OPERATORS,
} from "@/entities/node/model/types";
import type { ConditionOperator } from "@/entities/node/model/types";
import { Button } from "@/shared/ui";

import { useEditorStore } from "../model/editorStore";
import type { EditorEdgeData } from "../model/types";
import { ConfigForm } from "./ConfigForm";
import { FlowVersionPreview } from "./FlowVersionPreview";
import { SubgraphMappingEditor } from "./SubgraphMappingEditor";

export function Inspector() {
  const selection = useEditorStore((s) => s.selection);

  if (!selection) {
    return (
      <Panel>
        <p className="text-sm text-muted">Выберите ноду или связь для редактирования.</p>
      </Panel>
    );
  }
  return selection.kind === "node" ? (
    <NodeInspector id={selection.id} />
  ) : (
    <EdgeInspector id={selection.id} />
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <aside className="scrollbar-thin flex w-80 flex-col gap-4 overflow-y-auto border-l border-border bg-panel p-4">
      {children}
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded-md border border-border bg-panel-2 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent";

function NodeInspector({ id }: { id: string }) {
  const node = useEditorStore((s) => s.nodes.find((n) => n.id === id));
  const updateNode = useEditorStore((s) => s.updateNode);
  const setStartNode = useEditorStore((s) => s.setStartNode);
  const deleteSelection = useEditorStore((s) => s.deleteSelection);

  const projectId = useEditorStore((s) => s.projectId);
  const currentFlowId = useEditorStore((s) => s.flowId);
  const { data: flows } = useFlows(projectId || undefined);
  const { data: integrations } = useIntegrations(projectId);
  const flowOptions = (flows ?? [])
    .filter((f) => f.id !== currentFlowId)
    .map((f) => ({ value: f.id, label: f.name }));
  const integrationOptions = (integrations ?? []).map((it) => ({
    value: it.name,
    label: `${it.name} · ${it.kind}`,
  }));

  // For subgraph nodes: available versions of the referenced child flow, so the
  // version field can offer a choice and flag a pinned-but-outdated version.
  const childFlowId =
    node?.data.nodeType === "subgraph" ? String(node.data.config.flow_id ?? "") : "";
  const { data: childVersions } = useFlowVersions(childFlowId || undefined);
  const versionContext = {
    flowSelected: Boolean(childFlowId),
    latest: childVersions?.latest,
    versions: childVersions?.versions ?? [],
  };

  // Full child-flow detail — so we can read its declared interface (inputs /
  // outputs) and offer the mapping UI. Skipped when no subgraph or no flow_id.
  const { data: childFlow } = useFlow(childFlowId || undefined);
  const childInterface = readFlowInterface(childFlow?.metadata);

  const fields = node ? getConfigFields(node.data.nodeType) : undefined;
  const [showJson, setShowJson] = useState(false);
  const [configText, setConfigText] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (node) setConfigText(JSON.stringify(node.data.config, null, 2));
  }, [id, showJson]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return null;
  const spec = NODE_CATALOG[node.data.nodeType];
  const config = node.data.config;
  const rawPin = config.flow_version;
  const pinnedVersion =
    rawPin === undefined || rawPin === null || rawPin === "" ? undefined : Number(rawPin);

  function patchConfig(patch: Record<string, unknown>) {
    updateNode(id, { config: { ...config, ...patch } });
  }

  function commitJson() {
    try {
      updateNode(id, { config: JSON.parse(configText || "{}") });
      setConfigError(null);
    } catch {
      setConfigError("Некорректный JSON");
    }
  }

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">{spec.label}</span>
        {node.data.isStart && (
          <span className="rounded bg-emerald-500/20 px-1.5 text-[10px] text-emerald-300">
            стартовая
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => void navigator.clipboard?.writeText(id)}
        className="block w-full select-text break-all rounded-md border border-border/60 bg-panel-2 px-2 py-1 text-left font-mono text-[10px] text-muted hover:text-slate-200"
        title="Кликнуть — скопировать"
      >
        {id}
      </button>

      <Field label="Название">
        <input
          className={inputCls}
          value={node.data.label}
          onChange={(e) => updateNode(id, { label: e.target.value })}
        />
      </Field>

      {fields ? (
        <ConfigForm
          fields={fields}
          config={config}
          onChange={patchConfig}
          flowOptions={flowOptions}
          integrationOptions={integrationOptions}
          versionContext={versionContext}
        />
      ) : (
        <p className="text-xs text-muted">У этой ноды нет настраиваемых полей.</p>
      )}

      {node.data.nodeType === "subgraph" && childFlowId && (
        <>
          <SubgraphMappingEditor
            declared={childInterface}
            inputMapping={
              (config.input_mapping as Record<string, string> | undefined) ?? {}
            }
            outputMapping={
              (config.output_mapping as Record<string, string> | undefined) ?? {}
            }
            isolated={Boolean(
              config.isolated ||
                (config.input_mapping &&
                  Object.keys(config.input_mapping as Record<string, string>).length > 0) ||
                (config.output_mapping &&
                  Object.keys(config.output_mapping as Record<string, string>).length > 0),
            )}
            onChange={patchConfig}
          />
          <Button variant="ghost" onClick={() => setPreviewOpen(true)}>
            Просмотр версий
          </Button>
        </>
      )}
      {previewOpen && (
        <FlowVersionPreview
          title="Версии подграфа"
          flowId={childFlowId}
          versions={versionContext.versions}
          latest={versionContext.latest}
          pinnedVersion={pinnedVersion}
          initialVersion={pinnedVersion}
          onPin={(v) => patchConfig({ flow_version: v })}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowJson((v) => !v)}
          className="text-xs text-muted hover:text-slate-200"
        >
          {showJson ? "▾ Скрыть JSON" : "▸ Расширенный (JSON)"}
        </button>
        {showJson && (
          <>
            <textarea
              className={`${inputCls} mt-2 h-40 w-full font-mono text-xs`}
              spellCheck={false}
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              onBlur={commitJson}
            />
            {configError && <p className="mt-1 text-xs text-red-400">{configError}</p>}
          </>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {!node.data.isStart && !spec.terminal && (
          <Button variant="ghost" onClick={() => setStartNode(id)}>
            Сделать стартовой
          </Button>
        )}
        <Button variant="danger" onClick={deleteSelection}>
          Удалить ноду
        </Button>
      </div>
    </Panel>
  );
}

type Operator = ConditionOperator;

function currentOperator(cond?: EditorEdgeData["condition"]): Operator {
  if (!cond) return "eq";
  return CONDITION_OPERATORS.find((op) => cond[op] !== undefined && cond[op] !== null) ?? "eq";
}

function parseValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Render a stored condition value back into the text input. Arrays/objects
 * (e.g. the `in` / `not_in` lists) round-trip as JSON; scalars stay plain. */
function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function EdgeInspector({ id }: { id: string }) {
  const edge = useEditorStore((s) => s.edges.find((e) => e.id === id));
  const updateEdge = useEditorStore((s) => s.updateEdge);
  const deleteSelection = useEditorStore((s) => s.deleteSelection);

  if (!edge) return null;
  const data = edge.data ?? { kind: "fallback" };
  const cond = data.condition;
  const op = currentOperator(cond);
  const noValue = VALUELESS_OPERATORS.has(op);

  function setKind(kind: EditorEdgeData["kind"]) {
    updateEdge(id, kind === "fallback" ? { kind } : { kind, condition: { if: cond?.if ?? "" } });
  }

  function setField(patch: Partial<NonNullable<EditorEdgeData["condition"]>>) {
    updateEdge(id, { kind: "condition", condition: { if: "", ...cond, ...patch } });
  }

  function setOperator(next: Operator) {
    const base = { if: cond?.if ?? "" };
    updateEdge(id, {
      kind: "condition",
      condition: VALUELESS_OPERATORS.has(next) ? { ...base, [next]: true } : { ...base, [next]: "" },
    });
  }

  return (
    <Panel>
      <span className="text-xs uppercase tracking-wide text-muted">Связь</span>

      <Field label="Тип перехода">
        <select className={inputCls} value={data.kind} onChange={(e) => setKind(e.target.value as EditorEdgeData["kind"])}>
          <option value="fallback">fallback (по умолчанию)</option>
          <option value="condition">по условию</option>
        </select>
      </Field>

      {data.kind === "condition" && (
        <>
          <Field label="Поле (если)">
            <input
              className={inputCls}
              placeholder="$data.text"
              value={cond?.if ?? ""}
              onChange={(e) => setField({ if: e.target.value })}
            />
          </Field>
          <Field label="Оператор">
            <select className={inputCls} value={op} onChange={(e) => setOperator(e.target.value as Operator)}>
              {CONDITION_OPERATORS.map((o) => (
                <option key={o} value={o}>
                  {OPERATOR_LABELS[o]}
                </option>
              ))}
            </select>
          </Field>
          {!noValue && (
            <Field label="Значение">
              <input
                className={inputCls}
                placeholder={op === "in" || op === "not_in" ? '["a", "b"]' : undefined}
                value={cond ? formatValue(cond[op]) : ""}
                onChange={(e) => setField({ [op]: parseValue(e.target.value) })}
              />
              {(op === "in" || op === "not_in") && (
                <span className="mt-1 block text-xs text-muted">
                  Список значений в JSON: <code>["a", "b"]</code>
                </span>
              )}
            </Field>
          )}
        </>
      )}

      <Button variant="danger" className="mt-2" onClick={deleteSelection}>
        Удалить связь
      </Button>
    </Panel>
  );
}
