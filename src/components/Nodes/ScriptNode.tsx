import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";

export type ScriptLanguage = "python";

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
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Язык: Python
                </div>
            </div>
        </BaseNode>
    );
};

export default ScriptNode;
