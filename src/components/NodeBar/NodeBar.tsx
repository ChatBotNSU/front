// TODO: перенести из сайд бара в тулбар
import React, { useMemo, useState } from "react";

const NODE_ITEMS = [
    { key: "setmessage", label: "Задать сообщение" },
    { key: "wait", label: "Тайм-аут" },
    { key: "sendmessage", label: "Отправка сообщения пользователю   " },
    { key: "condition", label: "Condition" },
    { key: "script", label: "Script Node" },
    { key: "setvar", label: "Set Var" },
    { key: "textanswer", label: "Text Answer" },
    { key: "fileanswer", label: "File Answer" },
];

const BODY_ITEMS = [
    { key: "text", label: "Текст" },
    { key: "image", label: "Изображение" },
    { key: "file", label: "Файл" },
    { key: "buttons", label: "Кнопки" },
];

type NodeType = (typeof NODE_ITEMS)[number]["key"];
type BodyType = (typeof BODY_ITEMS)[number]["key"];

interface NodeBarProps {
    activeNodeType?: NodeType | null;
}

/**
 * NodeBar
 * - shows available node types (at top)
 * - shows available body types (at bottom)
 * - you must select a node before being allowed to drag a body
 * - drag payload is set as `application/reactflow` with { nodeType, bodyType? }
 */
const NodeBar: React.FC<NodeBarProps> = ({ activeNodeType }) => {
    const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
    const [selectedBody, setSelectedBody] = useState<BodyType | null>(null);

    const nodeList = useMemo(() => NODE_ITEMS, []);
    const bodyList = useMemo(() => {
        if (activeNodeType === "setmessage") return BODY_ITEMS;
        return [];
    }, [activeNodeType]);

    const onDragNodeStart = (
        e: React.DragEvent<HTMLDivElement>,
        nodeType: NodeType,
    ) => {
        const payload = { nodeType };
        e.dataTransfer.setData(
            "application/reactflow",
            JSON.stringify(payload),
        );
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragBodyStart = (
        e: React.DragEvent<HTMLDivElement>,
        bodyType: BodyType,
    ) => {
        if (!activeNodeType || bodyList.length === 0) {
            // shouldn't happen because we disable draggable, but be safe
            e.preventDefault();
            return;
        }

        const payload = { nodeType: activeNodeType, bodyType };
        e.dataTransfer.setData(
            "application/reactflow",
            JSON.stringify(payload),
        );
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <aside className="w-56 bg-gray-50 border-r border-gray-200 h-full p-3 flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-semibold mb-2">Nodes</h3>
                <div className="flex flex-col gap-2">
                    {nodeList.map((n) => (
                        <div
                            key={n.key}
                            draggable
                            onDragStart={(e) =>
                                onDragNodeStart(e, n.key as NodeType)
                            }
                            onClick={() => {
                                setSelectedNode(n.key as NodeType);
                                setSelectedBody(null);
                            }}
                            className={`cursor-grab p-2 rounded border ${
                                selectedNode === n.key
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            <div className="text-sm">{n.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold mb-2">Bodies</h3>
                <div className="flex flex-col gap-2">
                    {bodyList.map((b) => {
                        const disabled =
                            !activeNodeType || bodyList.length === 0;
                        return (
                            <div
                                key={b.key}
                                draggable={!disabled}
                                onDragStart={(e) =>
                                    onDragBodyStart(e, b.key as BodyType)
                                }
                                onClick={() => {
                                    if (!disabled)
                                        setSelectedBody(b.key as BodyType);
                                }}
                                className={`p-2 rounded border flex items-center gap-2 ${
                                    disabled
                                        ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                        : selectedBody === b.key
                                          ? "border-green-500 bg-green-50"
                                          : "border-gray-200 bg-white cursor-grab"
                                }`}
                            >
                                <div className="text-sm">{b.label}</div>
                                {activeNodeType && (
                                    <div className="ml-auto text-xs text-gray-500">
                                        {activeNodeType}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="text-xs text-gray-500 mt-3">
                    {activeNodeType === "setmessage"
                        ? "Кликните по ноде Set Message на канвасе, затем перетащите тело."
                        : "Выберите на канвасе ноду типа Set Message, чтобы добавить тело."}
                </div>
            </div>
        </aside>
    );
};

export default NodeBar;
