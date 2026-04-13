<script lang="ts">
  import { teleport } from "$lib/utils";
  import { toastStore, type ToastItem } from "./state";
  //   import { derived } from "svelte/store";

  const toasts = toastStore; // alias biar enak dibaca
</script>

<div use:teleport class="toast-stack" aria-live="polite" aria-atomic="false">
  {#each $toasts as toast (toast.id)}
    <div
      class="toast"
      class:toast-error={toast.type === "error"}
      class:toast-success={toast.type === "success"}
      class:toast-info={toast.type === "info"}
      role="alert"
    >
      {#if toast.type === "error"}
        <svg
          class="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      {:else if toast.type === "success"}
        <svg
          class="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M5 13l4 4L19 7"
          />
        </svg>
      {:else}
        <svg
          class="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      {/if}

      <span class="toast-msg">{toast.message}</span>

      <button
        class="toast-close"
        onclick={() => toastStore.remove(toast.id)}
        aria-label="Tutup"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-stack {
    position: fixed;
    top: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: min(32rem, calc(100vw - 2rem));
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    border: 1px solid;
    backdrop-filter: blur(12px);
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: normal;
    animation: toastIn 280ms cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }

  .toast-error {
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.3);
    color: #fca5a5;
  }

  .toast-success {
    background: rgba(52, 211, 153, 0.12);
    border-color: rgba(52, 211, 153, 0.3);
    color: #6ee7b7;
  }

  .toast-info {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.25);
    color: white;
  }

  .toast-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }

  .toast-msg {
    flex: 1;
    line-height: 1.4;
  }

  .toast-close {
    flex-shrink: 0;
    margin-left: 0.25rem;
    opacity: 0.5;
    cursor: pointer;
    background: none;
    border: none;
    color: inherit;
    padding: 0.125rem;
    transition: opacity 150ms;
  }

  .toast-close:hover {
    opacity: 1;
  }

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
