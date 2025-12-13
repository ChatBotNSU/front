import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";

export interface WaitNodeData {
    label?: string;
    delay: number; // в секундах
    onChange?: (newData: WaitNodeData) => void;
}

interface WaitNodeProps {
    data: WaitNodeData;
}

const WaitNode = ({ data }: WaitNodeProps) => {
    return (
        <BaseNode
            data={{ label: data.label || "Wait" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12 }}>Задержка (сек)</label>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <button
                        type="button"
                        onClick={() => {
                            const newValue = Math.max(0, (data.delay || 0) - 0.1);
                            data.onChange?.({
                                ...data,
                                delay: Math.round(newValue * 10) / 10,
                            });
                        }}
                        style={{
                            padding: "6px 12px",
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            background: "#f9fafb",
                            cursor: "pointer",
                            fontSize: 16,
                            fontWeight: 600,
                        }}
                    >
                        −
                    </button>
                    <input
                        type="text"
                        value={data.delay}
                        onChange={(e) => {
                            const val = e.target.value;
                            const num = parseFloat(val);
                            if (val === "" || (!isNaN(num) && num >= 0)) {
                                data.onChange?.({
                                    ...data,
                                    delay: val === "" ? 0 : num,
                                });
                            }
                        }}
                        onBlur={(e) => {
                            const val = e.target.value;
                            const num = parseFloat(val);
                            if (isNaN(num) || num < 0) {
                                data.onChange?.({
                                    ...data,
                                    delay: 0,
                                });
                            }
                        }}
                        style={{
                            flex: 1,
                            padding: 6,
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            textAlign: "center",
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const newValue = (data.delay || 0) + 0.1;
                            data.onChange?.({
                                ...data,
                                delay: Math.round(newValue * 10) / 10,
                            });
                        }}
                        style={{
                            padding: "6px 12px",
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            background: "#f9fafb",
                            cursor: "pointer",
                            fontSize: 16,
                            fontWeight: 600,
                        }}
                    >
                        +
                    </button>
                </div>
            </div>
        </BaseNode>
    );
};

export default WaitNode;

