import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";

export interface SendMessageNodeData {
    label?: string;
}

interface SendMessageNodeProps {
    data: SendMessageNodeData;
}

const SendMessageNode = ({ data }: SendMessageNodeProps) => {
    return (
        <BaseNode
            data={{ label: data.label || "Send Message" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            <div style={{ fontSize: 12, color: "#6b7280" }}>
                Отправляет сообщение из SetMessage
            </div>
        </BaseNode>
    );
};

export default SendMessageNode;

