<script lang="ts">
  import Icon from "@iconify/svelte";
  import { ChevronDown, User } from "@boxicons/svelte";

  type SelectOption = {
    label: string;
    value: string;
  };

  type CustomInput = {
    id: number;
    name: string;
    label: string;
    type: string;
    model: "input" | "select";
    placeholder?: string | null;
    options?: SelectOption[] | null;
    icon?: string | null;
    maskingForView?: boolean;
    subCategoryId?: string;
    createdAt?: string;
  };

  let {
    inputs = [],
    userCustomInput = $bindable({}),
  }: {
    inputs?: CustomInput[];
    userCustomInput: Record<string, string>;
  } = $props();

  let openDropdowns = $state<Record<string, boolean>>({});

  function toggleDropdown(name: string) {
    openDropdowns = {
      ...Object.fromEntries(
        Object.keys(openDropdowns).map((key) => [key, false]),
      ),
      [name]: !openDropdowns[name],
    };
  }

  function closeDropdown(name: string) {
    openDropdowns = {
      ...openDropdowns,
      [name]: false,
    };
  }

  function selectOption(name: string, value: string) {
    userCustomInput[name] = value;
    closeDropdown(name);
  }

  function getSelectedLabel(input: CustomInput) {
    const value = userCustomInput[input.name];
    if (!value || !input.options) return "";

    const selected = input.options.find((option) => option.value === value);
    return selected?.label ?? value;
  }

  function getInputIcon(input: CustomInput) {
    return input.icon || "mdi:text-box-outline";
  }
</script>

<div class="step-card">
  <div class="step-accent"></div>

  <div class="px-5 py-4">
    <div class="step-header">
      <div class="step-badge">1</div>
      <div>
        <h3 class="step-title">Masukkan Data</h3>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {#each inputs as input (input.id)}
        <div class="field">
          <label class="field-label" for={input.name}>
            {input.label}
          </label>

          <div class="input-wrap">
            <span class="input-icon">
              <span class="input-icon">
                <Icon icon={getInputIcon(input)} width="18" height="18" />
              </span>
            </span>

            {#if input.model === "select"}
              <button
                id={input.name}
                type="button"
                class="field-input field-select-btn"
                onclick={() => toggleDropdown(input.name)}
              >
                <span class:placeholder={!userCustomInput[input.name]}>
                  {userCustomInput[input.name]
                    ? getSelectedLabel(input)
                    : (input.placeholder ?? `Pilih ${input.label}`)}
                </span>

                <span
                  class={`select-chevron ${openDropdowns[input.name] ? "open" : ""}`}
                >
                  <ChevronDown size="sm" />
                </span>
              </button>

              {#if openDropdowns[input.name]}
                <button
                  type="button"
                  class="dropdown-backdrop"
                  aria-label="Close dropdown"
                  onclick={() => closeDropdown(input.name)}
                ></button>

                <div class="custom-dropdown-menu">
                  {#each input.options ?? [] as option}
                    <button
                      type="button"
                      class={`custom-dropdown-item ${userCustomInput[input.name] === option.value ? "active" : ""}`}
                      onclick={() => selectOption(input.name, option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              {/if}
            {:else}
              <input
                id={input.name}
                type={input.type === "text" ? "text" : input.type}
                bind:value={userCustomInput[input.name]}
                placeholder={input.placeholder ?? `Masukkan ${input.label}`}
                class="field-input"
              />
            {/if}
          </div>
        </div>
      {/each}
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

  .field {
    position: relative;
    z-index: 1;
  }

  .field:has(.custom-dropdown-menu) {
    z-index: 2000;
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
    left: 0.4rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 2;
    color: rgba(255, 255, 255, 0.5);
  }

  .input-icon-svg {
    display: block;
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
    flex-shrink: 0;
  }

  .select-chevron.open {
    transform: rotate(180deg);
  }

  .dropdown-backdrop {
    position: fixed;
    inset: 0;
    z-index: 998;
    background: transparent;
    border: 0;
    padding: 0;
    margin: 0;
  }

  .custom-dropdown-menu {
    position: absolute;
    top: calc(100% + 0.4rem);
    left: 0;
    right: 0;
    z-index: 999;
    background: #161616;
    opacity: 1;
    border: 1px solid rgba(245, 197, 24, 0.28);
    border-radius: 0.9rem;
    padding: 0.35rem;
    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.02) inset;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    pointer-events: auto;
  }

  .custom-dropdown-item {
    position: relative;
    z-index: 1000;
    width: 100%;
    text-align: left;
    padding: 0.7rem 0.85rem;
    border-radius: 0.7rem;
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.875rem;
    transition: all 0.18s ease;
    background: transparent;
    border: none;
    cursor: pointer;
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
