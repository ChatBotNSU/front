/** Node types — mirror of backend models/node.py::NodeType. */
export const NODE_TYPES = [
  "message_trigger",
  "webhook_trigger",
  "cron_trigger",
  "send_message",
  "user_input",
  "intent",
  "slot_fill",
  "ai",
  "agent",
  "transform",
  "loop",
  "http_call",
  "crm",
  "notify",
  "sheets",
  "calendar",
  "payment",
  "wait",
  "handoff",
  "subgraph",
  "end",
  "code",
  "database",
  "sql",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export type ExecCondition = {
  if: string;
  eq?: unknown;
  neq?: unknown;
  gt?: unknown;
  lt?: unknown;
  contains?: unknown;
  exists?: boolean;
  not_exists?: boolean;
  in?: unknown[];
  goto: string;
};

export type ExecOut = {
  conditions: ExecCondition[];
  fallback?: string | null;
};

export type NodePosition = { x: number; y: number };

/** Mirror of backend Node (the persisted shape). */
export type FlowNodeModel = {
  id: string;
  type: NodeType;
  label: string;
  data_in: Record<string, unknown>;
  data_out: Record<string, string>;
  config: Record<string, unknown>;
  exec_out: ExecOut;
  position: NodePosition;
};

export type NodeGroup =
  | "trigger"
  | "message"
  | "logic"
  | "data"
  | "integration"
  | "flow"
  | "advanced";

export type NodeSpec = {
  type: NodeType;
  label: string;
  group: NodeGroup;
  description: string;
  /** Default config applied when a node is created from the palette. */
  defaultConfig: Record<string, unknown>;
  /** Terminal nodes (end) have no outgoing edges. */
  terminal?: boolean;
};

export const NODE_GROUPS: { id: NodeGroup; label: string }[] = [
  { id: "trigger", label: "Триггеры" },
  { id: "message", label: "Сообщения" },
  { id: "logic", label: "Логика и AI" },
  { id: "data", label: "Данные" },
  { id: "integration", label: "Интеграции" },
  { id: "flow", label: "Управление" },
  { id: "advanced", label: "Продвинутое" },
];

export const NODE_CATALOG: Record<NodeType, NodeSpec> = {
  message_trigger: { type: "message_trigger", label: "Сообщение", group: "trigger", description: "Старт по входящему сообщению", defaultConfig: {} },
  webhook_trigger: { type: "webhook_trigger", label: "Вебхук", group: "trigger", description: "Старт по внешнему вебхуку", defaultConfig: {} },
  cron_trigger: { type: "cron_trigger", label: "Расписание", group: "trigger", description: "Старт по cron-расписанию", defaultConfig: { cron: "0 9 * * *" } },
  send_message: { type: "send_message", label: "Отправить сообщение", group: "message", description: "Сообщение пользователю", defaultConfig: { text: "" } },
  user_input: { type: "user_input", label: "Ждать ответ", group: "message", description: "Пауза до ответа пользователя", defaultConfig: { variable: "answer" } },
  intent: { type: "intent", label: "Интент", group: "logic", description: "Распознавание намерения по словам", defaultConfig: { intents: {} } },
  slot_fill: { type: "slot_fill", label: "Сбор слотов", group: "logic", description: "Заполнение нескольких полей", defaultConfig: { slots: [] } },
  ai: { type: "ai", label: "AI", group: "logic", description: "Запрос к LLM", defaultConfig: { prompt: "", model: "gpt-4o-mini" } },
  agent: { type: "agent", label: "AI-агент", group: "logic", description: "LLM извлекает несколько полей из одного сообщения (agent / fail-safe)", defaultConfig: { mode: "agent", confirm: true, model: "yandexgpt-lite", fields: [] } },
  transform: { type: "transform", label: "Трансформация", group: "data", description: "Преобразование данных", defaultConfig: {} },
  loop: { type: "loop", label: "Цикл", group: "data", description: "Итерация по списку", defaultConfig: {} },
  http_call: { type: "http_call", label: "HTTP-запрос", group: "integration", description: "Внешний HTTP-вызов", defaultConfig: { method: "GET", url: "" } },
  crm: { type: "crm", label: "CRM", group: "integration", description: "Bitrix/Amo/HubSpot/Salesforce", defaultConfig: { action: "find", entity: "contact" } },
  notify: { type: "notify", label: "Уведомление", group: "integration", description: "Оповещение оператора", defaultConfig: {} },
  sheets: { type: "sheets", label: "Google Sheets", group: "integration", description: "Чтение/запись таблиц", defaultConfig: { action: "append" } },
  calendar: { type: "calendar", label: "Календарь", group: "integration", description: "Google Calendar / Calendly", defaultConfig: { action: "create" } },
  payment: { type: "payment", label: "Оплата", group: "integration", description: "Stripe/YooKassa/Tinkoff", defaultConfig: { currency: "RUB" } },
  wait: { type: "wait", label: "Ожидание", group: "flow", description: "Пауза до события/таймера", defaultConfig: {} },
  handoff: { type: "handoff", label: "Оператор", group: "flow", description: "Передача живому оператору", defaultConfig: {} },
  subgraph: { type: "subgraph", label: "Подграф", group: "flow", description: "Вызов другого флоу", defaultConfig: { flow_id: "" } },
  end: { type: "end", label: "Конец", group: "flow", description: "Завершение ветки", defaultConfig: {}, terminal: true },
  code: { type: "code", label: "Код", group: "advanced", description: "Python в песочнице", defaultConfig: { language: "python", source: "" } },
  database: { type: "database", label: "Таблица данных", group: "data", description: "Встроенные таблицы проекта", defaultConfig: { action: "query", table: "" } },
  sql: { type: "sql", label: "SQL", group: "advanced", description: "Запрос во внешнюю БД", defaultConfig: { sql: "" } },
};

export function nodeSpec(type: NodeType): NodeSpec {
  return NODE_CATALOG[type];
}

/** Hex colors per group — shared by node cards and the minimap. */
export const NODE_GROUP_HEX: Record<NodeGroup, string> = {
  trigger: "#10b981",
  message: "#0ea5e9",
  logic: "#8b5cf6",
  data: "#f59e0b",
  integration: "#f43f5e",
  flow: "#64748b",
  advanced: "#d946ef",
};

export function nodeColor(type: NodeType): string {
  return NODE_GROUP_HEX[NODE_CATALOG[type].group];
}
