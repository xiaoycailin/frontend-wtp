<script lang="ts">
  const { data } = $props();

  type UserItem = {
    id: string;
    email: string;
    displayName?: string | null;
    loginProvider?: string | null;
    role?: string | null;
    createdAt: string;
    updatedAt: string;
    isSellerVerified?: boolean;
    emailVerified?: boolean;
    currency?: string | null;
    _count?: {
      products?: number;
      transactions?: number;
    };
  };

  let users = $state<UserItem[]>(data.users ?? []);
  let meta = $state(data.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
  let error = $state<string | null>(data.error ?? null);
  let q = $state<string>(data.q ?? "");
  let role = $state<string>(data.role ?? "");

  function formatDate(value: string) {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function submitFilter() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (role) params.set("role", role);
    params.set("page", "1");
    params.set("limit", String(meta.limit || 20));
    window.location.href = `/admin/users?${params.toString()}`;
  }

  function changePage(nextPage: number) {
    const safePage = Math.max(1, Math.min(nextPage, meta.totalPages || 1));
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (role) params.set("role", role);
    params.set("page", String(safePage));
    params.set("limit", String(meta.limit || 20));
    window.location.href = `/admin/users?${params.toString()}`;
  }
</script>

<section class="space-y-6">
  <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div>
      <p class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1">
        Pengguna
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Manajemen Pengguna
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Lihat daftar user yang terdaftar, role, provider login, dan aktivitas dasarnya.
      </p>
    </div>
    <div class="text-xs text-white/50">
      Total user: <span class="text-white font-semibold">{meta.total ?? 0}</span>
    </div>
  </header>

  <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
      <input
        bind:value={q}
        type="text"
        placeholder="Cari email, nama, atau id user"
        class="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-[var(--color-primary)]"
        onkeydown={(e) => e.key === "Enter" && submitFilter()}
      />

      <select
        bind:value={role}
        class="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-[var(--color-primary)]"
      >
        <option value="">Semua role</option>
        <option value="admin">Admin</option>
        <option value="buyer">Buyer</option>
      </select>

      <button
        type="button"
        class="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-black text-sm font-semibold hover:bg-[#ffd740]"
        onclick={submitFilter}
      >
        Filter
      </button>
    </div>

    {#if error}
      <p class="text-xs text-red-400">{error}</p>
    {/if}

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-xs">
        <thead class="bg-white/5">
          <tr>
            <th class="px-3 py-2 font-semibold text-white/60">User</th>
            <th class="px-3 py-2 font-semibold text-white/60">Role</th>
            <th class="px-3 py-2 font-semibold text-white/60">Provider</th>
            <th class="px-3 py-2 font-semibold text-white/60">Verifikasi</th>
            <th class="px-3 py-2 font-semibold text-white/60">Aktivitas</th>
            <th class="px-3 py-2 font-semibold text-white/60">Dibuat</th>
          </tr>
        </thead>
        <tbody>
          {#if !users.length}
            <tr>
              <td colspan="6" class="px-3 py-6 text-center text-white/40">
                Belum ada data pengguna.
              </td>
            </tr>
          {:else}
            {#each users as user}
              <tr class="border-t border-white/5 hover:bg-white/[0.03]">
                <td class="px-3 py-3 align-top">
                  <div class="space-y-1">
                    <p class="text-sm font-semibold text-white">
                      {user.displayName || "Tanpa nama"}
                    </p>
                    <p class="text-white/70">{user.email}</p>
                    <p class="text-[11px] text-white/35 break-all">ID: {user.id}</p>
                  </div>
                </td>
                <td class="px-3 py-3 align-top text-white/80 uppercase">
                  {user.role ?? "buyer"}
                </td>
                <td class="px-3 py-3 align-top text-white/80">
                  {user.loginProvider ?? "email"}
                </td>
                <td class="px-3 py-3 align-top">
                  <div class="flex flex-col gap-1 text-[11px]">
                    <span class="rounded-full px-2 py-1 border border-white/10 bg-black/30 text-white/70 w-fit">
                      Email: {user.emailVerified ? "Verified" : "Belum"}
                    </span>
                    <span class="rounded-full px-2 py-1 border border-white/10 bg-black/30 text-white/70 w-fit">
                      Seller: {user.isSellerVerified ? "Verified" : "Belum"}
                    </span>
                  </div>
                </td>
                <td class="px-3 py-3 align-top text-white/70">
                  <p>Produk: {user._count?.products ?? 0}</p>
                  <p>Transaksi: {user._count?.transactions ?? 0}</p>
                  <p>Mata uang: {user.currency ?? "IDR"}</p>
                </td>
                <td class="px-3 py-3 align-top text-white/60">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between gap-3 pt-2 text-xs text-white/50">
      <p>
        Halaman <span class="text-white font-semibold">{meta.page ?? 1}</span>
        dari <span class="text-white font-semibold">{meta.totalPages ?? 1}</span>
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-40"
          disabled={(meta.page ?? 1) <= 1}
          onclick={() => changePage((meta.page ?? 1) - 1)}
        >
          Sebelumnya
        </button>
        <button
          type="button"
          class="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-40"
          disabled={(meta.page ?? 1) >= (meta.totalPages ?? 1)}
          onclick={() => changePage((meta.page ?? 1) + 1)}
        >
          Berikutnya
        </button>
      </div>
    </div>
  </div>
</section>

