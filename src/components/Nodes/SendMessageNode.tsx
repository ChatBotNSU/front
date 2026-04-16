import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";
import { IconSend } from "@tabler/icons-react";

export interface SendMessageNodeData {
    label?: string;
}

interface SendMessageNodeProps {
    data: SendMessageNodeData;
}

const SendMessageNode = ({ data }: SendMessageNodeProps) => {
    return (
        <BaseNode
            data={data}
            hideDefaultLabel
            styleOverrides={{
                maxWidth: 150,
                padding: 12,
            }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                }}
            >
                <span
                    style={{
                        fontSize: 14,
                        lineHeight: "16px",
                        wordBreak: "break-word",
                        flex: 1,
                    }}
                >
                    {data.label || "Send message"}
                </span>

                <IconSend size={20} color="#3b82f6" />
            </div>
        </BaseNode>
    );
};

export default SendMessageNode;
