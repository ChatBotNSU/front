import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";

import type { FlowDetail } from "@/entities/flow/model/types";

import { useEditorHotkeys } from "../lib/useEditorHotkeys";
import { useEditorStore } from "../model/editorStore";
import { DemoChat } from "./DemoChat";
import { FlowCanvas } from "./FlowCanvas";
import { Inspector } from "./Inspector";
import { NodePalette } from "./NodePalette";
import { Toolbar } from "./Toolbar";

export function FlowEditor({ flow }: { flow: FlowDetail }) {
  const load = useEditorStore((s) => s.load);
  const [demoOpen, setDemoOpen] = useState(false);
  useEditorHotkeys();

  // Hydrate the editor store whenever a different flow is opened.
  useEffect(() => {
    load(flow);
  }, [flow.id, load]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <Toolbar flowId={flow.id} onDemo={() => setDemoOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <NodePalette />
          <div className="relative min-w-0 flex-1">
            <FlowCanvas />
            {demoOpen && <DemoChat flowId={flow.id} onClose={() => setDemoOpen(false)} />}
          </div>
          <Inspector />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
