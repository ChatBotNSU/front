import React, { useEffect } from "react";
import { NODE_ITEMS } from "./NodeBar";

type NodeType = (typeof NODE_ITEMS)[number]["key"];

interface NodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    position?: { x: number; y: number };
}

const NodeModal: React.FC<NodeModalProps> = ({
    isOpen,
    onClose,
    position = { x: 50, y: 50 },
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleNodeCreated = () => {
            onClose();
        };

        window.addEventListener("nodeCreated", handleNodeCreated);
        return () =>
            window.removeEventListener("nodeCreated", handleNodeCreated);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
        const payload = { nodeType };
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
            "application/reactflow",
            JSON.stringify(payload),
        );
    };

    return (
        <div
            style={{
                position: "fixed",
                top: `${position.y}px`,
                left: `${position.x}px`,
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: 12,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                zIndex: 100,
                minWidth: 250,
                maxHeight: 400,
                overflowY: "auto",
                pointerEvents: "auto",
            }}
        >
            <div style={{ padding: 12 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#374151",
                        }}
                    >
                        Перетащи ноду на канвас
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            color: "#6b7280",
                            padding: 0,
                            width: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                    }}
                >
                    {NODE_ITEMS.map((n) => (
                        <div
                            key={n.key}
                            draggable
                            onDragStart={(e) => {
                                handleDragStart(e, n.key as NodeType);
                                (
                                    e.currentTarget as HTMLDivElement
                                ).style.opacity = "0.5";
                            }}
                            onDragEnd={(e) => {
                                (
                                    e.currentTarget as HTMLDivElement
                                ).style.opacity = "1";
                            }}
                            onMouseEnter={(e) => {
                                (
                                    e.currentTarget as HTMLDivElement
                                ).style.background = "#f3f4f6";
                                (
                                    e.currentTarget as HTMLDivElement
                                ).style.borderColor = "#2563eb";
                            }}
                            onMouseLeave={(e) => {
                                (
                                    e.currentTarget as HTMLDivElement
                                ).style.background = "white";
                                (
                                    e.currentTarget as HTMLDivElement
                                ).style.borderColor = "#e5e7eb";
                            }}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                background: "white",
                                cursor: "grab",
                                textAlign: "left",
                                fontSize: 13,
                                transition: "all 0.2s",
                                userSelect: "none",
                            }}
                        >
                            {n.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NodeModal;
