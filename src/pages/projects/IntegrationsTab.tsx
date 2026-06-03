import { useState } from "react";

import {
  PROVIDER_OPTIONS,
  useDeleteIntegration,
  useIntegrations,
  useUpsertIntegration,
  type IntegrationKind,
} from "@/entities/integration/api";
import { useSecrets } from "@/entities/secret/api";
import { Button, Field, fieldInput, Modal, Spinner, toast } from "@/shared/ui";

const KIND_LABEL: Record<IntegrationKind, string> = {
  provider: "Провайдер",
  http: "HTTP",
  db: "База данных",
};

export function IntegrationsTab({ projectId }: { projectId: string }) {
  const { data: integrations, isLoading } = useIntegrations(projectId);
  const { data: secrets } = useSecrets();
  const upsert = useUpsertIntegration(projectId);
  const remove = useDeleteIntegration(projectId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<IntegrationKind>("provider");
  const [provider, setProvider] = useState("bitrix24");
  const [baseUrl, setBaseUrl] = useState("");
  const [driver, setDriver] = useState("postgresql+asyncpg");
  const [secretRef, setSecretRef] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setName("");
    setKind("provider");
    setProvider("bitrix24");
    setBaseUrl("");
    setDriver("postgresql+asyncpg");
    setSecretRef("");
    setError(null);
  }

  function buildConfig(): Record<string, unknown> {
    const cfg: Record<string, unknown> = {};
    if (kind === "provider") cfg.provider = provider;
    if (kind === "http") cfg.base_url = baseUrl;
    if (kind === "db") cfg.driver = driver;
    if (secretRef) cfg.secret_ref = secretRef;
    return cfg;
  }

  async function save() {
    if (!name.trim()) {
      setError("Укажите имя");
      return;
    }
    try {
      await upsert.mutateAsync({ name: name.trim(), kind, config: buildConfig() });
      toast.success("Интеграция сохранена");
      reset();
    } catch {
      setError("Не удалось сохранить");
    }
  }

  async function removeIntegration(intName: string) {
    if (!window.confirm(`Удалить интеграцию «${intName}»?`)) return;
    try {
      await remove.mutateAsync(intName);
      toast.success("Интеграция удалена");
    } catch {
      toast.error("Не удалось удалить");
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">
          Именованные подключения проекта. Нода ссылается по имени (поле{" "}
          <span className="font-mono">integration</span>) — провайдер и креды подставятся автоматически.
        </p>
        <Button onClick={() => setOpen(true)}>+ Интеграция</Button>
      </div>

      {integrations && integrations.length === 0 && <p className="text-muted">Пока нет интеграций.</p>}

      <ul className="grid gap-2">
        {integrations?.map((it) => (
          <li
            key={it.id}
            className="group flex items-center justify-between rounded-lg border border-border bg-panel px-4 py-3"
          >
            <div>
              <span className="font-medium">{it.name}</span>
              <span className="ml-2 rounded bg-panel-2 px-1.5 py-0.5 text-[10px] uppercase text-muted">
                {KIND_LABEL[it.kind]}
              </span>
              <div className="mt-0.5 text-xs text-muted">
                {summary(it.config)}
                {typeof it.config.secret_ref === "string" && it.config.secret_ref && (
                  <span> · секрет: <span className="font-mono">{String(it.config.secret_ref)}</span></span>
                )}
              </div>
            </div>
            <button
              onClick={() => removeIntegration(it.name)}
              className="text-xs text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <Modal title="Новая интеграция" onClose={reset}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="flex flex-col gap-4"
          >
            <Field label="Имя (для поля integration)">
              <input className={fieldInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="main-bitrix" autoFocus />
            </Field>
            <Field label="Тип">
              <select className={fieldInput} value={kind} onChange={(e) => setKind(e.target.value as IntegrationKind)}>
                <option value="provider">Провайдер (CRM / оплата / календарь)</option>
                <option value="http">HTTP-эндпоинт</option>
                <option value="db">Внешняя БД</option>
              </select>
            </Field>

            {kind === "provider" && (
              <Field label="Провайдер">
                <select className={fieldInput} value={provider} onChange={(e) => setProvider(e.target.value)}>
                  {PROVIDER_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {kind === "http" && (
              <Field label="Base URL">
                <input className={fieldInput} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.example.com" />
              </Field>
            )}
            {kind === "db" && (
              <Field label="Драйвер">
                <input className={fieldInput} value={driver} onChange={(e) => setDriver(e.target.value)} />
              </Field>
            )}

            <Field label="Секрет (креды)">
              <select className={fieldInput} value={secretRef} onChange={(e) => setSecretRef(e.target.value)}>
                <option value="">— без секрета —</option>
                {secrets?.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            {secrets && secrets.length === 0 && (
              <p className="-mt-2 text-[11px] text-muted">Сначала создайте секрет во вкладке «Секреты».</p>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={reset}>
                Отмена
              </Button>
              <Button type="submit" disabled={upsert.isPending}>
                Сохранить
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function summary(config: Record<string, unknown>): string {
  if (config.provider) return `провайдер: ${String(config.provider)}`;
  if (config.base_url) return String(config.base_url);
  if (config.driver) return `БД: ${String(config.driver)}`;
  return "";
}
