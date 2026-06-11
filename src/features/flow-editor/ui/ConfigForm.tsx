import type { ConfigField } from "@/entities/node/model/configSchema";
import type { FlowVersionInfo } from "@/entities/flow/model/types";

const inputCls =
  "rounded-md border border-border bg-panel-2 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent";

export type FlowOption = { value: string; label: string };

/** Available versions of the selected child flow, for `flowVersionSelect`. */
export type VersionContext = {
  latest?: number;
  versions: FlowVersionInfo[];
  /** True once a child flow is selected (otherwise the field is disabled). */
  flowSelected: boolean;
};

type Props = {
  fields: ConfigField[];
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  /** Options for `flowSelect` fields (project flows). */
  flowOptions?: FlowOption[];
  /** Options for `integrationSelect` fields (project integrations). */
  integrationOptions?: FlowOption[];
  /** Versions of the selected child flow for `flowVersionSelect` fields. */
  versionContext?: VersionContext;
};

export function ConfigForm({
  fields,
  config,
  onChange,
  flowOptions,
  integrationOptions,
  versionContext,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <FieldRow
          key={field.key}
          field={field}
          value={config[field.key]}
          onChange={(v) => onChange({ [field.key]: v })}
          flowOptions={flowOptions}
          integrationOptions={integrationOptions}
          versionContext={versionContext}
        />
      ))}
    </div>
  );
}

function FieldRow({
  field,
  value,
  onChange,
  flowOptions,
  integrationOptions,
  versionContext,
}: {
  field: ConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
  flowOptions?: FlowOption[];
  integrationOptions?: FlowOption[];
  versionContext?: VersionContext;
}) {
  // Checkbox reads nicer with the label on the right.
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-accent"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm text-slate-200">{field.label}</span>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{field.label}</span>
      <FieldInput
        field={field}
        value={value}
        onChange={onChange}
        flowOptions={flowOptions}
        integrationOptions={integrationOptions}
        versionContext={versionContext}
      />
      {field.help && <span className="text-[11px] text-muted">{field.help}</span>}
    </label>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  flowOptions,
  integrationOptions,
  versionContext,
}: {
  field: ConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
  flowOptions?: FlowOption[];
  integrationOptions?: FlowOption[];
  versionContext?: VersionContext;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className={`${inputCls} h-24`}
          placeholder={field.placeholder}
          value={asString(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "code":
      return (
        <textarea
          className={`${inputCls} h-32 font-mono text-xs`}
          spellCheck={false}
          placeholder={field.placeholder}
          value={asString(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className={inputCls}
          placeholder={field.placeholder}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
    case "select":
      return (
        <select className={inputCls} value={asString(value)} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "flowSelect":
      return (
        <select className={inputCls} value={asString(value)} onChange={(e) => onChange(e.target.value)}>
          <option value="">— выберите флоу —</option>
          {flowOptions?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "flowVersionSelect":
      return (
        <FlowVersionSelect value={value} onChange={onChange} ctx={versionContext} />
      );
    case "integrationSelect": {
      const current = asString(value);
      const opts = integrationOptions ?? [];
      const missing = current && !opts.some((o) => o.value === current);
      return (
        <select className={inputCls} value={current} onChange={(e) => onChange(e.target.value)}>
          <option value="">— без интеграции —</option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {missing && <option value={current}>{current} (не найдена)</option>}
        </select>
      );
    }
    case "keyvalue":
      return <KeyValueEditor value={asRecord(value)} onChange={onChange} />;
    case "stringlist":
      return (
        <input
          className={inputCls}
          placeholder={field.placeholder}
          value={asStringList(value).join(", ")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
      );
    case "objectList":
      return <ObjectListEditor field={field} value={asArray(value)} onChange={onChange} />;
    default:
      return (
        <input
          className={inputCls}
          placeholder={field.placeholder}
          value={asString(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function FlowVersionSelect({
  value,
  onChange,
  ctx,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  ctx?: VersionContext;
}) {
  if (!ctx?.flowSelected) {
    return (
      <select className={inputCls} disabled value="">
        <option value="">— сначала выберите флоу —</option>
      </select>
    );
  }

  const { latest, versions } = ctx;
  const pinned = value === undefined || value === null || value === "" ? null : Number(value);
  const isStale = pinned !== null && latest !== undefined && pinned !== latest;
  // A pinned version that's no longer in the list (e.g. flow swapped out).
  const missing = pinned !== null && !versions.some((v) => v.version === pinned);

  const selectCls = isStale
    ? `${inputCls} border-amber-500/70 focus:border-amber-400`
    : inputCls;

  return (
    <>
      <select
        className={selectCls}
        value={pinned === null ? "" : String(pinned)}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      >
        <option value="">
          {latest !== undefined ? `Последняя (v${latest})` : "Последняя"}
        </option>
        {versions.map((v) => (
          <option key={v.version} value={String(v.version)}>
            v{v.version}
            {v.version === latest ? " · последняя" : ""}
          </option>
        ))}
        {missing && <option value={String(pinned)}>v{pinned} (недоступна)</option>}
      </select>
      {isStale && (
        <span className="text-[11px] text-amber-400">
          ⚠ Закреплена версия v{pinned}, а последняя — v{latest}.{" "}
          <button
            type="button"
            className="underline hover:text-amber-300"
            onClick={() => onChange(undefined)}
          >
            Использовать последнюю
          </button>
        </span>
      )}
    </>
  );
}

function ObjectListEditor({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}) {
  const itemFields = field.itemFields ?? [];

  function update(index: number, key: string, v: unknown) {
    const next = value.map((row, i) => (i === index ? { ...row, [key]: v } : row));
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((row, i) => (
        <div key={i} className="rounded-md border border-border bg-panel-2 p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase text-muted">#{i + 1}</span>
            <button
              type="button"
              className="text-muted hover:text-red-400"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {itemFields.map((sub) => (
              <FieldRow
                key={sub.key}
                field={sub}
                value={row[sub.key]}
                onChange={(v) => update(i, sub.key, v)}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="self-start text-xs text-accent hover:underline"
        onClick={() => onChange([...value, {}])}
      >
        {field.addLabel ?? "+ добавить"}
      </button>
    </div>
  );
}

function KeyValueEditor({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const rows = Object.entries(value);

  function setRows(next: [string, unknown][]) {
    onChange(Object.fromEntries(next.filter(([k]) => k !== "")));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex gap-1.5">
          <input
            className={`${inputCls} w-2/5`}
            placeholder="ключ"
            value={k}
            onChange={(e) => {
              const next = [...rows];
              next[i] = [e.target.value, v];
              setRows(next);
            }}
          />
          <input
            className={`${inputCls} flex-1`}
            placeholder="значение"
            value={asString(v)}
            onChange={(e) => {
              const next = [...rows];
              next[i] = [k, e.target.value];
              setRows(next);
            }}
          />
          <button
            type="button"
            className="px-2 text-muted hover:text-red-400"
            onClick={() => setRows(rows.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="self-start text-xs text-accent hover:underline"
        onClick={() => setRows([...rows, ["", ""]])}
      >
        + добавить
      </button>
    </div>
  );
}

function asString(value: unknown): string {
  if (value === undefined || value === null) return "";
  return typeof value === "string" ? value : String(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  return [];
}
