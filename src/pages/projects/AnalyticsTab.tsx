import { useState } from "react";

import { useFlowDropoff, useProjectAnalytics } from "@/entities/analytics/api";
import { cn } from "@/shared/lib/cn";
import { Spinner } from "@/shared/ui";

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export function AnalyticsTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectAnalytics(projectId);
  const [selected, setSelected] = useState<string | null>(null);
  const { data: dropoff } = useFlowDropoff(selected ?? undefined);

  if (isLoading) return <Spinner />;
  if (!data) return <p className="text-muted">Нет данных.</p>;

  const t = data.totals;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Сессии" value={t.sessions} />
        <Stat label="Конверсия" value={pct(t.conversion_rate)} />
        <Stat label="Завершено" value={t.completed} />
        <Stat label="Сообщений" value={t.messages_sent} />
      </div>

      {t.sessions === 0 && (
        <p className="text-sm text-muted">
          Ещё нет ни одной сессии. Запусти флоу через ▶ Демо или подключи бота — статистика появится здесь.
        </p>
      )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted">По флоу</h3>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-panel-2 text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Флоу</th>
                <th className="px-3 py-2 text-right">Сессии</th>
                <th className="px-3 py-2 text-right">Конверсия</th>
                <th className="px-3 py-2 text-right">Сообщений</th>
              </tr>
            </thead>
            <tbody>
              {data.flows.map((f) => (
                <tr
                  key={f.flow_id}
                  onClick={() => setSelected(selected === f.flow_id ? null : f.flow_id)}
                  className={cn(
                    "cursor-pointer border-t border-border hover:bg-panel-2",
                    selected === f.flow_id && "bg-panel-2",
                  )}
                >
                  <td className="px-3 py-2">{f.name}</td>
                  <td className="px-3 py-2 text-right">{f.total_sessions}</td>
                  <td className="px-3 py-2 text-right">{pct(f.conversion_rate)}</td>
                  <td className="px-3 py-2 text-right">{f.messages_sent}</td>
                </tr>
              ))}
              {data.flows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-muted">
                    В проекте нет флоу.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-xs text-muted">Клик по строке — где пользователи останавливаются (drop-off).</p>
      </div>

      {selected && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted">Drop-off: где останавливаются</h3>
          {dropoff && dropoff.dropoff.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {dropoff.dropoff.map((d) => (
                <li
                  key={d.node_id}
                  className="flex items-center justify-between rounded-md border border-border bg-panel px-3 py-2 text-sm"
                >
                  <span>
                    {d.label || d.node_id}
                    {d.type && <span className="ml-2 text-xs text-muted">{d.type}</span>}
                  </span>
                  <span className="text-muted">{d.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Нет точек отвала (все доходят до конца или нет сессий).</p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
