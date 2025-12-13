// Типы для экспорта/импорта графа чатбота

export type VariableType = "string" | "number";

export interface Variable {
    name: string;
    type: VariableType;
}

export type NodeType =
    | "setmessage"
    | "wait"
    | "sendmessage"
    | "condition"
    | "script"
    | "setvar"
    | "textanswer"
    | "fileanswer";

export interface BaseNodeData {
    node_id: number;
    type: NodeType;
    position?: { x: number; y: number };
}

// Конкретные типы нод с их специфичными полями
export interface SetMessageNodeExport extends BaseNodeData {
    type: "setmessage";
    bodies: any[];
}

export interface WaitNodeExport extends BaseNodeData {
    type: "wait";
    delay: number;
}

export interface SendMessageNodeExport extends BaseNodeData {
    type: "sendmessage";
}

export interface ConditionNodeExport extends BaseNodeData {
    type: "condition";
    branches: Array<{
        condition: {
            variable: string;
            operator: string;
            value: string;
        };
    }>;
}

export interface ScriptNodeExport extends BaseNodeData {
    type: "script";
    script: string;
    language: "python" | "javascript";
}

export interface SetVarNodeExport extends BaseNodeData {
    type: "setvar";
    assigned_variable: string;
    operation: string;
    operand: string;
}

export interface TextAnswerNodeExport extends BaseNodeData {
    type: "textanswer";
    variable: string;
}

export interface FileAnswerNodeExport extends BaseNodeData {
    type: "fileanswer";
    variable: string;
}

export type NodeExport =
    | SetMessageNodeExport
    | WaitNodeExport
    | SendMessageNodeExport
    | ConditionNodeExport
    | ScriptNodeExport
    | SetVarNodeExport
    | TextAnswerNodeExport
    | FileAnswerNodeExport;

export interface EdgeExport {
    source: number;
    target: number;
    sourceHandle?: string;
    targetHandle?: string;
}

export interface Graph {
    root: number; // root node id
    nodes: Record<number, NodeExport>;
    edges?: EdgeExport[]; // связи между нодами
}

export interface Chatbot {
    variables: Variable[];
    graph: Graph;
    bot_id: number;
    bot_name: string;
}

