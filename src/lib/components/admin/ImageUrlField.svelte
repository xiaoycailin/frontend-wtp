<script lang="ts">
  import ImageManagerModal from "./ImageManagerModal.svelte";

  let {
    label = "Image URL",
    value = $bindable(""),
    placeholder = "https://...",
    help = "",
  } = $props();

  let open = $state(false);

  function handleSelect(url: string) {
    value = url;
  }
</script>

<div class="space-y-1.5">
  <label class="text-xs text-white/70">{label}</label>
  <div class="flex gap-2">
    <input
      class="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
             focus:outline-none focus:border-[#f5c518]/70"
      bind:value
      {placeholder}
    />
    <button
      type="button"
      class="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-[#f5c518] text-black hover:bg-[#ffd740]"
      onclick={() => (open = true)}
    >
      Pick Image
    </button>
  </div>

  {#if help}
    <p class="text-[11px] text-white/45">{help}</p>
  {/if}

  {#if value}
    <div class="rounded-xl border border-white/10 bg-black/20 p-2 w-fit">
      <img src={value} alt="Preview image" class="w-24 h-24 object-cover rounded-lg" />
    </div>
  {/if}
</div>

<ImageManagerModal bind:open onClose={() => (open = false)} onSelect={handleSelect} />
