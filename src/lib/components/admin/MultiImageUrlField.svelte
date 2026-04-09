<script lang="ts">
  import ImageManagerModal from "./ImageManagerModal.svelte";

  let {
    label = "Image URLs (one per line)",
    value = $bindable(""),
    placeholder = "https://...\nhttps://...",
    help = "",
  } = $props();

  let open = $state(false);

  function handleSelect(urls: string) {
    const existing = value.trim().split("\n").filter(Boolean);
    const newUrls = urls.trim().split("\n").filter(Boolean);
    const combined = [...existing, ...newUrls];
    const unique = Array.from(new Set(combined));
    value = unique.join("\n");
  }
</script>

<div class="space-y-1.5">
  <label class="text-xs text-white/70">{label}</label>
  <div class="flex gap-2">
    <textarea
      class="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
             focus:outline-none focus:border-[var(--color-primary)]/70 min-h-[80px] resize-y"
      bind:value
      {placeholder}
    />
    <button
      type="button"
      class="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
      onclick={() => (open = true)}
    >
      Pick Images
    </button>
  </div>

  {#if help}
    <p class="text-[11px] text-white/45">{help}</p>
  {/if}

  {#if value}
    <div class="rounded-xl border border-white/10 bg-black/20 p-2 space-y-2">
      {#each value.trim().split("\n").filter(Boolean) as url, i}
        <div class="flex items-start gap-2">
          <img src={url} alt={`Image ${i + 1}`} class="w-16 h-16 object-cover rounded-lg" />
          <div class="flex-1 min-w-0">
            <p class="text-[10px] text-white/80 break-all line-clamp-2">{url}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<ImageManagerModal bind:open onClose={() => (open = false)} onSelect={handleSelect} multiple={true} />

