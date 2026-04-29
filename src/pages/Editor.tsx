import React, { useState, useCallback, useRef, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import {
    ReactFlow,
    Background,
    type Edge,
    type Node,
    type OnInit,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    type NodeChange,
    type EdgeChange,
    type Connection,
} from "@xyflow/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import SetMessageNode, {
    type SetMessageNodeData,
} from "../components/Nodes/SetMessageNode";
import WaitNode, { type WaitNodeData } from "../components/Nodes/WaitNode";
import SendMessageNode, {
    type SendMessageNodeData,
} from "../components/Nodes/SendMessageNode";
import ConditionNode, {
    type ConditionNodeData,
} from "../components/Nodes/ConditionNode";
import ScriptNode, {
    type ScriptNodeData,
} from "../components/Nodes/ScriptNode";
import SetVarNode, {
    type SetVarNodeData,
} from "../components/Nodes/SetVarNode";
import TextAnswerNode, {
    type TextAnswerNodeData,
} from "../components/Nodes/TextAnswerNode";
import FileAnswerNode, {
    type FileAnswerNodeData,
} from "../components/Nodes/FileAnswerNode";
import AddNodeButton from "../components/NodeBar/AddNodeButton";
import Navbar from "../components/Navbar";
import VariablesPanel from "../components/VariablesPanel";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import parseBackendChatbot from "../utils/parseBackendChatbot";
import serializeToBackendChatbot from "../utils/serializeToBackendChatbot";
import { handleMultiSelectClick } from "../utils/multiSelectNodes";
import PreviewModal from "../components/Preview/PreviewModal";
import PublishModal from "../components/Publish/PublishModal";
import type { MenuItem } from "../types/menu";
import type { Chatbot, NodeExport, Variable } from "../types/chatbot";

const nodeTypes = {
    setmessage: SetMessageNode,
    wait: WaitNode,
    sendmessage: SendMessageNode,
    condition: ConditionNode,
    script: ScriptNode,
    setvar: SetVarNode,
    textanswer: TextAnswerNode,
    fileanswer: FileAnswerNode,
} as const;

