import { useEffect } from "react";

import { useEditorStore } from "../model/editorStore";

function isEditableTarget(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || (el as HTMLElement).isContentEditable;
}

/** Ctrl/Cmd + C / V / D for copy / paste / duplicate of selected nodes. */
export function useEditorHotkeys() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || isEditableTarget()) return;
      const key = e.key.toLowerCase();
      const { copySelection, paste } = useEditorStore.getState();

      if (key === "c") {
        copySelection();
      } else if (key === "v") {
        paste();
      } else if (key === "d") {
        e.preventDefault();
        copySelection();
        paste();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
