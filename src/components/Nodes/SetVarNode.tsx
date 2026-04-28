import BaseNode from "./BaseNode";
import { Position } from "@xyflow/react";

export type SetVarOperation = "=" | "+=" | "-=" | "*=" | "/=" | "%=";

export interface SetVarNodeData {
    label?: string;
    assigned_variable: string;
    operation: SetVarOperation;
    operand: string;
    onChange?: (newData: SetVarNodeData) => void;
}

interface SetVarNodeProps {
    data: SetVarNodeData;
}

const SetVarNode = ({ data }: SetVarNodeProps) => {
    const operations: SetVarOperation[] = ["=", "+=", "-=", "*=", "/=", "%="];

    return (
        <BaseNode
            data={{ label: data.label || "Set Var" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                    <label style={{ fontSize: 11, fontWeight: 600 }}>
                        Переменная
                    </label>
                    <input
                        type="text"
                        value={data.assigned_variable}
                        onChange={(e) =>
                            data.onChange?.({
                                ...data,
                                assigned_variable: e.target.value,
                            })
                        }
                        placeholder="Имя переменной"
                        style={{
                            padding: 6,
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            fontSize: 12,
                        }}
                    />
                </div>
                <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                    <label style={{ fontSize: 11, fontWeight: 600 }}>
                        Операция
                    </label>
                    <select
                        value={data.operation}
                        onChange={(e) =>
                            data.onChange?.({
                                ...data,
                                operation: e.target.value as SetVarOperation,
                            })
                        }
                        style={{
                            padding: 6,
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            fontSize: 12,
                        }}
                    >
                        {operations.map((op) => (
                            <option key={op} value={op}>
                                {op}
                            </option>
                        ))}
                    </select>
                </div>
                <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                    <label style={{ fontSize: 11, fontWeight: 600 }}>
                        Операнд
                    </label>
                    <input
                        type="text"
                        value={data.operand}
                        onChange={(e) =>
                            data.onChange?.({
                                ...data,
                                operand: e.target.value,
                            })
                        }
                        placeholder="Значение или переменная"
                        style={{
                            padding: 6,
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            fontSize: 12,
                        }}
                    />
                </div>
            </div>
        </BaseNode>
    );
};

export default SetVarNode;