const Editor: React.FC<{
    chatbotId?: string;
    onLogout?: () => void;
    onBack?: () => void;
}> = ({
    chatbotId: _chatbotId = "default", // TODO: Load chatbot data from API based on chatbotId
    onLogout,
    onBack,
}) => {
    void onLogout;
    const [nodes, setNodes] = useState<Node[]>([]);
    const [variables, setVariables] = useState<Variable[]>([]);
    const [botName, setBotName] = useState<string>("My Chatbot");
    const [botId, setBotId] = useState<number>(1);

    const [edges, setEdges] = useState<Edge[]>([]);
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [rootNodeId, setRootNodeId] = useState<string | null>(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [lastClickedNodeId, setLastClickedNodeId] = useState<string | null>(null);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstanceRef = useRef<any>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showPublish, setShowPublish] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onInit: OnInit = useCallback((instance) => {
        reactFlowInstanceRef.current = instance;
    }, []);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    // Ensure rootNodeId stays valid: clear if the root node was removed
    useEffect(() => {
        if (rootNodeId && !nodes.find((n) => n.id === rootNodeId)) {
            setRootNodeId(null);
        }
    }, [nodes, rootNodeId]);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge(connection, eds));
        // When a connection is created, immediately set the source node's next_node_id
        // (or default_next_node_id for condition nodes) so serializer has explicit value.
        const { source, target } = connection;
        if (!source || !target) return;
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id !== source) return n;
                const data: any = { ...(n.data || {}) };
                if (n.type === "condition") {
                    return {
                        ...n,
                        data: {
                            ...data,
                            default_next_node_id: String(target),
                        },
                    };
                }
                return {
                    ...n,
                    data: {
                        ...data,
                        next_node_id: String(target),
                    },
                };
            }),
        );
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        console.log("DRAG OVER", event.dataTransfer.types);
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            console.log(
                "DROP EVENT FIRED",
                event.dataTransfer.getData("application/reactflow"),
            );
            const data = event.dataTransfer.getData("application/reactflow");
            if (!data) {
                console.log("No data in drop");
                return;
            }
            let payload: any;
            try {
                payload = JSON.parse(data);
            } catch {
                console.log("Failed to parse payload");
                return;
            }

            const bounds = reactFlowWrapper.current?.getBoundingClientRect();
            if (!bounds || !reactFlowInstanceRef.current) {
                console.log("No bounds or reactflow instance");
                return;
            }

            // Use screenToFlowPosition if project method doesn't exist
            let position: any;
            if (reactFlowInstanceRef.current.screenToFlowPosition) {
                position = reactFlowInstanceRef.current.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });
            } else if (reactFlowInstanceRef.current.project) {
                position = reactFlowInstanceRef.current.project({
                    x: event.clientX - bounds.left,
                    y: event.clientY - bounds.top,
                });
            } else {
                console.error("ReactFlow instance has no projection method");
                return;
            }

            // If payload has nodeType only -> create node
            if (payload.nodeType && !payload.bodyType) {
                const id = `${Date.now()}`;
                const nodeType = payload.nodeType as keyof typeof nodeTypes;
                // Default data per node type
                let data: any = {};
                if (nodeType === "setmessage") {
                    data = {
                        label: "Задать сообщение",
                        bodies: [],
                        // ensure backend-required fields exist
                        text: "",
                        audios: [],
                        images: [],
                        files: [],
                        choise_options: [],
                        next_node_id: "",
                    } as SetMessageNodeData;
                } else if (nodeType === "wait") {
                    data = {
                        label: "Тайм-аут",
                        delay: 1,
                        next_node_id: "",
                    } as WaitNodeData;
                } else if (nodeType === "sendmessage") {
                    data = {
                        label: "Отправка сообщения пользователю",
                        next_node_id: "",
                    } as SendMessageNodeData;
                } else if (nodeType === "condition") {
                    data = {
                        label: "Condition",
                        branches: [
                            {
                                condition: {
                                    variable_left: "",
                                    operation: "==",
                                    variable_right: "",
                                },
                                next_node_id: "",
                            },
                        ],
                        default_next_node_id: "",
                    } as ConditionNodeData;
                } else if (nodeType === "script") {
                    data = {
                        label: "Script Node",
                        script: "",
                        language: "python",
                        next_node_id: "",
                    } as ScriptNodeData;
                } else if (nodeType === "setvar") {
                    data = {
                        label: "Set Var",
                        assigned_variable: "",
                        operation: "=",
                        operand: "",
                        next_node_id: "",
                    } as SetVarNodeData;
                } else if (nodeType === "textanswer") {
                    data = {
                        label: "Text Answer",
                        variable: "",
                        next_node_id: "",
                    } as TextAnswerNodeData;
                } else if (nodeType === "fileanswer") {
                    data = {
                        label: "File Answer",
                        variable: "",
                        next_node_id: "",
                    } as FileAnswerNodeData;
                } else {
                    return;
                }

                setNodes((nds) => [
                    ...nds,
                    { id, type: nodeType as any, position, data },
                ]);
                // If no explicit root is set yet, make the first created node the root
                setRootNodeId((prev) => prev || id);
                setActiveNodeId(id);
                // Dispatch event to close NodeModal after successful drop
                window.dispatchEvent(
                    new CustomEvent("nodeCreated", { detail: { nodeId: id } }),
                );
                return;
            }

            // If payload has bodyType -> add body to active setmessage node
            if (payload.bodyType && activeNodeId) {
                const bodyType = payload.bodyType as
                    | "text"
                    | "image"
                    | "file"
                    | "buttons";
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id !== activeNodeId) return node;
                        if (node.type !== "setmessage") return node;
                        const data = node.data as SetMessageNodeData;
                        let newBody: any = null;
                        if (bodyType === "text") {
                            newBody = { type: "text", bodyData: { text: "" } };
                        } else if (bodyType === "image") {
                            newBody = {
                                type: "image",
                                bodyData: [],
                            };
                        } else if (bodyType === "file") {
                            newBody = {
                                type: "file",
                                bodyData: { path: "", isVariable: false },
                            };
                        } else if (bodyType === "buttons") {
                            console.log("eto beda");
                            newBody = {
                                type: "buttons",
                                bodyData: { buttons: [{ label: "Кнопка 1" }] },
                            };
                        }
                        return {
                            ...node,
                            data: {
                                ...data,
                                bodies: [...data.bodies, newBody],
                            },
                        };
                    }),
                );
            }
        },
        [activeNodeId],
    );

    const activeNode = nodes.find((n) => n.id === activeNodeId) || null;
    const exportGraph = useCallback(() => {
        if (nodes.length === 0) {
            alert("Нет нод для экспорта");
            return;
        }
        // Respect explicit rootNodeId when exporting
        let rootId: number;
        if (rootNodeId && nodes.find((n) => n.id === rootNodeId)) {
            rootId = parseInt(rootNodeId);
        } else {
            const targetIds = new Set(edges.map((e) => e.target));
            const rootNodes = nodes.filter((n) => !targetIds.has(n.id));
            rootId =
                rootNodes.length > 0
                    ? parseInt(rootNodes[0].id)
                    : parseInt(nodes[0].id);
        }

        const nodesExport: Record<number, NodeExport> = {};
        nodes.forEach((node) => {
            const nodeId = parseInt(node.id);
            const baseData = {
                node_id: nodeId,
                type: node.type as NodeExport["type"],
                position: node.position,
            };

            switch (node.type) {
                case "setmessage":
                    nodesExport[nodeId] = {
                        ...baseData,
                        bodies: (node.data as SetMessageNodeData).bodies || [],
                    } as NodeExport;
                    break;
                case "wait":
                    nodesExport[nodeId] = {
                        ...baseData,
                        delay: (node.data as WaitNodeData).delay || 0,
                    } as NodeExport;
                    break;
                case "sendmessage":
                    nodesExport[nodeId] = baseData as NodeExport;
                    break;
                case "condition":
                    nodesExport[nodeId] = {
                        ...baseData,
                        branches:
                            (node.data as ConditionNodeData).branches || [],
                    } as NodeExport;
                    break;
                case "script":
                    nodesExport[nodeId] = {
                        ...baseData,
                        script: (node.data as ScriptNodeData).script || "",
                        language:
                            (node.data as ScriptNodeData).language || "python",
                    } as NodeExport;
                    break;
                case "setvar":
                    nodesExport[nodeId] = {
                        ...baseData,
                        assigned_variable:
                            (node.data as SetVarNodeData).assigned_variable ||
                            "",
                        operation:
                            (node.data as SetVarNodeData).operation || "=",
                        operand: (node.data as SetVarNodeData).operand || "",
                    } as NodeExport;
                    break;
                case "textanswer":
                    nodesExport[nodeId] = {
                        ...baseData,
                        variable:
                            (node.data as TextAnswerNodeData).variable || "",
                    } as NodeExport;
                    break;
                case "fileanswer":
                    nodesExport[nodeId] = {
                        ...baseData,
                        variable:
                            (node.data as FileAnswerNodeData).variable || "",
                    } as NodeExport;
                    break;
            }
        });

        const edgesExport = edges.map((edge) => ({
            source: parseInt(edge.source),
            target: parseInt(edge.target),
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
        }));

        const graph = {
            root: rootId,
            nodes: nodesExport,
            edges: edgesExport,
        };

        const chatbot: Chatbot = {
            variables: variables,
            graph: graph,
            bot_id: botId,
            bot_name: botName,
        };

        const json = JSON.stringify(chatbot, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${botName.replace(/\s+/g, "_")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [nodes, edges, variables, botName, botId]);

    // Импорт графа из JSON
    const importGraph = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Load chatbot from backend when `chatbotId` changes
    const token = useSelector((s: RootState) => s.auth.access_token);
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!_chatbotId === undefined || _chatbotId === null) return;
            if (!_chatbotId || _chatbotId === "default") return;
            try {
                const res = await fetch(
                    `/api/v1/chatbot/chatbot/${_chatbotId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    },
                );
                const json = await res.json();
                if (!res.ok)
                    throw new Error(
                        json?.detail ||
                            json?.message ||
                            "Failed to load chatbot",
                    );
                const payload = json?.chatbot ?? json;

                // Normalize backend payload to internal Chatbot format
                const chat = parseBackendChatbot(payload);
                try {
                    // eslint-disable-next-line no-console
                    console.debug("Loaded chatbot payload:", payload);
                    // eslint-disable-next-line no-console
                    console.debug("Parsed chatbot object:", chat);
                } catch (e) {}
                if (!mounted) return;

                setVariables(chat.variables || []);
                setBotName(chat.bot_name || "");
                setBotId(chat.bot_id || 0);

                // Convert NodeExport -> React Flow nodes
                const importedNodes: Node[] = [];
                const importedEdges: Edge[] = [];
                const nodesArr = Object.values(chat.graph.nodes || {});
                nodesArr.forEach((nodeExport: any, index: number) => {
                    const nodeId = String(nodeExport.node_id ?? index);
                    let data: any = {};
                    switch (nodeExport.type) {
                        case "setmessage":
                            data = {
                                label: "Задать сообщение",
                                bodies: nodeExport.bodies || [],
                            };
                            break;
                        case "wait":
                            data = {
                                label: "Wait",
                                delay: nodeExport.delay || 0,
                            };
                            break;
                        case "sendmessage":
                            data = { label: "Отправка сообщения пользователю" };
                            break;
                        case "condition":
                            data = {
                                label: "Condition",
                                branches: nodeExport.branches || [],
                            };
                            break;
                        case "script":
                            data = {
                                label: "Script Node",
                                script: nodeExport.script || "",
                                language: nodeExport.language || "python",
                            };
                            break;
                        case "setvar":
                            data = {
                                label: "Set Var",
                                assigned_variable:
                                    nodeExport.assigned_variable || "",
                                operation: nodeExport.operation || "=",
                                operand: nodeExport.operand || "",
                            };
                            break;
                        case "textanswer":
                            data = {
                                label: "Text Answer",
                                variable: nodeExport.variable || "",
                            };
                            break;
                        case "fileanswer":
                            data = {
                                label: "File Answer",
                                variable: nodeExport.variable || "",
                            };
                            break;
                        default:
                            data = nodeExport;
                    }

                    importedNodes.push({
                        id: nodeId,
                        type: nodeExport.type,
                        position: nodeExport.position || {
                            x: (index % 5) * 250,
                            y: Math.floor(index / 5) * 200,
                        },
                        data,
                    });
                });

                if (Array.isArray(chat.graph.edges)) {
                    chat.graph.edges.forEach((edgeExport: any) => {
                        importedEdges.push({
                            id: `e${edgeExport.source}-${edgeExport.target}`,
                            source: String(edgeExport.source),
                            target: String(edgeExport.target),
                            sourceHandle: edgeExport.sourceHandle,
                            targetHandle: edgeExport.targetHandle,
                        });
                    });
                }

                // Defensive: if condition nodes contain branches with next_node_id, ensure edges exist for them
                nodesArr.forEach((nodeExport: any) => {
                    if (nodeExport.type !== "condition") return;
                    const srcId = String(nodeExport.node_id);
                    const branches = Array.isArray(nodeExport.branches)
                        ? nodeExport.branches
                        : [];
                    branches.forEach((br: any, idx: number) => {
                        const tgt = br?.next_node_id ?? br?.next ?? br?.target;
                        if (
                            tgt !== undefined &&
                            tgt !== null &&
                            String(tgt) !== ""
                        ) {
                            const tgtStr = String(tgt);
                            const exists = importedEdges.some(
                                (ee) =>
                                    ee.source === srcId && ee.target === tgtStr,
                            );
                            if (!exists) {
                                importedEdges.push({
                                    id: `e${srcId}-${tgtStr}`,
                                    source: srcId,
                                    target: tgtStr,
                                    sourceHandle: `bottom-${idx}`,
                                    targetHandle: `top-0`,
                                });
                            }
                        }
                    });
                    // default branch
                    const def =
                        nodeExport.default_next_node_id ??
                        nodeExport.defaultNext ??
                        nodeExport.default_next ??
                        nodeExport.next_node_id;
                    if (def) {
                        const defStr = String(def);
                        const existsDef = importedEdges.some(
                            (ee) => ee.source === srcId && ee.target === defStr,
                        );
                        if (!existsDef) {
                            importedEdges.push({
                                id: `e${srcId}-${defStr}`,
                                source: srcId,
                                target: defStr,
                                sourceHandle: `bottom-default`,
                                targetHandle: `top-0`,
                            });
                        }
                    }
                });

                setNodes(importedNodes);
                setEdges(importedEdges);
                // set root node from backend payload when available
                setRootNodeId(String(chat.graph?.root ?? ""));
            } catch (err) {
                console.error("Failed to load chatbot:", err);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [_chatbotId, token]);

    // Convert current editor state back to backend format and POST to update
    const saveChatbot = useCallback(async () => {
        try {
            if (!_chatbotId || _chatbotId === "default") {
                alert("Нет выбранного чатбота для сохранения");
                return;
            }

            // Keep node ids as strings so edges reference the same ids React Flow uses
            const nodesObj: Record<string, any> = {};
            nodes.forEach((n) => {
                const id = String(n.id);
                nodesObj[id] = { ...(n.data || {}), node_id: id, type: n.type };
            });

            // Resolve edge endpoints to existing node keys (handle prefixes like 'b-')
            const resolveId = (raw: any) => {
                const s = String(raw);
                if (nodesObj[s]) return s;
                // strip common prefix b-
                if (s.startsWith("b-") && nodesObj[s.slice(2)])
                    return s.slice(2);
                // try numeric coercion
                const num = String(Number(s));
                if (nodesObj[num]) return num;
                return s; // fallback, may be unresolved
            };

            const edgesArr = edges.map((e) => {
                const src = resolveId(e.source);
                const tgt = resolveId(e.target);
                if (!nodesObj[src])
                    console.warn(
                        "Edge source not found in nodesObj:",
                        e,
                        "resolved->",
                        src,
                    );
                if (!nodesObj[tgt])
                    console.warn(
                        "Edge target not found in nodesObj:",
                        e,
                        "resolved->",
                        tgt,
                    );
                return {
                    source: src,
                    target: tgt,
                    sourceHandle: e.sourceHandle ?? undefined,
                    targetHandle: e.targetHandle ?? undefined,
                };
            });

            const chatbot: any = {
                variables,
                bot_id: botId,
                bot_name: botName,
                graph: {
                    // prefer explicitly set rootNodeId, otherwise choose a node without incoming edges
                    root:
                        rootNodeId && nodesObj[String(rootNodeId)]
                            ? String(rootNodeId)
                            : (() => {
                                  const targets = new Set(
                                      edgesArr.map((e) => String(e.target)),
                                  );
                                  const candidates = Object.keys(
                                      nodesObj,
                                  ).filter((id) => !targets.has(id));
                                  return candidates.length
                                      ? candidates[0]
                                      : Object.keys(nodesObj)[0];
                              })(),
                    nodes: nodesObj,
                    edges: edgesArr,
                },
            };

            const payload = serializeToBackendChatbot(chatbot);
            // Diagnostic logs to help debug missing/incorrect ids
            try {
                // show node keys and edges as we send them
                // eslint-disable-next-line no-console
                console.log(
                    "Saving chatbot nodes keys:",
                    Object.keys(nodesObj),
                );
                // eslint-disable-next-line no-console
                console.log("Saving chatbot edges:", edgesArr);
                const missing = edgesArr.filter(
                    (e) => !nodesObj[e.source] || !nodesObj[e.target],
                );
                if (missing.length) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        "saveChatbot: edges referencing missing nodes:",
                        missing,
                    );
                }
                // detect suspicious next_node_id values
                const suspicious = Object.entries(
                    payload.graph.nodes || {},
                ).filter(
                    ([, v]: any) =>
                        v.next_node_id === "0" || v.next_node_id === 0,
                );
                if (suspicious.length) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        "saveChatbot: suspicious next_node_id entries:",
                        suspicious,
                    );
                }
                // eslint-disable-next-line no-console
                console.log("Saving chatbot payload:", payload);
            } catch (e) {}

            const res = await fetch(`/api/v1/chatbot/chatbot/${_chatbotId}`, {
                method: "POST",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => null);
            if (!res.ok) {
                console.error("Save failed status:", res.status, json);
                // show detailed server errors when possible
                const details = json
                    ? JSON.stringify(json)
                    : `status ${res.status}`;
                alert("Ошибка при сохранении: " + details);
                return;
            }
            console.log("Save successful:", json);
            alert("Чатбот успешно сохранён");
        } catch (err: any) {
            alert("Ошибка при сохранении: " + (err?.message || String(err)));
        }
    }, [
        nodes,
        edges,
        variables,
        botId,
        botName,
        _chatbotId,
        token,
        rootNodeId,
    ]);

    // Save current graph to backend (POST /api/v1/chatbot/chatbot/{id})

    const handleFileImport = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const chatbot: Chatbot = JSON.parse(
                        e.target?.result as string,
                    );

                    // Восстанавливаем переменные
                    setVariables(chatbot.variables || []);
                    setBotName(chatbot.bot_name || "My Chatbot");
                    setBotId(chatbot.bot_id || 1);

                    // Восстанавливаем граф
                    const graph = chatbot.graph;
                    const importedNodes: Node[] = [];
                    const importedEdges: Edge[] = [];

                    // Преобразуем ноды из формата экспорта в формат React Flow
                    Object.values(graph.nodes).forEach((nodeExport, index) => {
                        const nodeId = nodeExport.node_id.toString();
                        let data: any = {};

                        switch (nodeExport.type) {
                            case "setmessage":
                                data = {
                                    label: "Задать сообщение",
                                    bodies: nodeExport.bodies || [],
                                };
                                break;
                            case "wait":
                                data = {
                                    label: "Wait",
                                    delay: nodeExport.delay || 0,
                                };
                                break;
                            case "sendmessage":
                                data = {
                                    label: "Отправка сообщения пользователю",
                                };
                                break;
                            case "condition":
                                data = {
                                    label: "Condition",
                                    branches: nodeExport.branches || [],
                                };
                                break;
                            case "script":
                                data = {
                                    label: "Script Node",
                                    script: nodeExport.script || "",
                                    language: nodeExport.language || "python",
                                };
                                break;
                            case "setvar":
                                data = {
                                    label: "Set Var",
                                    assigned_variable:
                                        nodeExport.assigned_variable || "",
                                    operation: nodeExport.operation || "=",
                                    operand: nodeExport.operand || "",
                                };
                                break;
                            case "textanswer":
                                data = {
                                    label: "Text Answer",
                                    variable: nodeExport.variable || "",
                                };
                                break;
                            case "fileanswer":
                                data = {
                                    label: "File Answer",
                                    variable: nodeExport.variable || "",
                                };
                                break;
                        }

                        importedNodes.push({
                            id: nodeId,
                            type: nodeExport.type,
                            position: nodeExport.position || {
                                x: (index % 5) * 250,
                                y: Math.floor(index / 5) * 200,
                            },
                            data: data,
                        });
                    });

                    // Восстанавливаем связи
                    if (graph.edges) {
                        graph.edges.forEach((edgeExport) => {
                            importedEdges.push({
                                id: `e${edgeExport.source}-${edgeExport.target}`,
                                source: edgeExport.source.toString(),
                                target: edgeExport.target.toString(),
                                sourceHandle: edgeExport.sourceHandle,
                                targetHandle: edgeExport.targetHandle,
                            });
                        });
                    }

                    // Defensive: add edges from condition branches if they contain next_node_id
                    Object.values(graph.nodes).forEach((nodeExport: any) => {
                        if (nodeExport.type !== "condition") return;
                        const srcId = String(
                            nodeExport.node_id ?? nodeExport.id,
                        );
                        const branches = Array.isArray(nodeExport.branches)
                            ? nodeExport.branches
                            : [];
                        branches.forEach((br: any, idx: number) => {
                            const tgt =
                                br?.next_node_id ?? br?.next ?? br?.target;
                            if (
                                tgt !== undefined &&
                                tgt !== null &&
                                String(tgt) !== ""
                            ) {
                                const tgtStr = String(tgt);
                                const exists = importedEdges.some(
                                    (ee) =>
                                        ee.source === srcId &&
                                        ee.target === tgtStr,
                                );
                                if (!exists) {
                                    importedEdges.push({
                                        id: `e${srcId}-${tgtStr}`,
                                        source: srcId,
                                        target: tgtStr,
                                        sourceHandle: `bottom-${idx}`,
                                        targetHandle: `top-0`,
                                    });
                                }
                            }
                        });
                        const def =
                            nodeExport.default_next_node_id ??
                            nodeExport.defaultNext ??
                            nodeExport.default_next ??
                            nodeExport.next_node_id;
                        if (def) {
                            const defStr = String(def);
                            const existsDef = importedEdges.some(
                                (ee) =>
                                    ee.source === srcId && ee.target === defStr,
                            );
                            if (!existsDef)
                                importedEdges.push({
                                    id: `e${srcId}-${defStr}`,
                                    source: srcId,
                                    target: defStr,
                                    sourceHandle: `bottom-default`,
                                    targetHandle: `top-0`,
                                });
                        }
                    });

                    setNodes(importedNodes);
                    setEdges(importedEdges);
                    setRootNodeId(String(graph.root ?? ""));
                    alert("Граф успешно импортирован!");
                } catch (error) {
                    alert(
                        "Ошибка при импорте файла: " + (error as Error).message,
                    );
                }
            };
            reader.readAsText(file);
            event.target.value = "";
        },
        [],
    );

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!_chatbotId) return;
            try {
                const res = await fetch(
                    `/api/v1/chatbot/chatbot/${_chatbotId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    },
                );
                const json = await res.json();
                if (!res.ok)
                    throw new Error(
                        json?.detail ||
                            json?.message ||
                            "Failed to load chatbot",
                    );
                const payload = json?.chatbot ?? json;
                const parsed = parseBackendChatbot(payload);
                try {
                    // eslint-disable-next-line no-console
                    console.debug(
                        "Loaded chatbot payload (second load):",
                        payload,
                    );
                    // eslint-disable-next-line no-console
                    console.debug(
                        "Parsed chatbot object (second load):",
                        parsed,
                    );
                } catch (e) {}
                if (!mounted) return;

                const importedNodes: Node[] = [];
                const importedEdges: Edge[] = [];
                const graph = parsed.graph;
                Object.values(graph.nodes).forEach((nodeExport: any, index) => {
                    const nodeId = nodeExport.node_id.toString();
                    let data: any = {};

                    switch (nodeExport.type) {
                        case "setmessage":
                            data = {
                                label: "Задать сообщение",
                                bodies: nodeExport.bodies || [],
                            };
                            break;
                        case "wait":
                            data = {
                                label: "Wait",
                                delay: nodeExport.delay || 0,
                            };
                            break;
                        case "sendmessage":
                            data = { label: "Отправка сообщения пользователю" };
                            break;
                        case "condition":
                            data = {
                                label: "Condition",
                                branches: nodeExport.branches || [],
                            };
                            break;
                        case "script":
                            data = {
                                label: "Script Node",
                                script: nodeExport.script || "",
                                language: nodeExport.language || "python",
                            };
                            break;
                        case "setvar":
                            data = {
                                label: "Set Var",
                                assigned_variable:
                                    nodeExport.assigned_variable || "",
                                operation: nodeExport.operation || "=",
                                operand: nodeExport.operand || "",
                            };
                            break;
                        case "textanswer":
                            data = {
                                label: "Text Answer",
                                variable: nodeExport.variable || "",
                            };
                            break;
                        case "fileanswer":
                            data = {
                                label: "File Answer",
                                variable: nodeExport.variable || "",
                            };
                            break;
                        default:
                            data = {
                                label: nodeExport.type ?? "Node",
                                bodies: [
                                    {
                                        type: "text",
                                        bodyData: {
                                            text: JSON.stringify(nodeExport),
                                        },
                                    },
                                ],
                            };
                    }

                    importedNodes.push({
                        id: nodeId,
                        type: nodeExport.type,
                        position: nodeExport.position || {
                            x: (index % 5) * 250,
                            y: Math.floor(index / 5) * 200,
                        },
                        data,
                    });
                });

                if (Array.isArray(graph.edges)) {
                    graph.edges.forEach((edgeExport: any) => {
                        importedEdges.push({
                            id: `e${edgeExport.source}-${edgeExport.target}`,
                            source: edgeExport.source.toString(),
                            target: edgeExport.target.toString(),
                            sourceHandle: edgeExport.sourceHandle,
                            targetHandle: edgeExport.targetHandle,
                        });
                    });
                } else {
                    Object.values(graph.nodes).forEach((ne: any) => {
                        const srcId = (ne.node_id ?? ne.id).toString();
                        const target =
                            ne.next_node_id ?? ne.nextNodeId ?? ne.next;
                        if (target !== undefined && target !== null) {
                            importedEdges.push({
                                id: `e${srcId}-${target}`,
                                source: srcId.toString(),
                                target: target.toString(),
                            });
                        }
                    });
                }

                setVariables(parsed.variables || []);
                setBotName(parsed.bot_name || "");
                setBotId(parsed.bot_id || 0);
                setNodes(importedNodes);
                setEdges(importedEdges);
            } catch (err: any) {
                console.error(err);
                alert(
                    "Ошибка при загрузке чатбота: " +
                        (err?.message || String(err)),
                );
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [_chatbotId, token]);

    const returnItem: MenuItem | null = onBack
        ? {
              label: "Назад",
              type: "button" as const,
              variant: "secondary" as const,
              onClick: onBack,
              icon: "back" as const,
          }
        : null;

    const leftItems: MenuItem[] = [
        {
            label: "Экспорт",
            type: "button",
            variant: "secondary",
            onClick: exportGraph,
            icon: "export",
        },
        {
            label: "Импорт",
            type: "button",
            variant: "secondary",
            onClick: importGraph,
            icon: "import",
        },
    ];

    const centerItems: MenuItem[] = [
        {
            label: "Сохранить",
            type: "button",
            variant: "primary",
            onClick: saveChatbot,
            icon: "save",
        },
        {
            label: "Удалить",
            type: "button",
            variant: "danger",
            onClick: () => {
                if (!activeNodeId) {
                    alert("Выберите ноду для удаления");
                    return;
                }
                setNodes((nds) => nds.filter((n) => n.id !== activeNodeId));
                setEdges((eds) =>
                    eds.filter(
                        (e) =>
                            e.source !== activeNodeId &&
                            e.target !== activeNodeId,
                    ),
                );
                setActiveNodeId(null);
            },
            icon: "delete",
        },
    ];

    const rightItems: MenuItem[] = [
        {
            label: "Превью",
            type: "button",
            variant: "secondary",
            onClick: () => setShowPreview(true),
            icon: "preview",
        },
        {
            label: "Опубликовать",
            type: "button",
            variant: "secondary",
            onClick: () => setShowPublish(true),
            icon: "publish",
        },
    ];

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Navbar
                returnItem={returnItem}
                leftItems={leftItems}
                centerItems={centerItems}
                rightItems={rightItems}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleFileImport}
            />
            <div
                style={{
                    width: "100%",
                    flex: 1,
                    display: "flex",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        background: "#E2E8F0",
                        position: "relative",
                    }}
                    ref={reactFlowWrapper}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                >
                    <ReactFlow
                        nodes={nodes.map((node) => {
                            const isSelected = selectedNodeIds.has(node.id);
                            const updateData = (newData: any) =>
                                setNodes((nds) =>
                                    nds.map((n) =>
                                        n.id === node.id
                                            ? { ...n, data: newData }
                                            : n,
                                    ),
                                );

                            const baseNode = {
                                ...node,
                                style: {
                                    ...node.style,
                                    outline: isSelected
                                        ? "3px solid #3b82f6"
                                        : "none",
                                    outlineOffset: isSelected ? "2px" : "0px",
                                    borderRadius: "8px",
                                    boxShadow: isSelected
                                        ? "0 0 0 2px #1e40af"
                                        : "none",
                                    transition:
                                        "outline 0.2s ease, box-shadow 0.2s ease",
                                },
                            };

                            if (node.type === "setmessage") {
                                return {
                                    ...baseNode,
                                    data: {
                                        ...node.data,
                                        onChange: (
                                            newData: SetMessageNodeData,
                                        ) => updateData(newData),
                                    },
                                };
                            } else if (node.type === "wait") {
                                return {
                                    ...baseNode,
                                    data: {
                                        ...node.data,
                                        onChange: (newData: WaitNodeData) =>
                                            updateData(newData),
                                    },
                                };
                            } else if (node.type === "condition") {
                                return {
                                    ...baseNode,
                                    data: {
                                        ...node.data,
                                        onChange: (
                                            newData: ConditionNodeData,
                                        ) => updateData(newData),
                                    },
                                };
                            } else if (node.type === "script") {
                                return {
                                    ...baseNode,
                                    data: {
                                        ...node.data,
                                        onChange: (newData: ScriptNodeData) =>
                                            updateData(newData),
                                    },
                                };
                            } else if (node.type === "setvar") {
                                return {
                                    ...baseNode,
                                    data: {
                                        ...node.data,
                                        onChange: (newData: SetVarNodeData) =>
                                            updateData(newData),
                                    },
                                };
                            } else if (node.type === "textanswer") {
                                return {
                                    ...baseNode,
                                    data: {
                                        ...node.data,
                                        onChange: (
                                            newData: TextAnswerNodeData,
                                        ) => updateData(newData),
                                    },
                                };
                            } else if (node.type === "fileanswer") {
                                return {
                                    ...baseNode,
                                    data: {
                                        ...node.data,
                                        onChange: (
                                            newData: FileAnswerNodeData,
                                        ) => updateData(newData),
                                    },
                                };
                            }
                            return baseNode;
                        })}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        onInit={onInit}
                        onNodeClick={(event, n) => {
                            const result = handleMultiSelectClick(
                                n.id,
                                event.shiftKey,
                                event.ctrlKey,
                                selectedNodeIds,
                                lastClickedNodeId,
                            );
                            setSelectedNodeIds(result.newSelectedNodes);
                            setActiveNodeId(result.newActiveNodeId);
                            setLastClickedNodeId(result.newLastClickedNodeId);
                        }}
                        onEdgeClick={(_, e) => {
                            if (selectedEdgeId === e.id) {
                                setEdges((cur) =>
                                    cur.filter((ed) => ed.id !== e.id),
                                );
                                setSelectedEdgeId(null);
                            } else {
                                setSelectedEdgeId(e.id);
                            }
                        }}
                        onPaneClick={() => {
                            setSelectedEdgeId(null);
                            setSelectedNodeIds(new Set());
                            setLastClickedNodeId(null);
                        }}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodesDraggable={true}
                        nodesConnectable={true}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        defaultEdgeOptions={{
                            style: {
                                stroke: "#86B4FF",
                                strokeWidth: 2,
                            },
                        }}
                        connectionLineStyle={{
                            stroke: "#86B4FF",
                            strokeWidth: 1,
                        }}
                    >
                        <Background size={0} />
                    </ReactFlow>
                    <AddNodeButton />
                </div>
                <div
                    style={{
                        width: 360,
                        borderLeft: "1px solid #e5e7eb",
                        padding: 12,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}
                >
                    <VariablesPanel
                        variables={variables}
                        onVariablesChange={setVariables}
                    />
                    <div
                        style={{
                            borderTop: "1px solid #e5e7eb",
                            paddingTop: 12,
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            Параметры ноды
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#374151",
                                    marginBottom: 6,
                                }}
                            >
                                <strong>Root node:</strong>{" "}
                                {rootNodeId ? (
                                    <span>
                                        <span style={{ fontWeight: 600 }}>
                                            {rootNodeId}
                                        </span>{" "}
                                        <button
                                            onClick={() => setRootNodeId(null)}
                                            style={{
                                                marginLeft: 8,
                                                padding: "4px 8px",
                                                fontSize: 12,
                                            }}
                                        >
                                            Unset
                                        </button>
                                    </span>
                                ) : (
                                    <span style={{ color: "#6b7280" }}>
                                        not set
                                    </span>
                                )}
                            </div>
                            {activeNode && activeNode.id !== rootNodeId && (
                                <button
                                    onClick={() => setRootNodeId(activeNode.id)}
                                    style={{
                                        padding: "6px 10px",
                                        fontSize: 13,
                                        borderRadius: 6,
                                        background: "#eef2ff",
                                        border: "1px solid #dbeafe",
                                    }}
                                >
                                    Set as root
                                </button>
                            )}
                        </div>
                        {!activeNode && (
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                                Выберите ноду на канвасе
                            </div>
                        )}
                        {activeNode?.type === "wait" && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                <label style={{ fontSize: 12 }}>
                                    Задержка (сек)
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 4,
                                        alignItems: "center",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const current =
                                                (
                                                    activeNode.data as WaitNodeData
                                                ).delay || 0;
                                            const newValue = Math.max(
                                                0,
                                                current - 0.1,
                                            );
                                            setNodes((nds) =>
                                                nds.map((n) =>
                                                    n.id === activeNode.id
                                                        ? {
                                                              ...n,
                                                              data: {
                                                                  ...(n.data as WaitNodeData),
                                                                  delay:
                                                                      Math.round(
                                                                          newValue *
                                                                              10,
                                                                      ) / 10,
                                                              },
                                                          }
                                                        : n,
                                                ),
                                            );
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
                                        value={
                                            (activeNode.data as WaitNodeData)
                                                .delay
                                        }
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const num = parseFloat(val);
                                            if (
                                                val === "" ||
                                                (!isNaN(num) && num >= 0)
                                            ) {
                                                setNodes((nds) =>
                                                    nds.map((n) =>
                                                        n.id === activeNode.id
                                                            ? {
                                                                  ...n,
                                                                  data: {
                                                                      ...(n.data as WaitNodeData),
                                                                      delay:
                                                                          val ===
                                                                          ""
                                                                              ? 0
                                                                              : num,
                                                                  },
                                                              }
                                                            : n,
                                                    ),
                                                );
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            const num = parseFloat(val);
                                            if (isNaN(num) || num < 0) {
                                                setNodes((nds) =>
                                                    nds.map((n) =>
                                                        n.id === activeNode.id
                                                            ? {
                                                                  ...n,
                                                                  data: {
                                                                      ...(n.data as WaitNodeData),
                                                                      delay: 0,
                                                                  },
                                                              }
                                                            : n,
                                                    ),
                                                );
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
                                            const current =
                                                (
                                                    activeNode.data as WaitNodeData
                                                ).delay || 0;
                                            const newValue = current + 0.1;
                                            setNodes((nds) =>
                                                nds.map((n) =>
                                                    n.id === activeNode.id
                                                        ? {
                                                              ...n,
                                                              data: {
                                                                  ...(n.data as WaitNodeData),
                                                                  delay:
                                                                      Math.round(
                                                                          newValue *
                                                                              10,
                                                                      ) / 10,
                                                              },
                                                          }
                                                        : n,
                                                ),
                                            );
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
                        )}
                        {activeNode?.type === "condition" && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                <label style={{ fontSize: 12 }}>
                                    Количество веток
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={
                                        (activeNode.data as ConditionNodeData)
                                            .branches.length
                                    }
                                    onChange={(e) => {
                                        const nextCount = Math.max(
                                            1,
                                            parseInt(e.target.value || "1", 10),
                                        );
                                        setNodes((nds) =>
                                            nds.map((n) => {
                                                if (n.id !== activeNode.id)
                                                    return n;
                                                const data =
                                                    n.data as ConditionNodeData;
                                                const current =
                                                    data.branches || [];
                                                const next = current.slice(
                                                    0,
                                                    nextCount,
                                                );
                                                while (
                                                    next.length < nextCount
                                                ) {
                                                    next.push({
                                                        condition: {
                                                            variable: "",
                                                            operator: "==",
                                                            value: "",
                                                        },
                                                    });
                                                }
                                                return {
                                                    ...n,
                                                    data: {
                                                        ...data,
                                                        branches: next,
                                                    },
                                                };
                                            }),
                                        );
                                    }}
                                    style={{
                                        padding: 6,
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 6,
                                    }}
                                />
                            </div>
                        )}
                        {activeNode?.type === "script" && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 6,
                                    }}
                                >
                                    <label style={{ fontSize: 12 }}>
                                        Загрузить файл
                                    </label>
                                    <input
                                        type="file"
                                        accept=".py,.pyw"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const content = event.target
                                                    ?.result as string;
                                                setNodes((nds) =>
                                                    nds.map((n) =>
                                                        n.id === activeNode.id
                                                            ? {
                                                                  ...n,
                                                                  data: {
                                                                      ...(n.data as ScriptNodeData),
                                                                      script: content,
                                                                      language:
                                                                          "python",
                                                                  },
                                                              }
                                                            : n,
                                                    ),
                                                );
                                            };
                                            reader.onerror = () => {
                                                alert(
                                                    "Ошибка при чтении файла",
                                                );
                                            };
                                            reader.readAsText(file);
                                            e.target.value = "";
                                        }}
                                        style={{
                                            padding: 6,
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 6,
                                        }}
                                    />
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#6b7280",
                                        }}
                                    >
                                        Поддерживаются: .py, .pyw
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 6,
                                    }}
                                >
                                    <label style={{ fontSize: 12 }}>
                                        Скрипт
                                    </label>
                                    <div
                                        style={{
                                            position: "relative",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 6,
                                            overflow: "hidden",
                                            background: "#1e1e1e",
                                        }}
                                    >
                                        <div
                                            id={`syntax-${activeNode.id}`}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                pointerEvents: "none",
                                                padding: 12,
                                                overflow: "hidden",
                                                boxSizing: "border-box",
                                            }}
                                        >
                                            <SyntaxHighlighter
                                                language={
                                                    (
                                                        activeNode.data as ScriptNodeData
                                                    ).language
                                                }
                                                style={vscDarkPlus}
                                                wrapLongLines={true}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: 0,
                                                    background: "transparent",
                                                    fontSize: "13px",
                                                    fontFamily: "monospace",
                                                    lineHeight: "1.5",
                                                    overflow: "visible",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                }}
                                                codeTagProps={{
                                                    style: {
                                                        fontFamily: "monospace",
                                                        fontSize: "13px",
                                                        lineHeight: "1.5",
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word",
                                                    },
                                                }}
                                                PreTag="div"
                                            >
                                                {(
                                                    activeNode.data as ScriptNodeData
                                                ).script || " "}
                                            </SyntaxHighlighter>
                                        </div>
                                        <textarea
                                            id={`textarea-${activeNode.id}`}
                                            value={
                                                (
                                                    activeNode.data as ScriptNodeData
                                                ).script
                                            }
                                            onChange={(e) => {
                                                const script = e.target.value;
                                                setNodes((nds) =>
                                                    nds.map((n) =>
                                                        n.id === activeNode.id
                                                            ? {
                                                                  ...n,
                                                                  data: {
                                                                      ...(n.data as ScriptNodeData),
                                                                      script,
                                                                  },
                                                              }
                                                            : n,
                                                    ),
                                                );
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Tab") {
                                                    e.preventDefault();
                                                    const textarea =
                                                        e.currentTarget;
                                                    const start =
                                                        textarea.selectionStart;
                                                    const end =
                                                        textarea.selectionEnd;
                                                    const value =
                                                        textarea.value;
                                                    const tab = "    "; // 4 пробела

                                                    if (e.shiftKey) {
                                                        // Shift+Tab - удалить табуляцию
                                                        const beforeStart =
                                                            value.substring(
                                                                0,
                                                                start,
                                                            );
                                                        const lineStart =
                                                            beforeStart.lastIndexOf(
                                                                "\n",
                                                            ) + 1;
                                                        const lineBefore =
                                                            value.substring(
                                                                lineStart,
                                                                start,
                                                            );

                                                        if (
                                                            lineBefore.startsWith(
                                                                "    ",
                                                            )
                                                        ) {
                                                            const newValue =
                                                                value.substring(
                                                                    0,
                                                                    lineStart,
                                                                ) +
                                                                lineBefore.substring(
                                                                    4,
                                                                ) +
                                                                value.substring(
                                                                    start,
                                                                );
                                                            const newStart =
                                                                Math.max(
                                                                    lineStart,
                                                                    start - 4,
                                                                );
                                                            const newEnd =
                                                                Math.max(
                                                                    lineStart,
                                                                    end - 4,
                                                                );
                                                            setNodes((nds) =>
                                                                nds.map((n) =>
                                                                    n.id ===
                                                                    activeNode.id
                                                                        ? {
                                                                              ...n,
                                                                              data: {
                                                                                  ...(n.data as ScriptNodeData),
                                                                                  script: newValue,
                                                                              },
                                                                          }
                                                                        : n,
                                                                ),
                                                            );
                                                            setTimeout(() => {
                                                                textarea.setSelectionRange(
                                                                    newStart,
                                                                    newEnd,
                                                                );
                                                            }, 0);
                                                        }
                                                    } else {
                                                        // Tab - вставить табуляцию
                                                        const newValue =
                                                            value.substring(
                                                                0,
                                                                start,
                                                            ) +
                                                            tab +
                                                            value.substring(
                                                                end,
                                                            );
                                                        const newStart =
                                                            start + tab.length;
                                                        const newEnd = newStart;
                                                        setNodes((nds) =>
                                                            nds.map((n) =>
                                                                n.id ===
                                                                activeNode.id
                                                                    ? {
                                                                          ...n,
                                                                          data: {
                                                                              ...(n.data as ScriptNodeData),
                                                                              script: newValue,
                                                                          },
                                                                      }
                                                                    : n,
                                                            ),
                                                        );
                                                        setTimeout(() => {
                                                            textarea.setSelectionRange(
                                                                newStart,
                                                                newEnd,
                                                            );
                                                        }, 0);
                                                    }
                                                }
                                            }}
                                            onScroll={(e) => {
                                                const syntaxDiv =
                                                    document.getElementById(
                                                        `syntax-${activeNode.id}`,
                                                    );
                                                if (syntaxDiv) {
                                                    syntaxDiv.scrollTop =
                                                        e.currentTarget.scrollTop;
                                                    syntaxDiv.scrollLeft =
                                                        e.currentTarget.scrollLeft;
                                                }
                                            }}
                                            placeholder="Введите скрипт..."
                                            spellCheck={false}
                                            style={{
                                                position: "relative",
                                                zIndex: 1,
                                                width: "100%",
                                                minHeight: 300,
                                                padding: 12,
                                                border: "none",
                                                fontFamily: "monospace",
                                                fontSize: 13,
                                                lineHeight: "1.5",
                                                background: "transparent",
                                                color: "transparent",
                                                overflow: "auto",
                                                caretColor: "#d4d4d4",
                                                resize: "vertical",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                tabSize: 4,
                                                whiteSpace: "pre",
                                                overflowWrap: "normal",
                                                wordWrap: "normal",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {showPreview && (
                    <PreviewModal
                        chatbotId={String(_chatbotId)}
                        onClose={() => setShowPreview(false)}
                    />
                )}
                {showPublish && (
                    <PublishModal
                        chatbotId={String(_chatbotId)}
                        onClose={() => setShowPublish(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Editor;
