<script lang="ts">
  type ImageItem = {
    url: string;
    filename: string;
    updatedAt?: string;
    createdAt?: string;
    size?: number;
  };

  let {
    open = false,
    onClose = () => {},
    onSelect = (_url: string) => {},
    multiple = false,
  } = $props();

  let images = $state<ImageItem[]>([]);
  let loading = $state(false);
  let uploading = $state(false);
  let error = $state<string | null>(null);
  let selectedUrl = $state("");
  let selectedUrls = $state<string[]>([]);
  let fileInput = $state<HTMLInputElement | null>(null);

  async function loadImages() {
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/images");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.data?.message ?? json?.message ?? "Gagal memuat gambar");
      }
      images = json?.data?.items ?? [];
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat gambar";
    } finally {
      loading = false;
    }
  }

  async function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    error = null;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/aws/s3/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.data?.message ?? json?.message ?? "Upload gambar gagal");
      }

      const url = json?.data?.url ?? json?.url ?? "";
      if (!url) {
        throw new Error("URL gambar tidak ditemukan setelah upload");
      }

      if (multiple) {
        selectedUrls = [...selectedUrls, url];
        if (fileInput) fileInput.value = "";
      } else {
        onSelect(url);
        onClose();
        selectedUrl = "";
        if (fileInput) fileInput.value = "";
      }
    } catch (e: any) {
      error = e?.message ?? "Upload gambar gagal";
    } finally {
      uploading = false;
    }
  }

  function chooseExisting(url: string) {
    if (multiple) {
      if (selectedUrls.includes(url)) {
        selectedUrls = selectedUrls.filter((u) => u !== url);
      } else {
        selectedUrls = [...selectedUrls, url];
      }
    } else {
      selectedUrl = url;
      onSelect(url);
      onClose();
    }
  }

  function handleClose() {
    error = null;
    selectedUrl = "";
    selectedUrls = [];
    if (fileInput) fileInput.value = "";
    onClose();
  }

  function insertSelected() {
    if (selectedUrls.length === 0) return;
    const joined = selectedUrls.join("\n");
    onSelect(joined);
    onClose();
  }

  $effect(() => {
    if (open) {
      loadImages();
    }
  });
</script>

{#if open}
  <div class="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl">
      <div class="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
        <div>
          <h3 class="text-base font-bold text-white">Image Manager</h3>
          <p class="text-xs text-white/50">Upload gambar baru atau pilih dari gambar yang sudah ada.</p>
        </div>
        <button type="button" onclick={handleClose} class="text-sm text-white/60 hover:text-white">Tutup</button>
      </div>

      <div class="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-72px)]">
        <div class="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div class="flex items-center gap-3">
            <input
              bind:this={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onchange={handleFileChange}
              class="block text-xs text-white/70 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#f5c518] file:text-black file:font-semibold"
              disabled={uploading}
            />
            {#if uploading}
              <span class="text-xs text-[#f5c518]">Uploading...</span>
            {/if}
          </div>
          <div class="flex items-center gap-2">
            {#if multiple && selectedUrls.length > 0}
              <button
                type="button"
                onclick={insertSelected}
                class="px-3 py-2 rounded-lg text-xs font-semibold bg-[#f5c518] text-black hover:bg-[#ffd740]"
              >
                Insert Selected ({selectedUrls.length})
              </button>
            {/if}
            <button type="button" onclick={loadImages} class="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10" disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {#if error}
          <div class="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>
        {/if}

        {#if loading}
          <div class="text-sm text-white/50 py-8 text-center">Memuat gambar...</div>
        {:else if images.length === 0}
          <div class="text-sm text-white/50 py-8 text-center">Belum ada gambar tersimpan.</div>
        {:else}
          <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {#each images as image}
              <button
                type="button"
                class={`group text-left rounded-2xl overflow-hidden border transition ${multiple && selectedUrls.includes(image.url) ? "border-[#f5c518] bg-[#f5c518]/10" : selectedUrl === image.url ? "border-[#f5c518] bg-[#f5c518]/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                onclick={() => chooseExisting(image.url)}
              >
                <div class="relative">
                  <div class="aspect-square bg-black/30 overflow-hidden">
                    <img src={image.url} alt={image.filename} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  </div>
                  {#if multiple}
                    <div class="absolute top-2 right-2 w-5 h-5 rounded-full border border-white/30 bg-black/70 flex items-center justify-center">
                      {#if selectedUrls.includes(image.url)}
                        <div class="w-3 h-3 rounded-full bg-[#f5c518]"></div>
                      {/if}
                    </div>
                  {/if}
                </div>
                <div class="p-3 space-y-1">
                  <p class="text-[11px] text-white/80 line-clamp-2 break-all">{image.filename}</p>
                  <p class="text-[10px] text-white/45 line-clamp-2 break-all">{image.url}</p>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
