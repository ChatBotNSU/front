import { useState } from "react";

import { useCreateSecret, useDeleteSecret, useSecrets } from "@/entities/secret/api";
import { Button, Field, fieldInput, Modal, Spinner, toast } from "@/shared/ui";

type Row = { k: string; v: string };

export function SecretsTab() {
  const { data: secrets, isLoading } = useSecrets();
  const createSecret = useCreateSecret();
  const deleteSecret = useDeleteSecret();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rows, setRows] = useState<Row[]>([{ k: "", v: "" }]);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setName("");
    setRows([{ k: "", v: "" }]);
    setError(null);
  }

  async function create() {
    if (!name.trim()) {
      setError("Укажите имя");
      return;
    }
    const value = Object.fromEntries(rows.filter((r) => r.k.trim()).map((r) => [r.k.trim(), r.v]));
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
              <input className={fieldInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="my-bitrix" autoFocus />
            </Field>

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
