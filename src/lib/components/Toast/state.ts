// src/lib/components/Toast/state.ts
import { writable } from "svelte/store";

export type ToastType = "error" | "success" | "info";

export type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  timeoutId?: ReturnType<typeof setTimeout>;
};

function createToastStore() {
  const { subscribe, update, set } = writable<ToastItem[]>([]);
  let nextId = 1;

  function remove(id: number) {
    update((items) => {
      const current = items.find((t) => t.id === id);
      if (current?.timeoutId) {
        clearTimeout(current.timeoutId);
      }
      return items.filter((t) => t.id !== id);
    });
  }

  function show(message: string, type: ToastType = "error", duration = 4000) {
    const id = nextId++;

    const toast: ToastItem = { id, message, type };

    if (duration > 0) {
      toast.timeoutId = setTimeout(() => {
        remove(id);
      }, duration);
    }

    update((items) => [toast, ...items].slice(0, 5)); // limit 5 toast
  }

  function clear() {
    set([]);
  }

  return {
    subscribe,
    show,
    remove,
    clear,
  };
}

export const toastStore = createToastStore();
