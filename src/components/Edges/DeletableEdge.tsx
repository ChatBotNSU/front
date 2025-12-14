import { getBezierPath, type EdgeProps } from "react-flow-renderer";

type DeletableEdgeData = {
    onDelete?: (id: string) => void;
};

const DeletableEdge = (props: EdgeProps<DeletableEdgeData>) => {
    const {
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        markerEnd,
        selected,
        style,
        data,
    } = props;

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    return (
        <g>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd as any}
                style={{
                    stroke: selected
                        ? "#2563eb"
                        : (style as any)?.stroke || "#94a3b8",
                    strokeWidth: selected ? 2.5 : 2,
                    fill: "none",
                    ...style,
                }}
            />
            {selected && (
                <g transform={`translate(${labelX}, ${labelY})`}>
                    <foreignObject
                        x={-12}
                        y={-12}
                        width={24}
                        height={24}
                        requiredExtensions="http://www.w3.org/1999/xhtml"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                data?.onDelete?.(id);
                            }}
                            title="Удалить связь"
                            style={{
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: 12,
                                width: 24,
                                height: 24,
                                cursor: "pointer",
                                fontWeight: 700,
                                lineHeight: "24px",
                                textAlign: "center",
                            }}
                        >
                            ×
                        </button>
                    </foreignObject>
                </g>
            )}
        </g>
    );
};

export default DeletableEdge;
