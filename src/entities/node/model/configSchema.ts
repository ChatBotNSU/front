import type { NodeType } from "./types";

export type FieldType =
  | "text"
  | "textarea"
  | "code"
  | "number"
  | "boolean"
  | "select"
  | "keyvalue"
  | "stringlist"
  | "objectList"
  | "flowSelect"
  | "flowVersionSelect"
  | "integrationSelect";

export type ConfigField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  /** Sub-schema for each row of an `objectList` field. */
  itemFields?: ConfigField[];
  /** Label for the "add row" button of list fields. */
  addLabel?: string;
};

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => ({ value: m, label: m }));

/**
 * Per-node-type config field schemas. Nodes not listed here (or with extra keys)
 * fall back to the advanced JSON editor in the inspector.
 */
export const CONFIG_SCHEMAS: Partial<Record<NodeType, ConfigField[]>> = {
  send_message: [
    { key: "text", label: "Текст сообщения", type: "textarea", placeholder: "Привет, {{user_meta.first_name}}!" },
  ],
  user_input: [
    { key: "variable", label: "Сохранить ответ в переменную", type: "text", placeholder: "answer" },
  ],
  ai: [
    { key: "prompt", label: "Промпт", type: "textarea", placeholder: "Ответь на вопрос: {{text}}" },
    { key: "model", label: "Модель", type: "text", placeholder: "gpt-4o-mini" },
    { key: "output_var", label: "Переменная результата", type: "text", placeholder: "ai_result" },
  ],
  cron_trigger: [{ key: "cron", label: "Cron-расписание", type: "text", placeholder: "0 9 * * *" }],
  http_call: [
    { key: "method", label: "Метод", type: "select", options: HTTP_METHODS },
    { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com/{{id}}" },
    { key: "headers", label: "Заголовки", type: "keyvalue" },
    { key: "body", label: "Тело запроса (JSON)", type: "code" },
    { key: "output_var", label: "Переменная результата", type: "text" },
  ],
  crm: [
    {
      key: "provider", label: "Провайдер", type: "select",
      options: ["", "bitrix24", "amocrm", "hubspot", "salesforce"].map((v) => ({ value: v, label: v || "— (stub)" })),
    },
    {
      key: "action", label: "Действие", type: "select",
      options: ["find", "create", "update"].map((v) => ({ value: v, label: v })),
    },
    { key: "entity", label: "Сущность", type: "text", placeholder: "contact" },
    { key: "integration", label: "Интеграция", type: "integrationSelect" },
    { key: "secret_ref", label: "Секрет (имя)", type: "text" },
    { key: "fields", label: "Поля", type: "keyvalue" },
  ],
  payment: [
    {
      key: "provider", label: "Провайдер", type: "select",
      options: ["stripe", "yookassa", "tinkoff"].map((v) => ({ value: v, label: v })),
    },
    { key: "amount_var", label: "Переменная суммы", type: "text", placeholder: "amount" },
    { key: "currency", label: "Валюта", type: "text", placeholder: "RUB" },
    { key: "description", label: "Описание", type: "text" },
    { key: "integration", label: "Интеграция", type: "integrationSelect" },
  ],
  calendar: [
    {
      key: "provider", label: "Провайдер", type: "select",
      options: ["google", "calendly"].map((v) => ({ value: v, label: v })),
    },
    {
      key: "action", label: "Действие", type: "select",
      options: ["create", "slots", "cancel"].map((v) => ({ value: v, label: v })),
    },
    { key: "title", label: "Заголовок события", type: "text" },
    { key: "integration", label: "Интеграция", type: "integrationSelect" },
  ],
  sheets: [
    {
      key: "action", label: "Действие", type: "select",
      options: ["read", "append", "update"].map((v) => ({ value: v, label: v })),
    },
    { key: "spreadsheet_id", label: "ID таблицы", type: "text" },
    { key: "range", label: "Диапазон", type: "text", placeholder: "A1:C10" },
    { key: "integration", label: "Интеграция", type: "integrationSelect" },
  ],
  database: [
    {
      key: "action", label: "Действие", type: "select",
      options: ["query", "insert", "get", "update", "delete"].map((v) => ({ value: v, label: v })),
    },
    { key: "table", label: "Таблица", type: "text", placeholder: "clients" },
    { key: "output_var", label: "Переменная результата", type: "text" },
  ],
  sql: [
    { key: "connection", label: "Подключение (интеграция БД)", type: "integrationSelect" },
    { key: "sql", label: "SQL", type: "code", placeholder: "SELECT * FROM users WHERE id = :id" },
    { key: "output_var", label: "Переменная результата", type: "text" },
  ],
  code: [
    {
      key: "language", label: "Язык", type: "select",
      options: ["python", "js"].map((v) => ({ value: v, label: v })),
    },
    { key: "source", label: "Код", type: "code", placeholder: "__result__ = a + b" },
  ],
  subgraph: [
    { key: "flow_id", label: "Дочерний флоу", type: "flowSelect" },
    { key: "flow_version", label: "Версия", type: "flowVersionSelect" },
  ],
  notify: [
    { key: "channel", label: "Канал", type: "text" },
    { key: "text", label: "Текст", type: "textarea" },
  ],
  intent: [
    { key: "input_var", label: "Поле ввода", type: "text", placeholder: "text" },
    { key: "confidence", label: "Порог уверенности (0–1)", type: "number", placeholder: "0.6" },
    { key: "fallback", label: "Интент по умолчанию", type: "text" },
    {
      key: "intents", label: "Интенты", type: "objectList", addLabel: "+ интент",
      itemFields: [
        { key: "name", label: "Название", type: "text", placeholder: "greeting" },
        { key: "keywords", label: "Ключевые слова (через запятую)", type: "stringlist", placeholder: "привет, здравствуй" },
      ],
    },
  ],
  slot_fill: [
    { key: "max_attempts", label: "Попыток на слот", type: "number", placeholder: "3" },
    {
      key: "slots", label: "Слоты", type: "objectList", addLabel: "+ слот",
      itemFields: [
        { key: "name", label: "Имя слота", type: "text", placeholder: "phone" },
        { key: "question", label: "Вопрос", type: "text", placeholder: "Ваш телефон?" },
      ],
    },
  ],
  transform: [
    {
      key: "mappings", label: "Маппинг полей", type: "objectList", addLabel: "+ поле",
      itemFields: [
        { key: "from", label: "Источник", type: "text", placeholder: "{{user.name}}" },
        { key: "to", label: "Назначение", type: "text", placeholder: "name" },
      ],
    },
    { key: "output_var", label: "Переменная результата", type: "text" },
  ],
  loop: [
    { key: "array_var", label: "Массив (переменная)", type: "text", placeholder: "items" },
    { key: "item_var", label: "Имя элемента", type: "text", placeholder: "item" },
    { key: "body_node", label: "Нода тела (id)", type: "text" },
    { key: "max_items", label: "Макс. элементов", type: "number", placeholder: "100" },
  ],
};

export function getConfigFields(type: NodeType): ConfigField[] | undefined {
  return CONFIG_SCHEMAS[type];
}
