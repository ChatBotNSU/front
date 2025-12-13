import React from "react";

interface DocumentBodyProps {
    data: { path: string; isVariable: boolean };
    onChange: (data: { path: string; isVariable: boolean }) => void;
}

const DocumentBody: React.FC<DocumentBodyProps> = ({ data, onChange }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                <input
                    type="checkbox"
                    checked={data.isVariable}
                    onChange={(e) => onChange({ ...data, isVariable: e.target.checked })}
                />
                <span>Переменная</span>
            </label>
            <input
                type="text"
                value={data.path}
                onChange={(e) => onChange({ ...data, path: e.target.value })}
                placeholder={data.isVariable ? "Имя переменной" : "Путь до файла"}
                style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }}
            />
        </div>
    );
};

export default DocumentBody;
