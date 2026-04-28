import React, { useState } from "react";

export const NODE_ITEMS = [
    { key: "setmessage", label: "Задать сообщение" },
    { key: "wait", label: "Тайм-аут" },
    { key: "sendmessage", label: "Отправка сообщения пользователю" },
    { key: "condition", label: "Condition" },
    { key: "script", label: "Script Node" },
    { key: "setvar", label: "Set Var" },
    { key: "textanswer", label: "Text Answer" },
    { key: "fileanswer", label: "File Answer" },
];

export const BODY_ITEMS = [
    { key: "text", label: "Текст" },
    { key: "image", label: "Изображение" },
    { key: "file", label: "Файл" },
    { key: "buttons", label: "Кнопки" },
];

type NodeType = (typeof NODE_ITEMS)[number]["key"];
export type BodyType = (typeof BODY_ITEMS)[number]["key"];

interface NodeBarProps {
    activeNodeType?: NodeType | null;
}

/**
 * NodeBar - теперь только с методами
 * Фактический UI будет в NodeModal (для ноды на канвасе)
 */
const NodeBar: React.FC<NodeBarProps> = ({ activeNodeType }) => {
    return null; // больше не используется как sidebar
};

export default NodeBar;
