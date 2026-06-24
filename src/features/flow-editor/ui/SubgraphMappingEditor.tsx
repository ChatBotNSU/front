import type { FlowVarDecl } from "@/entities/flow/model/types";

const inputCls =
  "rounded-md border border-border bg-panel-2 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent";

/**
 * Renders the input/output mapping for a subgraph node when the chosen child
 * flow declares an interface in its metadata (see FlowInterfaceEditor).
 *
 * Inputs: each declared input gets a single text field that the parent fills
 *   with a value or `{{template}}` referencing parent variables.
 * Outputs: each declared output maps to a parent-side variable name.
 *
 * When the child flow has no declared interface, the component renders a
 * hint and offers to flip the node into legacy shared-scope mode.
 */
export function SubgraphMappingEditor({
  declared,
  inputMapping,
  outputMapping,
  isolated,
  onChange,
}: {
  declared: { inputs: FlowVarDecl[]; outputs: FlowVarDecl[] };
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  isolated: boolean;
  onChange: (patch: {
    input_mapping?: Record<string, string>;
    output_mapping?: Record<string, string>;
    isolated?: boolean;
  }) => void;
}) {
  const hasDeclaration = declared.inputs.length > 0 || declared.outputs.length > 0;

  if (!hasDeclaration) {
    return (
      <div className="rounded-md border border-dashed border-border bg-panel-2 px-3 py-2 text-xs text-muted">
        У выбранного флоу не объявлен интерфейс — переменные будут общими с родителем
        (legacy-режим). Откройте его и нажмите «Интерфейс», чтобы описать входы и выходы.
      </div>
    );
  }

  function setInput(name: string, value: string) {
    const next = { ...inputMapping };
    if (value === "") delete next[name];
    else next[name] = value;
    onChange({ input_mapping: next });
  }

  function setOutput(childName: string, parentName: string) {
    const next = { ...outputMapping };
    if (parentName === "") delete next[childName];
    else next[childName] = parentName;
    onChange({ output_mapping: next });
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-panel-2 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">Маппинг переменных</span>
        <label className="flex items-center gap-1.5 text-[11px] text-muted">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-accent"
            checked={isolated}
            onChange={(e) => onChange({ isolated: e.target.checked })}
            title="Изолировать переменные от родителя (как вызов функции)"
          />
          изолированный режим
        </label>
      </div>

      {declared.inputs.length > 0 && (
        <Section title="Входы подграфа ← из родителя" help="Можно прокинуть литерал или шаблон {{var}}">
          {declared.inputs.map((v) => (
            <Row key={v.name} name={v.name} description={v.description}>
              <input
                className={inputCls}
                placeholder="{{parent_var}}"
                value={inputMapping[v.name] ?? ""}
                onChange={(e) => setInput(v.name, e.target.value)}
              />
            </Row>
          ))}
        </Section>
      )}

      {declared.outputs.length > 0 && (
        <Section title="Выходы подграфа → в родителя" help="Имя переменной, под которым результат окажется у родителя">
          {declared.outputs.map((v) => (
            <Row key={v.name} name={v.name} description={v.description}>
              <input
                className={inputCls}
                placeholder="parent_var"
                value={outputMapping[v.name] ?? ""}
                onChange={(e) => setOutput(v.name, e.target.value)}
              />
            </Row>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, help, children }: { title: string; help: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <div className="text-[11px] font-medium text-slate-200">{title}</div>
        <div className="text-[10px] text-muted">{help}</div>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Row({
  name,
  description,
  children,
}: {
  name: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-2">
      <div className="pt-1.5">
        <div className="text-xs font-mono text-slate-200">{name}</div>
        {description && <div className="text-[10px] text-muted">{description}</div>}
      </div>
      {children}
    </div>
  );
}
