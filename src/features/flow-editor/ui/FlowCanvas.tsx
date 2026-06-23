import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type EdgeMouseHandler,
  type NodeMouseHandler,
} from "@xyflow/react";
import { useCallback, useMemo } from "react";

import { nodeColor, type NodeType } from "@/entities/node/model/types";

import { useEditorStore } from "../model/editorStore";
import type { EditorEdge, EditorNode } from "../model/types";
import { FlowNode } from "./nodes/FlowNode";

import "@xyflow/react/dist/style.css";

export const DND_MIME = "application/flow-node-type";

export function FlowCanvas() {
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const onNodesChange = useEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
  const onConnect = useEditorStore((s) => s.onConnect);
  const addNode = useEditorStore((s) => s.addNode);
  const select = useEditorStore((s) => s.select);

  const { screenToFlowPosition } = useReactFlow();
  const nodeTypes = useMemo(() => ({ flowNode: FlowNode }), []);

  const onNodeClick = useCallback<NodeMouseHandler<EditorNode>>(
    (_, node) => select({ kind: "node", id: node.id }),
    [select],
  );
  const onEdgeClick = useCallback<EdgeMouseHandler<EditorEdge>>(
    (_, edge) => select({ kind: "edge", id: edge.id }),
    [select],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData(DND_MIME) as NodeType;
      if (!type) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(type, position);
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <div className="h-full w-full" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={() => select(null)}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: false }}
      >
        <Background color="#2a2f3a" gap={20} />
        <Controls className="!bg-panel !border-border" />
        <MiniMap
          pannable
          zoomable
          className="!bg-panel-2 !border !border-border overflow-hidden rounded-md"
          maskColor="rgba(15,17,23,0.6)"
          nodeColor={(n) => nodeColor((n.data as { nodeType: NodeType }).nodeType)}
          nodeStrokeColor="#0f1117"
          nodeStrokeWidth={3}
          nodeBorderRadius={4}
        />
      </ReactFlow>
    </div>
  );
}
