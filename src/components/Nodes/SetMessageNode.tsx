import BaseNode from "./BaseNode";
import { Position } from "react-flow-renderer";
import TextBody from "../Bodies/TextBody";

import ButtonsBody from "../Bodies/ButtonsBody";

export type SetMessageBodyType =
    | { type: "text"; bodyData: { text: string } }
    | { type: "image"; bodyData: { url: string; isVariable: boolean } }
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
                        />
                        <button
                            onClick={() => {
                                const newBodies = data.bodies.filter(
                                    (_, i) => i !== index
                                );
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                            style={{
                                marginTop: 4,
                                padding: "4px 8px",
                                fontSize: 11,
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            Удалить
                        </button>
                    </div>
                );
            case "image":
                return (
                    <div
                        key={index}
                        style={{
                            marginBottom: 8,
                            padding: 8,
                            background: "#f3f4f6",
                            borderRadius: 6,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                            }}
                        >
                            Изображение
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                            }}
                        >
                            <label
                                style={{
                                    fontSize: 11,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={body.bodyData.isVariable}
                                    onChange={(e) => {
                                        const newBodies = [...data.bodies];
                                        newBodies[index] = {
                                            type: "image",
                                            bodyData: {
                                                ...body.bodyData,
                                                isVariable: e.target.checked,
                                            },
                                        };
                                        data.onChange?.({
                                            ...data,
                                            bodies: newBodies,
                                        });
                                    }}
                                />
                                <span>Переменная</span>
                            </label>
                            <input
                                type="text"
                                value={body.bodyData.url}
                                onChange={(e) => {
                                    const newBodies = [...data.bodies];
                                    newBodies[index] = {
                                        type: "image",
                                        bodyData: {
                                            ...body.bodyData,
                                            url: e.target.value,
                                        },
                                    };
                                    data.onChange?.({
                                        ...data,
                                        bodies: newBodies,
                                    });
                                }}
                                placeholder={
                                    body.bodyData.isVariable
                                        ? "Имя переменной"
                                        : "URL картинки"
                                }
                                style={{
                                    padding: 6,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                const newBodies = data.bodies.filter(
                                    (_, i) => i !== index
                                );
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                            style={{
                                marginTop: 4,
                                padding: "4px 8px",
                                fontSize: 11,
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            Удалить
                        </button>
                    </div>
                );
            case "file":
                return (
                    <div
                        key={index}
                        style={{
                            marginBottom: 8,
                            padding: 8,
                            background: "#f3f4f6",
                            borderRadius: 6,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 4,
                            }}
                        >
                            Файл
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                            }}
                        >
                            <label
                                style={{
                                    fontSize: 11,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={body.bodyData.isVariable}
                                    onChange={(e) => {
                                        const newBodies = [...data.bodies];
                                        newBodies[index] = {
                                            type: "file",
                                            bodyData: {
                                                ...body.bodyData,
                                                isVariable: e.target.checked,
                                            },
                                        };
                                        data.onChange?.({
                                            ...data,
                                            bodies: newBodies,
                                        });
                                    }}
                                />
                                <span>Переменная</span>
                            </label>
                            <input
                                type="text"
                                value={body.bodyData.path}
                                onChange={(e) => {
                                    const newBodies = [...data.bodies];
                                    newBodies[index] = {
                                        type: "file",
                                        bodyData: {
                                            ...body.bodyData,
                                            path: e.target.value,
                                        },
                                    };
                                    data.onChange?.({
                                        ...data,
                                        bodies: newBodies,
                                    });
                                }}
                                placeholder={
                                    body.bodyData.isVariable
                                        ? "Имя переменной"
                                        : "Путь до файла"
                                }
                                style={{
                                    padding: 6,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                const newBodies = data.bodies.filter(
                                    (_, i) => i !== index
                                );
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                            style={{
                                marginTop: 4,
                                padding: "4px 8px",
                                fontSize: 11,
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            Удалить
                        </button>
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
                        />
                        <button
                            onClick={() => {
                                const newBodies = data.bodies.filter(
                                    (_, i) => i !== index
                                );
                                data.onChange?.({ ...data, bodies: newBodies });
                            }}
                            style={{
                                marginTop: 4,
                                padding: "4px 8px",
                                fontSize: 11,
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            Удалить
                        </button>
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
