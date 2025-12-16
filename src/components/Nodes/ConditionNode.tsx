import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";

export type ConditionOperator =
    | "=="
    | "!="
    | ">"
    | "<"
    | ">="
    | "<="
    | "contains"
    | "startsWith"
    | "endsWith";

export interface ConditionBranch {
    condition: {
        variable: string;
        operator: ConditionOperator;
        value: string;
    };
}

export interface ConditionNodeData {
    label?: string;
    branches: ConditionBranch[];
    onChange?: (newData: ConditionNodeData) => void;
    availableVariables?: string[];
}

interface ConditionNodeProps {
    data: ConditionNodeData;
}

const ConditionNode = ({ data }: ConditionNodeProps) => {
    const operators: ConditionOperator[] = [
        "==",
        "!=",
        ">",
        "<",
        ">=",
        "<=",
        "contains",
        "startsWith",
        "endsWith",
    ];

    return (
        <BaseNode
            data={{ label: data.label || "Condition" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: data.branches.length, position: Position.Bottom },
            ]}
            showBottomIndices={true}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.branches.map((branch, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            padding: 8,
                            background: "#f3f4f6",
                            borderRadius: 6,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                            }}
                        >
                            Условие {idx + 1}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 4,
                                alignItems: "center",
                            }}
                        >
                            <div style={{ position: "relative", flex: 1 }}>
                                <input
                                    type="text"
                                    list={`vars-cond-${idx}`}
                                    value={branch.condition.variable}
                                    onChange={(e) => {
                                        const newBranches = [...data.branches];
                                        newBranches[idx] = {
                                            ...branch,
                                            condition: {
                                                ...branch.condition,
                                                variable: e.target.value,
                                            },
                                        };
                                        data.onChange?.({
                                            ...data,
                                            branches: newBranches,
                                        });
                                    }}
                                    placeholder="Переменная"
                                    style={{
                                        flex: 1,
                                        padding: 4,
                                        border: "1px solid #d1d5db",
                                        borderRadius: 4,
                                        fontSize: 11,
                                        width: "100%",
                                        boxSizing: "border-box",
                                    }}
                                />
                                <datalist id={`vars-cond-${idx}`}>
                                    {data.availableVariables?.map((v) => (
                                        <option key={v} value={v} />
                                    ))}
                                </datalist>
                            </div>
                            <select
                                value={branch.condition.operator}
                                onChange={(e) => {
                                    const newBranches = [...data.branches];
                                    newBranches[idx] = {
                                        ...branch,
                                        condition: {
                                            ...branch.condition,
                                            operator: e.target
                                                .value as ConditionOperator,
                                        },
                                    };
                                    data.onChange?.({
                                        ...data,
                                        branches: newBranches,
                                    });
                                }}
                                style={{
                                    padding: 4,
                                    border: "1px solid #d1d5db",
                                    borderRadius: 4,
                                    fontSize: 11,
                                }}
                            >
                                {operators.map((op) => (
                                    <option key={op} value={op}>
                                        {op}
                                    </option>
                                ))}
                            </select>
                            <div style={{ position: "relative", flex: 1 }}>
                                <input
                                    type="text"
                                    list={`vars-value-${idx}`}
                                    value={branch.condition.value}
                                    onChange={(e) => {
                                        const newBranches = [...data.branches];
                                        newBranches[idx] = {
                                            ...branch,
                                            condition: {
                                                ...branch.condition,
                                                value: e.target.value,
                                            },
                                        };
                                        data.onChange?.({
                                            ...data,
                                            branches: newBranches,
                                        });
                                    }}
                                    placeholder="Значение"
                                    style={{
                                        flex: 1,
                                        padding: 4,
                                        border: "1px solid #d1d5db",
                                        borderRadius: 4,
                                        fontSize: 11,
                                        width: "100%",
                                        boxSizing: "border-box",
                                    }}
                                />
                                <datalist id={`vars-value-${idx}`}>
                                    {data.availableVariables?.map((v) => (
                                        <option key={v} value={v} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </BaseNode>
    );
};

export default ConditionNode;
