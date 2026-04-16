import React, { useState } from "react";
import { IconX } from "@tabler/icons-react";

interface BaseBodyProps {
    title?: string;
    onDelete?: () => void;
    children: React.ReactNode;
}

const BaseBody: React.FC<BaseBodyProps> = ({ title, onDelete, children }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                border: "2px solid #3B82F6",
                padding: 10,
                position: "relative",
            }}
        >
            {/* Верхняя панель */}
            {title && (
                <div
                    style={{
                        fontSize: 14,
                        marginBottom: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>{title}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                style={{
                                    ...buttonStyle,
                                    color: "#ef4444",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <IconX
                                    size={16}
                                    stroke={2}
                                    color={hovered ? "#ef4444" : "#8B8B8B"}
                                    onMouseEnter={() => setHovered(true)}
                                    onMouseLeave={() => setHovered(false)}
                                    style={{ cursor: "pointer" }}
                                />{" "}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div style={{ paddingTop: 4 }}>{children}</div>
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
};

export default BaseBody;
