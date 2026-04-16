import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";
import TextBody from "../Bodies/TextBody";
import ImageBody from "../Bodies/ImageBody";
import DocumentBody from "../Bodies/DocumentBody";
import ButtonsBody from "../Bodies/ButtonsBody";
import type { ImageItem } from "../../types/image";
export type SetMessageBodyType =
    | { type: "text"; bodyData: { text: string } }
    | { type: "image"; bodyData: Array<ImageItem> }
    | { type: "file"; bodyData: { path: string; isVariable: boolean } }
    | { type: "buttons"; bodyData: { buttons: Array<{ label: string }> } };

export interface SetMessageNodeData {
    label?: string;
    bodies: SetMessageBodyType[];
    onChange?: (newData: SetMessageNodeData) => void;
}

interface SetMessageNodeProps {
    data: SetMessageNodeData;
}

const SetMessageNode = ({ data }: SetMessageNodeProps) => {
    const renderBody = (body: SetMessageBodyType, index: number) => {
        switch (body.type) {
            case "text":
                return (
                    <div key={index} style={{ marginBottom: 8 }}>
                        <TextBody
                            data={body.bodyData}
                            onChange={(newData) => {
                                const newBodies = [...data.bodies];
                                newBodies[index] = {
                                    type: "text",
                                    bodyData: newData,
                                };
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                            onDelete={() => {
                                const newBodies = data.bodies.filter(
                                    (_, i) => i !== index,
                                );
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                        />
                    </div>
                );
            case "image":
                return (
                    <div key={index} style={{ marginBottom: 8 }}>
                        <ImageBody
                            data={body.bodyData}
                            onChange={(newData) => {
                                const newBodies = [...data.bodies];
                                newBodies[index] = {
                                    type: "image",
                                    bodyData: newData,
                                };
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                            onDelete={() => {
                                const newBodies = data.bodies.filter(
                                    (_, i) => i !== index,
                                );
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                        />
                    </div>
                );
            case "file":
                return (
                    <div key={index} style={{ marginBottom: 8 }}>
                        <DocumentBody
                            data={body.bodyData}
                            onChange={(newData) => {
                                const newBodies = [...data.bodies];
                                newBodies[index] = {
                                    type: "file",
                                    bodyData: newData,
                                };
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                            onDelete={() => {
                                const newBodies = data.bodies.filter(
                                    (_, i) => i !== index,
                                );
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                        />
                    </div>
                );
            case "buttons":
                return (
                    <div key={index} style={{ marginBottom: 8 }}>
                        <ButtonsBody
                            buttons={body.bodyData.buttons}
                            onChange={(buttons) => {
                                const newBodies = [...data.bodies];
                                newBodies[index] = {
                                    type: "buttons",
                                    bodyData: { buttons },
                                };
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                            onDelete={() => {
                                const newBodies = data.bodies.filter(
                                    (_, i) => i !== index,
                                );
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                        />
                    </div>
                );
        }
    };

    return (
        <BaseNode
            data={{ label: data.label || "Set Message" }}
            handlesConfig={[
                { count: 1, position: Position.Top },
                { count: 1, position: Position.Bottom },
            ]}
        >
            {data.bodies.length === 0 ? (
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Выберите тип тела
                </div>
            ) : (
                <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                    {data.bodies.map((body, index) => renderBody(body, index))}
                </div>
            )}
        </BaseNode>
    );
};

export default SetMessageNode;
