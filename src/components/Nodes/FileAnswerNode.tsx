import BaseNode from "./BaseNode";
import { Position } from "@xyflow/react";

export interface FileAnswerNodeData {
    label?: string;
    variable: string;
    onChange?: (newData: FileAnswerNodeData) => void;
}

interface FileAnswerNodeProps {
    data: FileAnswerNodeData;
}

const FileAnswerNode = ({ data }: FileAnswerNodeProps) => {
    return (
        <BaseNode
            data={{ label: data.label || "File Answer" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>
                    Переменная
                </label>
                <input
                    type="text"
                    value={data.variable}
                    onChange={(e) =>
                        data.onChange?.({
                            ...data,
                            variable: e.target.value,
                        })
                    }
                    placeholder="Имя переменной для файла"
                    style={{
                        padding: 6,
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: 12,
                    }}
                />
            </div>
        </BaseNode>
    );
};

export default FileAnswerNode;
