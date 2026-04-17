<script lang="ts">
  const { data } = $props();
  let items = $state<any[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let status = $state("");
  let from = $state("");
  let to = $state("");

  function fmtRp(v: string | number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(v || 0));
  }

  async function fetchItems() {
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());
      const res = await fetch(
        `/api/v1/admin/balance-topups?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${data.token}` },
        },
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.data?.message ?? "Gagal memuat history topup");
      items = json.data;
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat history topup";
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchItems();
  });
</script>

<section class="space-y-6">
  <header>
    <p
      class="text-xs uppercase tracking-[0.18em] text-[var(--color-primary)] font-semibold mb-1"
    >
      Balance Topups
    </p>
    <h1 class="text-3xl font-black text-white">Riwayat Topup User</h1>
  </header>

  <div
    class="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4 grid md:grid-cols-4 gap-3 text-sm"
  >
    <select
      bind:value={status}
      class="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
    >
      <option value="">Semua status</option>
      <option value="PENDING">PENDING</option>
      <option value="SUCCESS">SUCCESS</option>
      <option value="FAILED">FAILED</option>
    </select>
    <input
      type="date"
      bind:value={from}
      class="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
    />
    <input
      type="date"
      bind:value={to}
      class="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
    />
    <button
      onclick={fetchItems}
      class="rounded-xl bg-[var(--color-primary)] text-black font-black px-4 py-2"
      >Terapkan Filter</button
    >
  </div>

  {#if error}<p class="text-red-400 text-sm">{error}</p>{/if}

  <div class="rounded-2xl border border-white/10 bg-[#0c0c0c] overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm text-left">
        <thead class="bg-white/[0.04] text-white/60">
          <tr>
            <th class="px-4 py-3">Kode</th>
            <th class="px-4 py-3">User</th>
            <th class="px-4 py-3">Metode</th>
            <th class="px-4 py-3">Nominal</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item}
            <tr class="border-t border-white/5">
              <td class="px-4 py-3 text-white font-semibold"
                >{item.topupCode}</td
              >
              <td class="px-4 py-3 text-white/75">{item.user?.email}</td>
              <td class="px-4 py-3 text-white/75"
                >{item.paymentMethod?.paymentName}</td
              >
              <td class="px-4 py-3 text-[var(--color-primary)] font-black"
                >{fmtRp(item.amount)}</td
              >
              <td class="px-4 py-3 text-white/75">{item.paymentStatus}</td>
              <td class="px-4 py-3 text-white/55"
                >{new Date(item.createdAt).toLocaleString("id-ID")}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
      {#if !loading && items.length === 0}
        <div class="p-6 text-center text-white/45">
          Belum ada riwayat topup.
        </div>
      {/if}
    </div>
  </div>
</section>
