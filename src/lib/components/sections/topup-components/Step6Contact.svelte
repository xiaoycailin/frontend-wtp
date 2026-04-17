<script lang="ts">
  import { auth } from "$lib/auth";
  import { onMount } from "svelte";

  let { phone = $bindable(""), email = $bindable("") } = $props();

  type Country = {
    name: string;
    code: string;
    dial: string;
    flag: string;
  };

  const countries: Country[] = [
    { name: "Indonesia", code: "ID", dial: "62", flag: "🇮🇩" },
    { name: "Malaysia", code: "MY", dial: "60", flag: "🇲🇾" },
    { name: "Singapore", code: "SG", dial: "65", flag: "🇸🇬" },
    { name: "Philippines", code: "PH", dial: "63", flag: "🇵🇭" },
    { name: "Thailand", code: "TH", dial: "66", flag: "🇹🇭" },
    { name: "Vietnam", code: "VN", dial: "84", flag: "🇻🇳" },
    { name: "Brunei", code: "BN", dial: "673", flag: "🇧🇳" },
    { name: "Myanmar", code: "MM", dial: "95", flag: "🇲🇲" },
    { name: "Cambodia", code: "KH", dial: "855", flag: "🇰🇭" },
    { name: "Laos", code: "LA", dial: "856", flag: "🇱🇦" },
    { name: "Timor-Leste", code: "TL", dial: "670", flag: "🇹🇱" },
    { name: "Australia", code: "AU", dial: "61", flag: "🇦🇺" },
    { name: "United States", code: "US", dial: "1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "GB", dial: "44", flag: "🇬🇧" },
    { name: "Japan", code: "JP", dial: "81", flag: "🇯🇵" },
    { name: "South Korea", code: "KR", dial: "82", flag: "🇰🇷" },
    { name: "China", code: "CN", dial: "86", flag: "🇨🇳" },
    { name: "India", code: "IN", dial: "91", flag: "🇮🇳" },
    { name: "Saudi Arabia", code: "SA", dial: "966", flag: "🇸🇦" },
    { name: "United Arab Emirates", code: "AE", dial: "971", flag: "🇦🇪" },
    { name: "Qatar", code: "QA", dial: "974", flag: "🇶🇦" },
    { name: "Kuwait", code: "KW", dial: "965", flag: "🇰🇼" },
    { name: "Germany", code: "DE", dial: "49", flag: "🇩🇪" },
    { name: "France", code: "FR", dial: "33", flag: "🇫🇷" },
    { name: "Netherlands", code: "NL", dial: "31", flag: "🇳🇱" },
    { name: "Canada", code: "CA", dial: "1", flag: "🇨🇦" },
  ];

  let selectedCountry = $state<Country>(countries[0]);
  let showDropdown = $state(false);
  let search = $state("");
  let phoneFocused = $state(false);
  let emailFocused = $state(false);

  const filtered = $derived(
    search.trim() === ""
      ? countries
      : countries.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.dial.includes(search.replace(/\D/g, "")),
        ),
  );

  const phoneValid = $derived(phone.trim().length > 6);
  const emailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

  function selectCountry(c: Country) {
    selectedCountry = c;
    showDropdown = false;
    search = "";
  }

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-country-dropdown]")) {
      showDropdown = false;
      search = "";
    }
  }

  onMount(() => {
    auth.init();
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  });
</script>

