import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useProject } from "@/entities/project/api";
import { cn } from "@/shared/lib/cn";
import { Spinner } from "@/shared/ui";

import { AnalyticsTab } from "./AnalyticsTab";
import { BotsTab } from "./BotsTab";
import { FlowsTab } from "./FlowsTab";
import { IntegrationsTab } from "./IntegrationsTab";
import { SecretsTab } from "./SecretsTab";

type Tab = "flows" | "bots" | "analytics" | "integrations" | "secrets";

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const [tab, setTab] = useState<Tab>("flows");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link to="/projects" className="text-sm text-muted hover:text-slate-200">
        ← Проекты
      </Link>
      <h1 className="mb-5 mt-2 text-2xl font-semibold">{project?.name}</h1>

      <div className="mb-5 flex gap-1 border-b border-border">
        <TabButton active={tab === "flows"} onClick={() => setTab("flows")}>
          Флоу
        </TabButton>
        <TabButton active={tab === "bots"} onClick={() => setTab("bots")}>
          Боты
        </TabButton>
        <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>
          Аналитика
        </TabButton>
        <TabButton active={tab === "integrations"} onClick={() => setTab("integrations")}>
          Интеграции
        </TabButton>
        <TabButton active={tab === "secrets"} onClick={() => setTab("secrets")}>
          Секреты
        </TabButton>
      </div>

      {projectId && tab === "flows" && <FlowsTab projectId={projectId} />}
      {projectId && tab === "bots" && <BotsTab projectId={projectId} />}
      {projectId && tab === "analytics" && <AnalyticsTab projectId={projectId} />}
      {projectId && tab === "integrations" && <IntegrationsTab projectId={projectId} />}
      {tab === "secrets" && <SecretsTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
        active ? "border-accent text-slate-100" : "border-transparent text-muted hover:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}
