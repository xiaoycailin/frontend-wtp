<script lang="ts">
  let { userId = $bindable(""), serverId = $bindable("") } = $props();
</script>

<div class="step-card">
  <div class="step-accent"></div>
  <div class="px-5 py-4">
    <div class="step-header">
      <div class="step-badge">1</div>
      <h3 class="step-title">Masukkan Data Akun</h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- User ID -->
      <div class="field">
        <label class="field-label">User ID</label>
        <div class="input-wrap">
          <span class="input-icon">👤</span>
          <input
            type="text"
            bind:value={userId}
            placeholder="Masukkan User ID"
            class="field-input"
          />
        </div>
      </div>
      <!-- Server -->
      <div class="field">
        <label class="field-label">Server</label>
        <div class="input-wrap">
          <span class="input-icon">🌐</span>
          <input
            type="text"
            bind:value={serverId}
            placeholder="Masukkan Server"
            class="field-input"
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .step-card {
    position: relative;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #111111;
  }
  .step-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #f5c518, rgba(245, 197, 24, 0.3), transparent);
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
    background: #f5c518;
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
</style>