<div class="step-card">
  <div class="step-accent" aria-hidden="true"></div>

  <div class="card-inner">
    <!-- ── Header ── -->
    <div class="step-header">
      <div class="step-badge"><span>6</span></div>
      <div>
        <h3 class="step-title">Detail Kontak</h3>
        <p class="step-subtitle">Untuk konfirmasi transaksi</p>
      </div>
    </div>

    <!-- ─────────────────────────────────────
         WHATSAPP FIELD
    ───────────────────────────────────── -->
    <div class="field-group">
      <div class="field-label-row">
        <label class="field-label" for="wa-input">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="11"
            height="11"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>No. WhatsApp</span>
        </label>
        {#if phoneValid}
          <span class="field-valid-badge">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="9"
              height="9"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Valid
          </span>
        {/if}
      </div>

      <div class="phone-row">
        <!-- Country picker -->
        <div class="country-trigger-wrap" data-country-dropdown>
          <button
            type="button"
            class="country-trigger"
            class:country-trigger-open={showDropdown}
            onclick={() => {
              showDropdown = !showDropdown;
              search = "";
            }}
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
          >
            <img
              src="https://flagcdn.com/24x18/{selectedCountry.code.toLowerCase()}.png"
              alt={selectedCountry.name}
              class="flag-img"
              loading="lazy"
            />
            <span class="dial-code">+{selectedCountry.dial}</span>
            <svg
              class="trigger-chevron"
              class:trigger-chevron-open={showDropdown}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="12"
              height="12"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Dropdown -->
          {#if showDropdown}
            <div
              class="country-dropdown"
              role="listbox"
              aria-label="Pilih negara"
            >
              <!-- Search -->
              <div class="dropdown-search-wrap">
                <svg
                  class="dropdown-search-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  bind:value={search}
                  placeholder="Cari negara atau kode..."
                  autofocus
                  class="dropdown-search"
                  aria-label="Cari negara"
                />
              </div>

              <!-- List -->
              <div class="country-list">
                {#if filtered.length === 0}
                  <div class="country-empty">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Negara tidak ditemukan</span>
                  </div>
                {:else}
                  {#each filtered as c (c.code)}
                    {@const isActive = selectedCountry.code === c.code}
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      class="country-item"
                      class:country-item-active={isActive}
                      onclick={() => selectCountry(c)}
                    >
                      <img
                        src="https://flagcdn.com/24x18/{c.code.toLowerCase()}.png"
                        alt={c.name}
                        class="country-item-flag"
                        loading="lazy"
                      />
                      <span class="country-item-name">{c.name}</span>
                      <span class="country-item-dial">+{c.dial}</span>
                      {#if isActive}
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          width="11"
                          height="11"
                          class="country-item-check"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      {/if}
                    </button>
                  {/each}
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Phone number input -->
        <div
          class="input-wrap"
          class:input-focused={phoneFocused}
          class:input-valid={phoneValid}
        >
          <input
            id="wa-input"
            type="tel"
            bind:value={phone}
            onfocus={() => (phoneFocused = true)}
            onblur={() => (phoneFocused = false)}
            placeholder={selectedCountry.code === "ID"
              ? "8960xxxxxx"
              : "Nomor telepon"}
            class="field-input"
            autocomplete="tel"
          />
          {#if phoneValid}
            <div class="input-valid-icon">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="14"
                height="14"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          {/if}
        </div>
      </div>

      <!-- ID hint -->
      {#if selectedCountry.code === "ID"}
        <p class="field-hint">
          Tulis tanpa angka
          <strong class="hint-em">0</strong>
          di depan. Contoh:
          <strong class="hint-em">8960xxxxxx</strong>
        </p>
      {:else}
        <p class="field-hint">Tulis tanpa kode negara di depan.</p>
      {/if}
    </div>

    <!-- ─────────────────────────────────────
         EMAIL FIELD
    ───────────────────────────────────── -->
    <div class="field-group">
      <div class="field-label-row">
        <label class="field-label" for="email-input">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="11"
            height="11"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Email</span>
        </label>
        {#if auth.isLoggedIn}
          <span class="locked-badge">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="9"
              height="9"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Dari akun
          </span>
        {:else if emailValid}
          <span class="field-valid-badge">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="9"
              height="9"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Valid
          </span>
        {/if}
      </div>

      <div
        class="input-wrap"
        class:input-focused={emailFocused}
        class:input-valid={emailValid && !auth.isLoggedIn}
        class:input-locked={auth.isLoggedIn}
      >
        <svg
          class="input-prefix-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="14"
          height="14"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
          />
        </svg>
        <input
          id="email-input"
          type="email"
          bind:value={email}
          onfocus={() => (emailFocused = true)}
          onblur={() => (emailFocused = false)}
          placeholder="nama@email.com"
          disabled={auth.isLoggedIn}
          class="field-input field-input-email"
          class:field-input-disabled={auth.isLoggedIn}
          autocomplete="email"
        />
        {#if auth.isLoggedIn}
          <div class="input-lock-icon">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="13"
              height="13"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        {:else if emailValid}
          <div class="input-valid-icon">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="14"
              height="14"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        {/if}
      </div>
    </div>

    <!-- ── Info notice ── -->
    <div class="info-box">
      <div class="info-icon-wrap">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="14"
          height="14"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="info-text">
        Nomor WhatsApp dipakai untuk konfirmasi jika transaksi bermasalah. Email
        digunakan untuk pengiriman invoice pembayaran.
      </p>
    </div>
  </div>
</div>

<style>
  /* ── Shell ── */
  .step-card {
    position: relative;
    border-radius: 1.125rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #0f0f0f;
    overflow: visible; /* biar dropdown tidak terpotong */
  }
  .step-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    border-radius: 1px;
    background: linear-gradient(
      to bottom,
      var(--color-primary),
      rgba(245, 197, 24, 0.3) 55%,
      transparent
    );
    z-index: 1;
  }
  .card-inner {
    padding: 1.25rem 1.25rem 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
  }

  /* ── Header ── */
  .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .step-badge {
    width: 1.875rem;
    height: 1.875rem;
    border-radius: 0.625rem;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.8125rem;
    font-weight: 900;
    color: #000;
    box-shadow: 0 0 14px rgba(245, 197, 24, 0.3);
  }
  .step-title {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
  }
  .step-subtitle {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 0.1rem;
  }

  /* ── Field group ── */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .field-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.625rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  /* Valid / locked badges */
  .field-valid-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.5625rem;
    font-weight: 800;
    color: #34d399;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.2);
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
    letter-spacing: 0.04em;
  }
  .locked-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.5625rem;
    font-weight: 800;
    color: rgba(245, 197, 24, 0.7);
    background: rgba(245, 197, 24, 0.08);
    border: 1px solid rgba(245, 197, 24, 0.18);
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
  }

  /* ── Phone row ── */
  .phone-row {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
  }

  /* ── Country trigger ── */
  .country-trigger-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .country-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.875rem;
    height: 100%;
    min-height: 2.875rem;
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .country-trigger:hover {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.07);
  }
  .country-trigger-open {
    border-color: rgba(245, 197, 24, 0.45);
    background: rgba(245, 197, 24, 0.05);
    box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.07);
  }
  .flag-img {
    width: 1.375rem;
    height: auto;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .dial-code {
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    font-variant-numeric: tabular-nums;
  }
  .trigger-chevron {
    color: rgba(255, 255, 255, 0.3);
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .trigger-chevron-open {
    transform: rotate(180deg);
  }

  /* ── Dropdown panel ── */
  .country-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    z-index: 200;
    width: 17rem;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #181818;
    box-shadow:
      0 20px 48px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }

  /* Dropdown search */
  .dropdown-search-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .dropdown-search-icon {
    color: rgba(255, 255, 255, 0.25);
    flex-shrink: 0;
  }
  .dropdown-search {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.8125rem;
    color: #fff;
    caret-color: var(--color-primary);
  }
  .dropdown-search::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  /* Country list */
  .country-list {
    max-height: 13rem;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }
  .country-list::-webkit-scrollbar {
    width: 3px;
  }
  .country-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .country-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
  }
  .country-list::-webkit-scrollbar-thumb:hover {
    background: rgba(245, 197, 24, 0.35);
  }

  .country-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    color: rgba(255, 255, 255, 0.2);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .country-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.875rem;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.14s ease;
  }
  .country-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  .country-item-active {
    background: rgba(245, 197, 24, 0.07);
  }
  .country-item-active:hover {
    background: rgba(245, 197, 24, 0.1);
  }

  .country-item-flag {
    width: 1.25rem;
    height: auto;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .country-item-name {
    flex: 1;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }
  .country-item-active .country-item-name {
    color: #fff;
    font-weight: 700;
  }
  .country-item-dial {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.3);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    font-family: "JetBrains Mono", monospace;
  }
  .country-item-check {
    color: var(--color-primary);
    flex-shrink: 0;
  }

  /* ── Shared input wrap ── */
  .input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 0.875rem;
    padding: 0 0.875rem;
    transition: all 0.2s ease;
    position: relative;
    min-height: 2.875rem;
  }
  .input-wrap.input-focused {
    border-color: rgba(245, 197, 24, 0.45);
    background: rgba(245, 197, 24, 0.04);
    box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.07);
  }
  .input-wrap.input-valid {
    border-color: rgba(52, 211, 153, 0.3);
    background: rgba(52, 211, 153, 0.03);
  }
  .input-wrap.input-locked {
    border-color: rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    opacity: 0.7;
  }

  .input-prefix-icon {
    color: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
    margin-right: 0.375rem;
    transition: color 0.2s;
  }
  .input-focused .input-prefix-icon {
    color: var(--color-primary);
  }

  .field-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.6875rem 0;
    font-size: 0.9375rem;
    font-weight: 700;
    color: #fff;
    caret-color: var(--color-primary);
    font-variant-numeric: tabular-nums;
    min-width: 0;
  }
  .field-input::placeholder {
    color: rgba(255, 255, 255, 0.2);
    font-weight: 400;
  }
  .field-input-email {
    font-weight: 500;
    font-size: 0.875rem;
  }
  .field-input-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Trailing icons */
  .input-valid-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
    flex-shrink: 0;
    animation: popin 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .input-lock-icon {
    color: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  @keyframes popin {
    from {
      transform: scale(0.5);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* ── Field hint ── */
  .field-hint {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.25);
    line-height: 1.5;
  }
  .hint-em {
    color: rgba(245, 197, 24, 0.7);
    font-weight: 800;
  }

  /* ── Info box ── */
  .info-box {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 0.875rem;
    border-radius: 0.875rem;
    background: rgba(99, 102, 241, 0.07);
    border: 1px solid rgba(99, 102, 241, 0.18);
  }
  .info-icon-wrap {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #818cf8;
    margin-top: 0.05rem;
  }
  .info-text {
    font-size: 0.6875rem;
    color: rgba(165, 167, 255, 0.6);
    line-height: 1.6;
    max-width: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
