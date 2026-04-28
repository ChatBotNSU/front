import BaseNode from "./BaseNode";
import { Position } from "@xyflow/react";
import TextBody from "../Bodies/TextBody";
import ImageBody from "../Bodies/ImageBody";
import DocumentBody from "../Bodies/DocumentBody";
import ButtonsBody from "../Bodies/ButtonsBody";
import BodyModal from "../Bodies/BodyModal";
import { useRef, useState } from "react";
import type { BodyType } from "../NodeBar/NodeBar";
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
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleAddBody = (bodyType: BodyType) => {
        let newBody: SetMessageBodyType | null = null;

        switch (bodyType) {
            case "text":
                newBody = { type: "text", bodyData: { text: "" } };
                break;
            case "image":
                newBody = { type: "image", bodyData: [] };
                break;
            case "file":
                newBody = {
                    type: "file",
                    bodyData: { path: "", isVariable: false },
                };
                break;
            case "buttons":
                newBody = {
                    type: "buttons",
                    bodyData: { buttons: [] },
                };
                break;
        }

        if (newBody) {
            data.onChange?.({
                ...data,
                bodies: [...data.bodies, newBody],
            });
            setIsOpen(false);
        }
    };

    const renderBody = (body: SetMessageBodyType, index: number) => {
        switch (body.type) {
            case "text":
                return (
                    <TextBody
                        key={index}
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
                );

            case "image":
                return (
                    <ImageBody
                        key={index}
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
                );

            case "file":
                return (
                    <DocumentBody
                        key={index}
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
                );

            case "buttons":
                return (
                    <ButtonsBody
                        key={index}
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
            hideDefaultLabel
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {data.label || "Set Message"}
                    </div>

                    <button
                        ref={buttonRef}
                        onClick={() => setIsOpen(true)}
                        style={{
                            padding: "2px 8px",
                            borderRadius: 6,
                            border: "1px solid #FFB947",
                            color: "#FFB947",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 11,
                        }}
                    >
                        +
                    </button>
                </div>

                {data.bodies.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                        Выберите тип тела
                    </div>
                ) : (
                    data.bodies.map(renderBody)
                )}
            </div>

            <BodyModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSelectBody={handleAddBody}
                referenceEl={buttonRef.current}
            />
        </BaseNode>
    );
};

export default SetMessageNode;
