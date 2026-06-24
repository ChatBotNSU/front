import { useState } from "react";

import { useCreateSecret, useDeleteSecret, useSecrets } from "@/entities/secret/api";
import { Button, Field, fieldInput, Modal, Spinner, toast } from "@/shared/ui";

type Row = { k: string; v: string };
type Mode = "fields" | "json";

export function SecretsTab() {
  const { data: secrets, isLoading } = useSecrets();
  const createSecret = useCreateSecret();
  const deleteSecret = useDeleteSecret();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("fields");
  const [name, setName] = useState("");
  const [rows, setRows] = useState<Row[]>([{ k: "", v: "" }]);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setMode("fields");
    setName("");
    setRows([{ k: "", v: "" }]);
    setJsonText("");
    setError(null);
  }

  async function create() {
    if (!name.trim()) {
      setError("Укажите имя");
      return;
    }
    let value: Record<string, unknown>;
    if (mode === "json") {
      const raw = jsonText.trim();
      if (!raw) {
        setError("Вставьте JSON-объект");
        return;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        setError(`Некорректный JSON: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setError("JSON должен быть объектом (например, ключ Google service-account)");
        return;
      }
      value = parsed as Record<string, unknown>;
    } else {
      value = Object.fromEntries(
        rows.filter((r) => r.k.trim()).map((r) => [r.k.trim(), r.v]),
      );
    }
    try {
      await createSecret.mutateAsync({ name: name.trim(), value });
      toast.success("Секрет сохранён");
      reset();
    } catch {
      setError("Не удалось сохранить");
    }
  }

  async function remove(secretName: string) {
    if (!window.confirm(`Удалить секрет «${secretName}»?`)) return;
    try {
      await deleteSecret.mutateAsync(secretName);
      toast.success("Секрет удалён");
    } catch {
      toast.error("Не удалось удалить");
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">
          Секреты аккаунта (общие для всех проектов). Значения шифруются и наружу не отдаются — на них
          ссылаются ноды через <span className="font-mono">secret_ref</span>.
        </p>
        <Button onClick={() => setOpen(true)}>+ Секрет</Button>
      </div>

      {secrets && secrets.length === 0 && <p className="text-muted">Пока нет секретов.</p>}

      <ul className="grid gap-2">
        {secrets?.map((s) => (
          <li
            key={s.id}
            className="group flex items-center justify-between rounded-lg border border-border bg-panel px-4 py-3"
          >
            <div>
              <span className="font-mono text-sm">{s.name}</span>
              <span className="ml-2 text-xs text-muted">обновлён {s.updated_at.slice(0, 10)}</span>
            </div>
            <button
              onClick={() => remove(s.name)}
              className="text-xs text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <Modal title="Новый секрет" onClose={reset}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
            className="flex flex-col gap-4"
          >
            <Field label="Имя (для secret_ref)">
              <input className={fieldInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="sheets-sa" autoFocus />
            </Field>

            <div className="flex gap-1.5 rounded-md bg-panel-2 p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode("fields")}
                className={`flex-1 rounded px-2 py-1 ${mode === "fields" ? "bg-panel text-slate-100" : "text-muted hover:text-slate-200"}`}
              >
                Поля
              </button>
              <button
                type="button"
                onClick={() => setMode("json")}
                className={`flex-1 rounded px-2 py-1 ${mode === "json" ? "bg-panel text-slate-100" : "text-muted hover:text-slate-200"}`}
              >
                JSON
              </button>
            </div>

            {mode === "fields" ? (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted">Значения</span>
                <div className="flex flex-col gap-1.5">
                  {rows.map((row, i) => (
                    <div key={i} className="flex gap-1.5">
                      <input
                        className={`${fieldInput} w-2/5`}
                        placeholder="ключ"
                        value={row.k}
                        onChange={(e) =>
                          setRows(rows.map((r, j) => (j === i ? { ...r, k: e.target.value } : r)))
                        }
                      />
                      <input
                        className={`${fieldInput} flex-1`}
                        placeholder="значение"
                        value={row.v}
                        onChange={(e) =>
                          setRows(rows.map((r, j) => (j === i ? { ...r, v: e.target.value } : r)))
                        }
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
                </div>
                <button
                  type="button"
                  className="mt-1 self-start text-xs text-accent hover:underline"
                  onClick={() => setRows([...rows, { k: "", v: "" }])}
                >
                  + поле
                </button>
                <p className="mt-1 text-[11px] text-muted">
                  Например: <span className="font-mono">base_url</span>,{" "}
                  <span className="font-mono">token</span> для CRM.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted">JSON-объект</span>
                <textarea
                  className={`${fieldInput} h-56 font-mono text-xs`}
                  spellCheck={false}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='{\n  "type": "service_account",\n  "client_email": "...",\n  "private_key": "..."\n}'
                />
                <p className="mt-1 text-[11px] text-muted">
                  Для Google Sheets — вставьте сюда содержимое JSON-файла сервисного аккаунта целиком.
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={reset}>
                Отмена
              </Button>
              <Button type="submit" disabled={createSecret.isPending}>
                Сохранить
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
