import type React from "react";
import { handleMultiSelectClick } from "./multiSelectNodes";

export type MultiSelectResult = {
    newSelectedNodes: Set<string>;
    newActiveNodeId: string;
    newLastClickedNodeId: string;
};

export function handleCanvasNodeClick(
    event: React.MouseEvent,
    nodeId: string,
    selectedNodeIds: Set<string>,
    lastClickedNodeId: string | null,
): MultiSelectResult {
    if (event.shiftKey || event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
    }

    return handleMultiSelectClick(
        nodeId,
        event.shiftKey,
        event.ctrlKey,
        selectedNodeIds,
        lastClickedNodeId,
    );
}

export function handleCanvasNodeContextMenu(
    event: React.MouseEvent,
    nodeId: string,
    selectedNodeIds: Set<string>,
    lastClickedNodeId: string | null,
): MultiSelectResult | null {
    if (!event.shiftKey && !event.ctrlKey) {
        return null;
    }

    event.preventDefault();
    event.stopPropagation();

    return handleMultiSelectClick(
        nodeId,
        event.shiftKey,
        event.ctrlKey,
        selectedNodeIds,
        lastClickedNodeId,
    );
}
