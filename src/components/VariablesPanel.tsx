import React from "react";
import type { Variable, VariableType } from "../types/chatbot";

interface VariablesPanelProps {
    variables: Variable[];
    onVariablesChange: (variables: Variable[]) => void;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({ variables, onVariablesChange }) => {
    const addVariable = () => {
        onVariablesChange([
            ...variables,
            { name: "", type: "string" },
        ]);
    };

    const updateVariable = (index: number, updates: Partial<Variable>) => {
        const newVariables = [...variables];
        newVariables[index] = { ...newVariables[index], ...updates };
        onVariablesChange(newVariables);
    };

    const removeVariable = (index: number) => {
        onVariablesChange(variables.filter((_, i) => i !== index));
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600 }}>Глобальные переменные</h3>
                <button
                    type="button"
                    onClick={addVariable}
                    style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                    }}
                >
                    + Добавить
                </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {variables.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>
                        Нет переменных. Добавьте переменную для использования в нодах.
                    </div>
                ) : (
                    variables.map((variable, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                                padding: 8,
                                background: "#f9fafb",
                                borderRadius: 6,
                            }}
                        >
                            <input
                                type="text"
                                value={variable.name}
                                onChange={(e) => updateVariable(index, { name: e.target.value })}
                                placeholder="Имя переменной"
                                style={{
                                    flex: 1,
                                    padding: 6,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 4,
                                    fontSize: 12,
                                }}
                            />
                            <select
                                value={variable.type}
                                onChange={(e) =>
                                    updateVariable(index, { type: e.target.value as VariableType })
                                }
                                style={{
                                    padding: 6,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 4,
                                    fontSize: 12,
                                    minWidth: 100,
                                }}
                            >
                                <option value="string">string</option>
                                <option value="number">number</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => removeVariable(index)}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: 12,
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VariablesPanel;

