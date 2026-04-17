<script lang="ts">
  import { ChevronDown, Globe, User } from "@boxicons/svelte";
  import type { SupportedGameConfig, ZoneInputMode } from "./types";

  let {
    userId = $bindable(""),
    serverId = $bindable(""),
    gameConfig = null,
    zoneInputMode = "text",
  }: {
    userId: string;
    serverId: string;
    gameConfig?: SupportedGameConfig | null;
    zoneInputMode?: ZoneInputMode;
  } = $props();

  let serverDropdownOpen = $state(false);

  function selectServer(server: string) {
    serverId = server;
    serverDropdownOpen = false;
  }
</script>

<div class="step-card">
  <div class="step-accent"></div>
  <div class="px-5 py-4">
    <div class="step-header">
      <div class="step-badge">1</div>
      <div>
        <h3 class="step-title">Masukkan Data Akun</h3>
        {#if gameConfig}
          <p class="step-subtitle">{gameConfig.label}</p>
        {/if}
      </div>
    </div>

    <div
      class={`grid grid-cols-1 ${zoneInputMode === "none" ? "" : "sm:grid-cols-2"} gap-3`}
    >
      <div class="field">
        <label class="field-label" for="primary_id">User ID</label>
        <div class="input-wrap">
          <span class="input-icon">
            <User class="input-icon" size="sm" opacity={0.7} />
          </span>
          <input
            id="primary_id"
            type="text"
            bind:value={userId}
            placeholder="Masukkan User ID"
            class="field-input"
          />
        </div>
      </div>

      {#if zoneInputMode !== "none"}
        <div class="field">
          <label class="field-label" for="server_id">
            {zoneInputMode === "select" ? "Server" : "Server ID"}
          </label>
          <div class="input-wrap">
            <span class="input-icon">
              <Globe class="input-icon" size="sm" opacity={0.7} />
            </span>

            {#if zoneInputMode === "select"}
              <button
                id="server_id"
                type="button"
                class="field-input field-select-btn"
                onclick={() => (serverDropdownOpen = !serverDropdownOpen)}
              >
                <span class:placeholder={!serverId}>
                  {serverId ? serverId.toUpperCase() : "Pilih Server"}
                </span>
                <span
                  class={`select-chevron ${serverDropdownOpen ? "open" : ""}`}
                >
                  <ChevronDown size="sm" />
                </span>
              </button>

              {#if serverDropdownOpen}
                <div class="custom-dropdown-menu">
                  {#each gameConfig?.servers ?? [] as server}
                    <button
                      type="button"
                      class={`custom-dropdown-item ${serverId === server ? "active" : ""}`}
                      onclick={() => selectServer(server)}
                    >
                      {server.toUpperCase()}
                    </button>
                  {/each}
                </div>
              {/if}
            {:else}
              <input
                id="server_id"
                type="text"
                bind:value={serverId}
                placeholder="Masukkan Server ID"
                class="field-input"
              />
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .step-card {
    position: relative;
    border-radius: 1rem;
    overflow: visible;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #111111;
  }
  .step-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(
      to bottom,
      var(--color-primary),
      rgba(245, 197, 24, 0.3),
      transparent
    );
  }
  .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .step-badge {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 900;
    color: #000;
  }
  .step-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.025em;
    flex: 1;
  }
  .step-subtitle {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 0.15rem;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .field-label {
    font-size: 0.625rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .input-wrap {
    position: relative;
    z-index: 30;
  }
  .input-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.875rem;
    pointer-events: none;
  }
  .field-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 0.625rem 1rem 0.625rem 2.25rem;
    font-size: 0.875rem;
    color: #fff;
    outline: none;
    transition: all 0.2s;
  }
  .field-input:focus {
    border-color: rgba(245, 197, 24, 0.6);
    background: rgba(255, 255, 255, 0.07);
    box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.08);
  }
  .field-input::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
  .field-select {
    appearance: none;
  }
  .field-select-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    cursor: pointer;
  }
  .placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
  .select-chevron {
    color: rgba(255, 255, 255, 0.45);
    transition: transform 0.2s ease;
    margin-left: 0.75rem;
  }
  .select-chevron.open {
    transform: rotate(180deg);
  }
  .custom-dropdown-menu {
    position: absolute;
    top: calc(100% + 0.4rem);
    left: 0;
    right: 0;
    z-index: 999;
    background: #1a1a1a;
    border: 1px solid rgba(245, 197, 24, 0.2);
    border-radius: 0.9rem;
    padding: 0.35rem;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  }
  .custom-dropdown-item {
    width: 100%;
    text-align: left;
    padding: 0.7rem 0.85rem;
    border-radius: 0.7rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    transition: all 0.18s ease;
  }
  .custom-dropdown-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
  }
  .custom-dropdown-item.active {
    background: rgba(245, 197, 24, 0.14);
    color: var(--color-primary);
    font-weight: 700;
  }
</style>
