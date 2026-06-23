import { create } from "zustand";

export type ToastType = "success" | "error" | "info";
export type Toast = { id: number; type: ToastType; message: string };

type ToastState = {
  toasts: Toast[];
  remove: (id: number) => void;
  push: (type: ToastType, message: string) => void;
};

let counter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  push: (type, message) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => get().remove(id), 3500);
  },
}));

/** Imperative helper usable anywhere (event handlers, mutations). */
export const toast = {
  success: (m: string) => useToastStore.getState().push("success", m),
  error: (m: string) => useToastStore.getState().push("error", m),
  info: (m: string) => useToastStore.getState().push("info", m),
};
