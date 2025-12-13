import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";

export interface TextAnswerNodeData {
    label?: string;
    variable: string;
    onChange?: (newData: TextAnswerNodeData) => void;
}

interface TextAnswerNodeProps {
    data: TextAnswerNodeData;
}

const TextAnswerNode = ({ data }: TextAnswerNodeProps) => {
    return (
        <BaseNode
            data={{ label: data.label || "Text Answer" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Переменная</label>
                <input
                    type="text"
                    value={data.variable}
                    onChange={(e) =>
                        data.onChange?.({
                            ...data,
                            variable: e.target.value,
                        })
                    }
                    placeholder="Имя переменной для текста"
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

export default TextAnswerNode;

