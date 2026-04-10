<script lang="ts">
  type LeaderboardItem = {
    key: string;
    buyerName: string;
    productTitle: string;
    totalAmount: number;
    totalOrders: number;
    totalQuantity: number;
    lastCreatedAt: string;
  };

  let loading = $state(true);
  let error = $state<string | null>(null);
  let updatedAt = $state<string | null>(null);
  let boards = $state<{ today: LeaderboardItem[]; week: LeaderboardItem[]; month: LeaderboardItem[] }>({
    today: [],
    week: [],
    month: [],
  });

  function maskCurrency(amount: number) {
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length <= 2) return formatted;

    const visible = digits.slice(0, Math.min(2, digits.length));
    const masked = "x".repeat(Math.max(3, digits.length - visible.length));
    return `Rp${visible}.${masked}`;
  }

  function maskName(name: string) {
    if (!name) return "Pelanggan";
    if (name.length <= 2) return `${name[0]}*`;
    return `${name.slice(0, 2)}${"*".repeat(Math.max(3, name.length - 2))}`;
  }

  function formatUpdatedAt(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadLeaderboard() {
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/leaderboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.data?.message ?? "Gagal memuat leaderboard");
      boards = {
        today: json.data?.today ?? [],
        week: json.data?.week ?? [],
        month: json.data?.month ?? [],
      };
      updatedAt = json.data?.updatedAt ?? null;
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat leaderboard";
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadLeaderboard();
  });

  const sections = [
    { key: "today", title: "Top 10 - Hari Ini", items: () => boards.today },
    { key: "week", title: "Top 10 - Minggu Ini", items: () => boards.week },
    { key: "month", title: "Top 10 - Bulan Ini", items: () => boards.month },
  ];
</script>

<svelte:head>
  <title>Leaderboard - WTPANJAY</title>
</svelte:head>

<section class="space-y-6">
  <div class="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
    <p class="text-xs uppercase tracking-[0.25em] text-[var(--color-primary)] font-semibold mb-3">Leaderboard</p>
    <h1 class="text-2xl md:text-4xl font-black text-white leading-tight">Pelanggan dengan pembelian terbanyak</h1>
    <p class="mt-3 max-w-3xl text-sm md:text-base text-white/60">
      Berikut ini adalah daftar 10 pembelian terbanyak yang dilakukan oleh pelanggan kami. Data ini diambil dari sistem kami dan selalu diperbaharui.
    </p>
    <div class="mt-4 flex flex-wrap gap-3 text-xs text-white/40">
      <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Update terakhir: {formatUpdatedAt(updatedAt)}</span>
      <button class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10" on:click={loadLeaderboard}>Refresh</button>
    </div>
  </div>

  {#if error}
    <div class="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
  {/if}

  <div class="grid gap-5 lg:grid-cols-3">
    {#each sections as section}
      <article class="rounded-3xl border border-white/10 bg-[#0b0b0b] overflow-hidden">
        <div class="border-b border-white/5 px-5 py-4">
          <h2 class="text-lg font-bold text-white">{section.title}</h2>
        </div>

        {#if loading}
          <div class="px-5 py-8 text-sm text-white/40">Memuat data...</div>
        {:else if section.items().length === 0}
          <div class="px-5 py-8 text-sm text-white/40">Belum ada data.</div>
        {:else}
          <div class="divide-y divide-white/5">
            {#each section.items() as item, index}
              <div class="flex items-start gap-3 px-5 py-4">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-xs font-black text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                  #{index + 1}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-white">{maskName(item.buyerName)}</p>
                      <p class="mt-0.5 line-clamp-2 text-xs text-white/45">{item.productTitle}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-black text-[var(--color-primary)]">{maskCurrency(item.totalAmount)}</p>
                      <p class="text-[11px] text-white/35">{item.totalOrders} trx</p>
                    </div>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2 text-[11px] text-white/40">
                    <span class="rounded-full bg-white/5 px-2 py-1 border border-white/10">Qty: {item.totalQuantity}</span>
                    <span class="rounded-full bg-white/5 px-2 py-1 border border-white/10">Update: {new Date(item.lastCreatedAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </article>
    {/each}
  </div>
</section>
