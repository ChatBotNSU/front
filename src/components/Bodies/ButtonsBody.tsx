import React from "react";

export interface ButtonItem {
    label: string;
}

interface ButtonsBodyProps {
    buttons: ButtonItem[];
    onChange: (buttons: ButtonItem[]) => void;
}

const ButtonsBody: React.FC<ButtonsBodyProps> = ({ buttons, onChange }) => {
    const updateLabel = (index: number, label: string) => {
        const next = [...buttons];
        next[index] = { label };
        onChange(next);
    };

    const addButton = () => {
        onChange([...buttons, { label: "" }]);
    };

    const removeButton = (index: number) => {
        const next = buttons.filter((_, i) => i !== index);
        onChange(next);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {buttons.map((btn, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div
                        title={`Выход ${idx + 1}`}
                        style={{
                            minWidth: 22,
                            height: 22,
                            borderRadius: 11,
                            background: "#e5e7eb",
                            color: "#111827",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                        }}
                    >
                        {idx + 1}
                    </div>
                    <input
                        value={btn.label || ""}
                        onChange={(e) => updateLabel(idx, e.target.value)}
                        placeholder={`Кнопка ${idx + 1}`}
                        style={{
                            flex: 1,
                            padding: 6,
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                        }}
                    />
                    {buttons.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeButton(idx)}
                            style={{
                                padding: "4px 8px",
                                fontSize: 11,
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addButton}
                style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 500,
                }}
            >
                + Добавить кнопку
            </button>
        </div>
    );
};

export default ButtonsBody;


