import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";

export type ScriptLanguage = "python" | "javascript";

export interface ScriptNodeData {
    label?: string;
    script: string;
    language: ScriptLanguage;
    onChange?: (newData: ScriptNodeData) => void;
}

interface ScriptNodeProps {
    data: ScriptNodeData;
}

const ScriptNode = ({ data }: ScriptNodeProps) => {
    return (
        <BaseNode
            data={{ label: data.label || "Script Node" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <select
                    value={data.language}
                    onChange={(e) =>
                        data.onChange?.({
                            ...data,
                            language: e.target.value as ScriptLanguage,
                        })
                    }
                    style={{
                        padding: 6,
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: 12,
                    }}
                >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                </select>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Язык: {data.language === "python" ? "Python" : "JavaScript"}
                </div>
            </div>
        </BaseNode>
    );
};

export default ScriptNode;

