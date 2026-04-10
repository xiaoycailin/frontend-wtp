<script lang="ts">
  type Badge = {
    id: number;
    label: string;
    color: string;
  };

  let badges = $state<Badge[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let showModal = $state(false);
  let editingBadge = $state<Badge | null>(null);
  let form = $state({ label: "", color: "#f5c518" });
  const token = $state<string | null>(null);

  async function fetchBadges() {
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/badges");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.data?.message ?? "Gagal memuat badge");
      badges = json.data ?? [];
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat badge";
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchBadges();
  });

  function openCreate() {
    editingBadge = null;
    form.label = "";
    form.color = "#f5c518";
    showModal = true;
  }

  function openEdit(badge: Badge) {
    editingBadge = badge;
    form.label = badge.label;
    form.color = badge.color || "#f5c518";
    showModal = true;
  }

  async function submitBadge() {
    if (!form.label.trim()) {
      alert("Label badge wajib diisi");
      return;
    }

    const isEdit = !!editingBadge;
    const url = isEdit ? `/api/v1/badges/${editingBadge!.id}` : "/api/v1/badges";
    const method = isEdit ? "PUT" : "POST";

    try {
      loading = true;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ label: form.label.trim(), color: form.color }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal menyimpan badge");
      }

      showModal = false;
      await fetchBadges();
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan badge");
    } finally {
      loading = false;
    }
  }

  async function removeBadge(badge: Badge) {
    if (!window.confirm(`Yakin hapus badge \"${badge.label}\"?`)) return;

    try {
      loading = true;
      const res = await fetch(`/api/v1/badges/${badge.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal menghapus badge");
      }
      await fetchBadges();
    } catch (e: any) {
      alert(e?.message ?? "Gagal menghapus badge");
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Badge Library - Admin</title>
</svelte:head>

<section class="space-y-4">
  <div class="flex items-center justify-between gap-3">
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] font-semibold">Badge Library</p>
      <h1 class="text-2xl font-black text-white">Kelola badge sub kategori</h1>
      <p class="text-sm text-white/50 mt-1">Bikin badge dulu di sini, nanti bisa dipilih saat create/edit sub kategori.</p>
    </div>
    <button
      class="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
      on:click={openCreate}
    >
      + Tambah Badge
    </button>
  </div>

  {#if error}
    <div class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
  {/if}

  <div class="rounded-2xl border border-white/10 bg-[#0b0b0b] overflow-hidden">
    <table class="min-w-full text-sm">
      <thead class="bg-white/5 text-white/60">
        <tr>
          <th class="px-4 py-3 text-left">Preview</th>
          <th class="px-4 py-3 text-left">Label</th>
          <th class="px-4 py-3 text-left">Warna</th>
          <th class="px-4 py-3 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#if loading && !badges.length}
          <tr><td colspan="4" class="px-4 py-6 text-center text-white/40">Memuat badge...</td></tr>
        {:else if !badges.length}
          <tr><td colspan="4" class="px-4 py-6 text-center text-white/40">Belum ada badge.</td></tr>
        {:else}
          {#each badges as badge}
            <tr class="border-t border-white/5">
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" style={`background:${badge.color}22; color:${badge.color}; border:1px solid ${badge.color}55`}>
                  {badge.label}
                </span>
              </td>
              <td class="px-4 py-3 text-white">{badge.label}</td>
              <td class="px-4 py-3 text-white/70">{badge.color}</td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex gap-2">
                  <button class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10" on:click={() => openEdit(badge)}>Edit</button>
                  <button class="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20" on:click={() => removeBadge(badge)}>Hapus</button>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-white">{editingBadge ? 'Edit Badge' : 'Tambah Badge'}</h2>
        <button class="text-xs text-white/50 hover:text-white" on:click={() => (showModal = false)}>Tutup</button>
      </div>

      <label class="flex flex-col gap-1 text-xs">
        <span class="text-white/70">Label</span>
        <input class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]" bind:value={form.label} placeholder="Contoh: Populer" />
      </label>

      <label class="flex flex-col gap-1 text-xs">
        <span class="text-white/70">Warna</span>
        <div class="flex gap-2">
          <input type="color" bind:value={form.color} class="h-10 w-14 rounded-lg border border-white/10 bg-black/40" />
          <input class="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]" bind:value={form.color} placeholder="#f5c518" />
        </div>
      </label>

      <div class="pt-2 flex justify-end gap-2 text-xs">
        <button class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10" on:click={() => (showModal = false)}>Batal</button>
        <button class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]" on:click={submitBadge} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
      </div>
    </div>
  </div>
{/if}
