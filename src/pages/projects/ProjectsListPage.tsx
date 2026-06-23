import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/entities/project/api";
import { Button, Field, fieldInput, Modal, Spinner, toast } from "@/shared/ui";

export function ProjectsListPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (projects ?? []).filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [projects, query]);

  async function create() {
    if (!name.trim()) return;
    try {
      const project = await createProject.mutateAsync({ name });
      setCreating(false);
      setName("");
      navigate(`/projects/${project.id}`);
    } catch {
      toast.error("Не удалось создать проект");
    }
  }

  async function rename() {
    if (!renameTarget?.name.trim()) return;
    try {
      await updateProject.mutateAsync({ id: renameTarget.id, name: renameTarget.name });
      toast.success("Переименовано");
      setRenameTarget(null);
    } catch {
      toast.error("Не удалось переименовать");
    }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Удалить проект «${name}»?`)) return;
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Проект удалён");
    } catch {
      toast.error("Не удалось удалить");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Проекты</h1>
        <Button onClick={() => setCreating(true)}>+ Новый проект</Button>
      </header>

      {projects && projects.length > 0 && (
        <input
          className={`${fieldInput} mb-4`}
          placeholder="Поиск по названию…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {projects && projects.length === 0 && (
        <p className="text-muted">Пока нет проектов. Создайте первый — внутри будут боты и флоу.</p>
      )}
      {projects && projects.length > 0 && filtered.length === 0 && (
        <p className="text-muted">Ничего не найдено.</p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <li
            key={p.id}
            className="group rounded-lg border border-border bg-panel p-4 transition-colors hover:bg-panel-2"
          >
            <button onClick={() => navigate(`/projects/${p.id}`)} className="block w-full text-left">
              <span className="block font-medium">{p.name}</span>
              <span className="text-xs text-muted">{p.description || "Проект"}</span>
            </button>
            <div className="mt-3 flex justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setRenameTarget({ id: p.id, name: p.name })}
                className="text-xs text-muted hover:text-slate-200"
              >
                Переименовать
              </button>
              <button onClick={() => remove(p.id, p.name)} className="text-xs text-muted hover:text-red-400">
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>

      {creating && (
        <Modal title="Новый проект" onClose={() => setCreating(false)}>
          <form onSubmit={(e) => { e.preventDefault(); void create(); }} className="flex flex-col gap-4">
            <Field label="Название">
              <input className={fieldInput} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={!name.trim() || createProject.isPending}>
                Создать
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {renameTarget && (
        <Modal title="Переименовать проект" onClose={() => setRenameTarget(null)}>
          <form onSubmit={(e) => { e.preventDefault(); void rename(); }} className="flex flex-col gap-4">
            <Field label="Название">
              <input
                className={fieldInput}
                value={renameTarget.name}
                onChange={(e) => setRenameTarget({ ...renameTarget, name: e.target.value })}
                autoFocus
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenameTarget(null)}>
                Отмена
              </Button>
              <Button type="submit" disabled={!renameTarget.name.trim() || updateProject.isPending}>
                Сохранить
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
