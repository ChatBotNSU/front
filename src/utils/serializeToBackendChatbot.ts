import type { Chatbot, NodeExport } from "../types/chatbot";

type BackendNode = Record<string, any>;

/**
 * Convert internal Chatbot -> backend compact format.
 * - Ensures node ids are string keys in `graph.nodes`.
 * - Converts node types mapping (e.g. `setmessage` -> `set_message`).
 * - Converts `edges` array into `next_node_id` or `edges` depending on node shape.
 */
export default function serializeToBackendChatbot(chatbot: Chatbot) {
  const out: any = {
    variables: chatbot.variables || [],
    bot_id: chatbot.bot_id,
    bot_name: chatbot.bot_name,
    graph: {
      root: String(chatbot.graph?.root ?? ""),
      nodes: {} as Record<string, BackendNode>,
    },
  };

  const nodes = chatbot.graph?.nodes || {};
  const edges = chatbot.graph?.edges || [];

  // Helper to map internal frontend type -> backend type
  const typeMap: Record<string, string> = {
    setmessage: "set_message",
    setvar: "set_variable",
    sendmessage: "send_message",
    textanswer: "text_answer",
    fileanswer: "file_answer",
    wait: "wait",
    condition: "condition",
    // frontend `script` -> backend `script_execution`
    script: "script_execution",
  };

  // Reverse mapping to handle nodes that already have backend-style types
  const reverseTypeMap: Record<string, string> = {
    set_message: "setmessage",
    set_variable: "setvar",
    send_message: "sendmessage",
    text_answer: "textanswer",
    file_answer: "fileanswer",
    script_execution: "script",
    // these are already frontend-like
    wait: "wait",
    condition: "condition",
  };

  // First, emit node bodies from NodeExport entries
  Object.values(nodes).forEach((n: NodeExport | any) => {
    const nid = String(n.node_id ?? n.nodeId ?? n.id ?? n.node_id ?? "");
    const rawType = String(n.type ?? "");
    // normalize to frontend type for switch handling
    const frontendType = reverseTypeMap[rawType] ?? rawType;
    const backendType = typeMap[frontendType] ?? rawType;
    const inner: BackendNode = {};

    switch (frontendType) {
      case "setmessage":
        // bodies -> convert to text/images/files/audio arrays if possible
        const bodies = (n.bodies || (n.data && n.data.bodies) || []) as any[];
        // Prefer simplified fields: text, images, files, audio arrays if possible
        // Collect text concatenation (if multiple text bodies, join with newline)
        const texts: string[] = [];
        const images: any[] = [];
        const audios: any[] = [];
        const files: any[] = [];
        const choise_options: any[] = [];

        bodies.forEach((b) => {
          if (!b) return;
          if (b.type === "text") {
            const t = b.bodyData?.text ?? b.text ?? "";
            texts.push(t);
          } else if (b.type === "image") {
            images.push(b.bodyData ?? b);
          } else if (b.type === "audio") {
            audios.push(b.bodyData ?? b);
          } else if (b.type === "file") {
            files.push(b.bodyData ?? b);
          } else if (b.type === "choices" || b.type === "choice") {
            choise_options.push(...(b.options || b.choice_options || []));
          }
        });

        // Always include these fields (backend requires them even if empty)
        inner.text = texts.length ? texts.join("\n") : "";
        inner.images = images;
        inner.audios = audios;
        inner.files = files;
        inner.choise_options = choise_options;

        break;
      case "wait":
        // backend expects `wait_time` field (integer)
        inner.wait_time = Number(n.wait_time ?? n.wait_time ?? n.delay ?? n.data?.delay ?? 0);
        break;
      case "setvar":
        inner.assigned_variable = n.assigned_variable ?? n.assignedVariable ?? n.data?.assigned_variable;
        inner.operation = n.operation ?? n.data?.operation ?? "=";
        inner.operand = n.operand ?? n.data?.operand ?? "";
        break;
      case "textanswer":
        inner.assigned_variable = n.variable ?? n.assigned_variable ?? n.data?.variable;
        break;
      case "fileanswer":
        inner.assigned_variable = n.variable ?? n.assigned_variable ?? n.data?.variable;
        break;
      case "script":
        inner.script = n.script ?? n.data?.script ?? "";
        inner.language = n.language ?? n.data?.language ?? "python";
        // ensure explicit next_node_id if present on node data
        inner.next_node_id = String(
          n.next_node_id ?? n.nextNodeId ?? n.data?.next_node_id ?? n.data?.nextNodeId ?? ""
        );
        break;
      case "condition":
        // normalize branches to [{ condition: { variable_left, operation, variable_right }, next_node_id }]
        const rawBranches = n.branches ?? n.data?.branches ?? [];
        inner.branches = (rawBranches || []).map((b: any) => {
          const cond = b.condition ?? b;
          const variable_left = cond.variable ?? cond.variable_left ?? cond.left ?? "";
          const operation = cond.operator ?? cond.operation ?? "==";
          const variable_right = cond.value ?? cond.variable_right ?? cond.right ?? "";
          return {
            condition: {
              variable_left,
              operation,
              variable_right,
            },
            next_node_id: String(b.next_node_id ?? b.next ?? b.target ?? ""),
          };
        });
        // default next id (backend expects `default_next_node_id`)
        inner.default_next_node_id = String(n.default_next_node_id ?? n.defaultNext ?? n.default_next ?? n.next_node_id ?? "");
        break;
      case "sendmessage":
        // nothing extra
        break;
      default:
        // copy known simple props
        Object.assign(inner, n);
    }

    // The backend expects nodes[id] to include a `type` discriminator field
    const nodeObj: BackendNode = { type: backendType, ...inner };
    out.graph.nodes[nid] = nodeObj;
  });

  // Now, convert edges into next_node_id references when possible.
  // We'll try to attach `next_node_id` to source nodes when the source has a single outgoing edge and no handles.
  const outgoing = new Map<string, any[]>();
  edges.forEach((e: any) => {
    const s = String(e.source);
    const t = String(e.target);
    outgoing.set(s, (outgoing.get(s) || []).concat([{ edge: e, target: t }]));
  });

  outgoing.forEach((arr, sourceId) => {
    if (!out.graph.nodes[sourceId]) return;
    const nodeObj = out.graph.nodes[sourceId] as Record<string, any>;
    // If the node has any outgoing edges and doesn't yet have next_node_id, set it to the first target.
    // This ensures newly created connections are reflected as next_node_id instead of leaving it empty.
    if (arr.length > 0 && (!nodeObj.next_node_id || nodeObj.next_node_id === "")) {
      // Set next_node_id to the first outgoing target unconditionally (helps for newly created nodes)
      nodeObj.next_node_id = String(arr[0].target);
    }
  });

  // Always include edges array so backend can reconstruct ambiguous connections
  out.graph.edges = edges.map((e: any) => ({
    source: String(e.source),
    target: String(e.target),
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
  }));

  // Diagnostic: detect suspicious next_node_id values like "0" and warn
  Object.keys(out.graph.nodes).forEach((k) => {
    const node = out.graph.nodes[k] as Record<string, any>;
    if (node.next_node_id === "0") {
      try {
        // eslint-disable-next-line no-console
        console.warn("serializeToBackendChatbot: suspicious next_node_id '0' for node", k, node);
      } catch (e) {}
    }
  });

  // Ensure required/default fields exist for backend validation
  const ensureNextIdFor = new Set([
    "set_message",
    "set_variable",
    "send_message",
    "text_answer",
    "file_answer",
  // wait nodes require next_node_id per spec
    "wait",
    // script_execution should also include next_node_id
    "script_execution",
  ]);

  Object.keys(out.graph.nodes).forEach((k) => {
    const node = out.graph.nodes[k] as Record<string, any>;
    // ensure next_node_id exists for certain node types
    if (ensureNextIdFor.has(node.type)) {
      if (node.next_node_id === undefined || node.next_node_id === null) {
        node.next_node_id = "";
      }
    }
  });

  return out;
}
