// src/lib/stores/navigation.ts
import { writable } from "svelte/store";

export const navState = writable({
  from: "",
  data: null as any,
});
