/**
 * Node wrapper HOC to add visual selection highlighting
 * Wraps node components to display multi-select state
 */
import React from "react";
import type { Node } from "@xyflow/react";

export function withMultiSelectHighlight<P extends {}>(
    Component: React.ComponentType<P>,
    nodeId: string,
    isSelected: boolean,
): React.ReactNode {
    const Wrapper = (props: P) => {
        return (
            <div
                style={{
                    outline: isSelected ? "3px solid #3b82f6" : "none",
                    outlineOffset: isSelected ? "2px" : "0px",
                    borderRadius: "8px",
                    transition: "outline 0.2s ease",
                    boxShadow: isSelected
                        ? "0 0 0 2px #1e40af"
                        : "none",
                }}
            >
                <Component {...props} />
            </div>
        );
    };

    return <Wrapper />;
}

/**
 * Get selection highlight style based on selection state
 */
export function getNodeHighlightStyle(isSelected: boolean): React.CSSProperties {
    return {
        outline: isSelected ? "3px solid #3b82f6" : "none",
        outlineOffset: isSelected ? "2px" : "0px",
        borderRadius: "8px",
        transition: "outline 0.2s ease",
        boxShadow: isSelected ? "0 0 0 2px #1e40af" : "none",
    };
}

/**
 * Get batch node style updates for multi-selected nodes
 * Call this to update all nodes with their selection state
 */
export function applySelectionStylesToNodes(
    nodes: Node[],
    selectedNodeIds: Set<string>,
): Node[] {
    return nodes.map((node) => {
        const isSelected = selectedNodeIds.has(node.id);
        return {
            ...node,
            style: {
                ...node.style,
                outline: isSelected ? "3px solid #3b82f6" : "none",
                outlineOffset: isSelected ? "2px" : "0px",
                borderRadius: "8px",
                boxShadow: isSelected ? "0 0 0 2px #1e40af" : "none",
                transition: "outline 0.2s ease, box-shadow 0.2s ease",
            },
        };
    });
}
