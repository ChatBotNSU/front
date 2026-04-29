/**
 * Multi-select node management utility
 * Handles selection of multiple nodes using Shift+Click
 */

export class MultiSelectManager {
    private selectedNodes: Set<string>;
    private lastClickedNodeId: string | null;

    constructor() {
        this.selectedNodes = new Set();
        this.lastClickedNodeId = null;
    }

    /**
     * Handle node click with support for multi-select
     * @param nodeId - ID of the clicked node
     * @param isShiftPressed - Whether Shift key was pressed
     * @param isCtrlPressed - Whether Ctrl key was pressed (for bonus feature)
     * @returns The primary active node ID (single selection or shift-range start)
     */
    handleNodeClick(
        nodeId: string,
        isShiftPressed: boolean,
        isCtrlPressed: boolean = false,
    ): string {
        if (isShiftPressed && this.lastClickedNodeId) {
            // Shift+Click: range selection would require node ordering
            // For now, add to selection
            this.selectedNodes.add(nodeId);
            this.selectedNodes.add(this.lastClickedNodeId);
        } else if (isCtrlPressed) {
            // Ctrl+Click: toggle selection
            if (this.selectedNodes.has(nodeId)) {
                this.selectedNodes.delete(nodeId);
            } else {
                this.selectedNodes.add(nodeId);
            }
        } else {
            // Regular click: clear and select only this node
            this.selectedNodes.clear();
            this.selectedNodes.add(nodeId);
        }

        this.lastClickedNodeId = nodeId;
        return nodeId;
    }

    /**
     * Get all selected node IDs
     */
    getSelectedNodes(): string[] {
        return Array.from(this.selectedNodes);
    }

    /**
     * Check if a node is selected
     */
    isNodeSelected(nodeId: string): boolean {
        return this.selectedNodes.has(nodeId);
    }

    /**
     * Clear all selections
     */
    clearSelection(): void {
        this.selectedNodes.clear();
        this.lastClickedNodeId = null;
    }

    /**
     * Set multiple nodes as selected
     */
    setSelectedNodes(nodeIds: string[]): void {
        this.selectedNodes.clear();
        nodeIds.forEach((id) => this.selectedNodes.add(id));
    }

    /**
     * Add a node to selection
     */
    addToSelection(nodeId: string): void {
        this.selectedNodes.add(nodeId);
    }

    /**
     * Remove a node from selection
     */
    removeFromSelection(nodeId: string): void {
        this.selectedNodes.delete(nodeId);
    }

    /**
     * Get the last clicked node
     */
    getLastClickedNode(): string | null {
        return this.lastClickedNodeId;
    }

    /**
     * Get selection count
     */
    getSelectionCount(): number {
        return this.selectedNodes.size;
    }
}

/**
 * Hook-compatible state management for React
 * This is a helper function to work with React state
 */
export function handleMultiSelectClick(
    nodeId: string,
    isShiftPressed: boolean,
    isCtrlPressed: boolean,
    selectedNodes: Set<string>,
    lastClickedNodeId: string | null,
): {
    newSelectedNodes: Set<string>;
    newActiveNodeId: string;
    newLastClickedNodeId: string;
} {
    const newSelectedNodes = new Set(selectedNodes);

    if (isShiftPressed && lastClickedNodeId) {
        // Shift+Click: add to selection
        newSelectedNodes.add(nodeId);
        newSelectedNodes.add(lastClickedNodeId);
    } else if (isCtrlPressed) {
        // Ctrl+Click: toggle selection
        if (newSelectedNodes.has(nodeId)) {
            newSelectedNodes.delete(nodeId);
        } else {
            newSelectedNodes.add(nodeId);
        }
    } else {
        // Regular click: clear and select only this node
        newSelectedNodes.clear();
        newSelectedNodes.add(nodeId);
    }

    return {
        newSelectedNodes,
        newActiveNodeId: nodeId,
        newLastClickedNodeId: nodeId,
    };
}
