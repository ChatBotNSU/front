import React from "react";

interface BaseBodyProps {
    title?: string;
    editable?: boolean;
    onAddBlock?: () => void;
    onDelete?: () => void;
    onEditToggle?: () => void;
    children: React.ReactNode;
}

const BaseBody: React.FC<BaseBodyProps> = ({
    title,
    editable = false,
    onAddBlock,
    onDelete,
    onEditToggle,
    children,
}) => {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #ddd",
                padding: 10,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                position: "relative",
            }}
        >
            {/* Верхняя панель */}
            {title && (
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>{title}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                        {onEditToggle && (
                            <button onClick={onEditToggle} style={buttonStyle}>
                                ✏️
                            </button>
                        )}
                        {onAddBlock && (
                            <button onClick={onAddBlock} style={buttonStyle}>
                                ➕
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                style={{ ...buttonStyle, color: "red" }}
                            >
                                ❌
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Само содержимое */}
            <div style={{ paddingTop: 4 }}>{children}</div>

            {/* Если editable — можно подсветить */}
            {editable && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 8,
                        border: "1px dashed #aaa",
                        pointerEvents: "none",
                    }}
                />
            )}
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
