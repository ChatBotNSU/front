import { useState } from "react";

import { readFlowInterface, type FlowVarDecl } from "@/entities/flow/model/types";
import { Button, Modal, fieldInput } from "@/shared/ui";

/**
 * Edits a flow's declared interface (inputs / outputs) — the contract a
 * subgraph caller maps against. Stored in `flow.metadata.inputs` /
 * `metadata.outputs`. Variables collected inside the flow but NOT listed as
 * outputs stay private (only relevant when the flow is called as an
 * isolated subgraph; standalone runs are unaffected).
 */
export function FlowInterfaceEditor({
  metadata,
  onSave,
  onClose,
}: {
  metadata: Record<string, unknown>;
  onSave: (next: { inputs: FlowVarDecl[]; outputs: FlowVarDecl[] }) => void;
  onClose: () => void;
}) {
  const initial = readFlowInterface(metadata);
  const [inputs, setInputs] = useState<FlowVarDecl[]>(initial.inputs);
  const [outputs, setOutputs] = useState<FlowVarDecl[]>(initial.outputs);

  const trimmed = (list: FlowVarDecl[]): FlowVarDecl[] =>
    list
      .map((v) => ({ name: v.name.trim(), description: v.description?.trim() || undefined }))
      .filter((v) => v.name);

  function save() {
    onSave({ inputs: trimmed(inputs), outputs: trimmed(outputs) });
    onClose();
  }

  return (
    <Modal title="Интерфейс флоу" onClose={onClose} size="lg">
      <p className="mb-4 text-xs text-muted">
        Объявите входы и выходы — это контракт для вызова этого флоу как подграфа.
        Внутри подграфа доступны только переменные из списка входов;
        наружу проходят только переменные из списка выходов.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <VarList
          title="Входы (inputs)"
          help="Что нужно прокинуть из родителя при вызове"
          addLabel="+ вход"
          values={inputs}
          onChange={setInputs}
        />
        <VarList
          title="Выходы (outputs)"
          help="Что родитель сможет забрать обратно"
          addLabel="+ выход"
          values={outputs}
          onChange={setOutputs}
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={save}>Сохранить</Button>
      </div>
    </Modal>
  );
}

function VarList({
  title,
  help,
  addLabel,
  values,
  onChange,
}: {
  title: string;
  help: string;
  addLabel: string;
  values: FlowVarDecl[];
  onChange: (next: FlowVarDecl[]) => void;
}) {
  function update(index: number, patch: Partial<FlowVarDecl>) {
    onChange(values.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...values, { name: "", description: "" }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted">{help}</div>
      </div>

      <div className="flex flex-col gap-2">
        {values.length === 0 && (
          <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted">
            пусто
          </div>
        )}
        {values.map((v, i) => (
          <div key={i} className="rounded-md border border-border bg-panel-2 p-2">
            <div className="flex items-center gap-2">
              <input
                className={fieldInput}
                placeholder="имя (latin / snake_case)"
                value={v.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <button
                onClick={() => remove(i)}
                className="text-muted hover:text-red-300"
                title="Удалить"
              >
                ✕
              </button>
            </div>
            <input
              className={`${fieldInput} mt-1.5`}
              placeholder="описание (необязательно)"
              value={v.description ?? ""}
              onChange={(e) => update(i, { description: e.target.value })}
            />
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={add} title="Добавить">
        {addLabel}
      </Button>
    </div>
  );
}
