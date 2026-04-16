import type { Chatbot, NodeExport, EdgeExport, Variable } from "../types/chatbot";

function toNumberId(id: string | number) {
    // prefer numeric id when possible
    const n = typeof id === "number" ? id : Number(id);
    return Number.isNaN(n) ? Date.now() : n;
}

export default function parseBackendChatbot(payload: any): Chatbot {
    const variables: Variable[] = Array.isArray(payload?.variables)
        ? payload.variables.map((v: any) => ({ name: String(v.name), type: v.type === "number" ? "number" : "string" }))
        : [];

    const bot_id = payload?.bot_id ?? payload?.botId ?? 0;
    const bot_name = payload?.bot_name ?? payload?.name ?? "";

    const graph = payload?.graph ?? {};

    const nodesRecord: Record<number, NodeExport> = {};
    const edges: EdgeExport[] = [];

    if (graph && graph.nodes && typeof graph.nodes === "object") {
        const entries: [string, any][] = Object.entries(graph.nodes as Record<string, any>);
        for (const [key, nRaw] of entries) {
            const n: any = nRaw;
            const id = toNumberId(key);

            const typeRaw = (n.type || n.node_type || "").toString().toLowerCase();

            switch (typeRaw) {
                case "set_variable":
                case "setvar":
                    nodesRecord[id] = {
                        node_id: id,
                        type: "setvar",
                        ...(n.position ? { position: n.position } : {}),
                        assigned_variable: n.assigned_variable ?? n.variable ?? "",
                        operation: n.operation ?? n.op ?? "=",
                        operand: n.operand ?? n.value ?? "",
                    } as NodeExport;
                    break;
                case "set_message":
                case "setmessage": {
                    const bodies: any[] = [];
                    if (n.text) bodies.push({ type: "text", bodyData: { text: n.text } });
                    if (Array.isArray(n.images)) bodies.push({ type: "image", bodyData: n.images.map((url: string) => ({ url, isVariable: false })) });
                    if (Array.isArray(n.files)) bodies.push(...n.files.map((path: string) => ({ type: "file", bodyData: { path, isVariable: false } })));
                    // support choice options -> buttons (only if not empty)
                    const choiceList = n.choise_options ?? n.choice_options;
                    if (Array.isArray(choiceList) && choiceList.length > 0) {
                        bodies.push({ type: "buttons", bodyData: { buttons: choiceList.map((b: any) => ({ label: String(b.label ?? b) })) } });
                    }

                    nodesRecord[id] = {
                        node_id: id,
                        type: "setmessage",
                        ...(n.position ? { position: n.position } : {}),
                        bodies,
                    } as NodeExport;
                    break;
                }
                case "send_message":
                case "sendmessage":
                    nodesRecord[id] = { node_id: id, type: "sendmessage", ...(n.position ? { position: n.position } : {}) } as NodeExport;
                    break;
                case "text_answer":
                case "textanswer":
                    nodesRecord[id] = { node_id: id, type: "textanswer", ...(n.position ? { position: n.position } : {}), variable: n.assigned_variable ?? n.variable ?? "" } as NodeExport;
                    break;
                case "wait":
                    nodesRecord[id] = {
                        node_id: id,
                        type: "wait",
                        ...(n.position ? { position: n.position } : {}),
                        // accept either `delay` or backend `wait_time`
                        delay: n.delay ?? n.wait_time ?? n.waitTime ?? 0,
                    } as NodeExport;
                    break;
                case "condition": {
                    const rawBranches = n.branches ?? n.data?.branches ?? [];
                    const branches = (rawBranches || []).map((b: any) => {
                        const cond = b.condition ?? b;
                        const variable = cond.variable ?? cond.variable_left ?? cond.left ?? "";
                        const operator = cond.operator ?? cond.operation ?? cond.op ?? "==";
                        const value = cond.value ?? cond.variable_right ?? cond.right ?? "";
                        return {
                            condition: {
                                variable,
                                operator,
                                value,
                            },
                            next_node_id: String(b.next_node_id ?? b.next ?? b.target ?? ""),
                        };
                    });

                    nodesRecord[id] = {
                        node_id: id,
                        type: "condition",
                        ...(n.position ? { position: n.position } : {}),
                        branches,
                        default_next_node_id: String(n.default_next_node_id ?? n.defaultNext ?? n.default_next ?? n.next_node_id ?? ""),
                    } as NodeExport;
                    break;
                }
                case "script":
                case "script_execution":
                    nodesRecord[id] = {
                        node_id: id,
                        type: "script",
                        ...(n.position ? { position: n.position } : {}),
                        script: n.script ?? "",
                        language: n.language ?? "python",
                    } as NodeExport;
                    break;
                default:
                    // fallback: preserve payload inside a setmessage text body
                    nodesRecord[id] = { node_id: id, type: "setmessage", bodies: [{ type: "text", bodyData: { text: JSON.stringify(n) } }] } as NodeExport;
            }

            // Build edges from next_node_id(s)
            const next = n.next_node_id ?? n.nextNodeId ?? n.next;
            if (next !== undefined && next !== null) {
                // single pointer
                const targets = Array.isArray(next) ? next : [next];
                for (const t of targets) {
                    const tid = toNumberId(t);
                    edges.push({ source: id, target: tid });
                }
            }
        }
    }

    // Also support explicit edges list from backend
    if (graph.edges && Array.isArray(graph.edges)) {
        for (const e of graph.edges) {
            const src = toNumberId(e.source);
            const tgt = toNumberId(e.target);
            edges.push({ source: src, target: tgt, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle });
        }
    }

    // Reconcile condition branches from explicit edges: if an edge has sourceHandle like "bottom-<index>",
    // assign that target to the corresponding branch.next_node_id. Also set default_next_node_id when appropriate.
    for (const e of edges) {
        const src = e.source;
        const tgt = e.target;
        const srcHandle = e.sourceHandle ?? "";
        const node = nodesRecord[src] as any;
        if (!node) continue;
        if (node.type === "condition") {
            // match handles like bottom-0, bottom-1
            const m = String(srcHandle).match(/bottom-(\d+)/i);
            if (m) {
                const idx = Number(m[1]);
                node.branches = node.branches || [];
                // ensure branch exists
                if (!node.branches[idx]) {
                    node.branches[idx] = { condition: {}, next_node_id: String(tgt) };
                } else {
                    // set next_node_id (overwrite empty/undefined)
                    node.branches[idx].next_node_id = String(tgt);
                }
                continue;
            }

            // some backends may not encode index; treat plain 'bottom' or 'default' as default branch
            if (String(srcHandle).toLowerCase().includes("default") || String(srcHandle).toLowerCase() === "bottom" || String(srcHandle).toLowerCase() === "bottom-default") {
                node.default_next_node_id = String(tgt);
                continue;
            }
        }
    }

    const rootRaw = graph.root ?? graph.root_id ?? null;
    const root = rootRaw !== null && rootRaw !== undefined ? toNumberId(rootRaw) : Object.keys(nodesRecord).length ? Number(Object.keys(nodesRecord)[0]) : 0;

    return {
        variables,
        bot_id: bot_id,
        bot_name: bot_name,
        graph: {
            root,
            nodes: nodesRecord,
            edges: edges,
        },
    } as Chatbot;
}
