import { useEffect, useState } from "react";
import BaseNode from "./BaseNode";
import { Position } from "@xyflow/react";

export interface WaitNodeData {
    label?: string;
    delay: number;
    onChange?: (newData: WaitNodeData) => void;
}

interface WaitNodeProps {
    data: WaitNodeData;
}

const WaitNode = ({ data }: WaitNodeProps) => {
    const [value, setValue] = useState(String(data.delay));

    useEffect(() => {
        setValue(String(data.delay));
    }, [data.delay]);

    return (
        <BaseNode
            data={{ label: data.label || "Тайм-аут (сек)" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <input
                    value={value}
                    placeholder="секунды"
                    onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");

                        setValue(v);

                        const parsed = Number(v);

                        if (!isNaN(parsed)) {
                            data.onChange?.({
                                ...data,
                                delay: parsed,
                            });
                        }
                    }}
                    onBlur={() => {
                        const parsed = Number(value);

                        if (!value || isNaN(parsed) || parsed < 0) {
                            setValue("0");
                            data.onChange?.({
                                ...data,
                                delay: 0,
                            });
                        }
                    }}
                    style={{
                        width: "5vw",
                        padding: "6px 10px",
                        border: "2px solid #000",
                        borderRadius: 6,
                        textAlign: "center",
                        fontFamily: "monospace",
                        outline: "none",
                    }}
                />
            </div>
        </BaseNode>
    );
};

export default WaitNode;
