<script lang="ts">
  import ImageUrlField from "$lib/components/admin/ImageUrlField.svelte";
  import { onMount } from "svelte";

  type Payment = {
    id: number;
    paymentName: string;
    thumbnail: string;
    group: string | null;
    paymentVisibility: "active" | "inactive" | string;
    feeType: "percent" | "flat" | string;
    feeValue: number;
    methodCode: string;
    source: string;
  };

  const { data } = $props();

  let payments = $state<Payment[]>(data.payments ?? []);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let groupedPayments = $state<Record<string, Payment[]>>();
  let deletingPaymentId = $state<number | null>(null);

  // token: nanti silakan ganti ambil dari cookies/localStorage
  let token = data.token;

  // modal state
  let showPaymentModal = $state(false);
  let editingPayment = $state<Payment | null>(null);

  let paymentForm = $state({
    thumbnail: "",
    paymentName: "",
    methodCode: "",
    feeType: "flat",
    feeValue: 0,
    source: "DUITKU",
    paymentVisibility: "active",
    group: "qris",
  });

  async function fetchPayments() {
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/payments/available", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal memuat payments");
      }
      payments = json.data ?? [];
    } catch (e: any) {
      error = e?.message ?? "Terjadi kesalahan saat memuat payments";
    } finally {
      loading = false;
    }
  }

  function openCreatePayment() {
    editingPayment = null;
    paymentForm.thumbnail = "";
    paymentForm.paymentName = "";
    paymentForm.methodCode = "";
    paymentForm.feeType = "flat";
    paymentForm.feeValue = 0;
    paymentForm.source = "DUITKU";
    paymentForm.paymentVisibility = "active";
    paymentForm.group = "qris";
    showPaymentModal = true;
  }

  function openEditPayment(p: Payment) {
    editingPayment = p;
    paymentForm.thumbnail = p.thumbnail ?? "";
    paymentForm.paymentName = p.paymentName ?? "";
    paymentForm.methodCode = p.methodCode ?? "";
    paymentForm.feeType = p.feeType ?? "flat";
    paymentForm.feeValue = p.feeValue ?? 0;
    paymentForm.source = p.source ?? "DUITKU";
    paymentForm.paymentVisibility = p.paymentVisibility ?? "active";
    paymentForm.group = p.group ?? "qris";
    showPaymentModal = true;
  }

  async function submitPayment() {
    if (!paymentForm.paymentName.trim()) {
      alert("Nama payment wajib diisi");
      return;
    }
    if (!paymentForm.methodCode.trim()) {
      alert("Method code wajib diisi");
      return;
    }

    const body = {
      thumbnail: paymentForm.thumbnail.trim(),
      paymentName: paymentForm.paymentName.trim(),
      methodCode: paymentForm.methodCode.trim(),
      feeType: paymentForm.feeType,
      feeValue: Number(paymentForm.feeValue ?? "0"),
      source: paymentForm.source.trim(),
      paymentVisibility:
        paymentForm.paymentVisibility === "inactive"
          ? "nonactive"
          : paymentForm.paymentVisibility,
      group: paymentForm.group || null,
    };

    try {
      loading = true;
      const res = await fetch(
        editingPayment
          ? `/api/v1/payments/${editingPayment.id}`
          : "/api/v1/payments",
        {
          method: editingPayment ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal menyimpan payment");
      }
      showPaymentModal = false;
      await fetchPayments();
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan payment");
    } finally {
      loading = false;
    }
  }

  async function handleDeletePayment(payment: Payment) {
    const confirmed = window.confirm(
      `Yakin mau hapus metode pembayaran \"${payment.paymentName}\"?`,
    );
    if (!confirmed) return;

    deletingPaymentId = payment.id;
    error = null;

    try {
      const res = await fetch(`/api/v1/payments/${payment.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal menghapus payment",
        );
      }

      payments = payments.filter((item) => item.id !== payment.id);
    } catch (e: any) {
      error = e?.message ?? "Gagal menghapus payment";
    } finally {
      deletingPaymentId = null;
    }
  }

  function groupLabel(group: string | null) {
    if (!group) return "Lainnya";
    if (group === "qris") return "QRIS";
    if (group === "va") return "Virtual Account";
    return group;
  }

  $effect(() => {
    groupedPayments = payments.reduce<Record<string, Payment[]>>((acc, p) => {
      const key = p.group ?? "others";
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});
  });
  onMount(() => {
    fetchPayments()
  })
</script>

<section class="space-y-6">
  <header
    class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
  >
    <div>
      <p
        class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1"
      >
        Pembayaran
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Metode Pembayaran
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Atur metode pembayaran yang tersedia di platform.
      </p>
    </div>
    <div class="flex items-center gap-2 text-xs">
      <button
        type="button"
        class="px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
        on:click={openCreatePayment}
      >
        + Tambah Payment
      </button>
    </div>
  </header>

  {#if error}
    <p class="text-xs text-red-400">{error}</p>
  {/if}

  {#if loading && !payments.length}
    <p class="text-xs text-white/50">Memuat data...</p>
  {/if}

  <div class="space-y-4">
    {#if !payments.length && !loading}
      <p class="text-xs text-white/50">Belum ada metode pembayaran.</p>
    {:else}
      {#each Object.entries(groupedPayments || {}) as [groupKey, items]}
        <article
          class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden"
        >
          <header
            class="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/5"
          >
            <div class="space-y-0.5 text-xs">
              <p class="text-[11px] text-white/40 uppercase tracking-[0.16em]">
                Group
              </p>
              <h2 class="text-sm font-semibold text-white">
                {groupLabel(groupKey === "others" ? null : groupKey)}
              </h2>
              <p class="text-[11px] text-white/40">
                {items.length} metode pembayaran
              </p>
            </div>
          </header>

          <div class="px-4 py-3">
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-[11px]">
                <thead class="bg-white/5">
                  <tr>
                    <th class="px-3 py-2 font-semibold text-white/60">
                      Metode
                    </th>
                    <th class="px-3 py-2 font-semibold text-white/60">
                      Code
                    </th>
                    <th class="px-3 py-2 font-semibold text-white/60">
                      Source
                    </th>
                    <th class="px-3 py-2 font-semibold text-white/60"> Fee </th>
                    <th class="px-3 py-2 font-semibold text-white/60">
                      Visibility
                    </th>
                    <th
                      class="px-3 py-2 font-semibold text-white/60 text-right"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#each items as p}
                    <tr class="border-t border-white/5 hover:bg-white/[0.03]">
                      <td class="px-3 py-2 align-top">
                        <div class="flex items-center gap-2">
                          {#if p.thumbnail}
                            <img
                              src={p.thumbnail}
                              alt={p.paymentName}
                              class="w-8 h-8 rounded-md object-contain bg-white"
                              loading="lazy"
                            />
                          {/if}
                          <div class="min-w-0">
                            <p
                              class="text-xs font-semibold text-white truncate"
                            >
                              {p.paymentName}
                            </p>
                            <p class="text-[10px] text-white/40">
                              ID: {p.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td class="px-3 py-2 align-top text-white/80">
                        {p.methodCode}
                      </td>
                      <td class="px-3 py-2 align-top text-white/80">
                        {p.source}
                      </td>
                      <td class="px-3 py-2 align-top text-white/80">
                        {p.feeType === "percent"
                          ? `${p.feeValue}%`
                          : `Rp ${(p.feeValue ?? 0)?.toLocaleString("id-ID")}`}
                      </td>
                      <td class="px-3 py-2 align-top">
                        <span
                          class="text-[10px] rounded-full px-2 py-0.5 border border-white/15 text-white/70 bg-black/40"
                        >
                          {p.paymentVisibility === "active"
                            ? "Aktif"
                            : "Nonaktif"}
                        </span>
                      </td>
                      <td class="px-3 py-2 align-top text-right">
                        <div class="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                            on:click={() => openEditPayment(p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 disabled:opacity-50"
                            disabled={deletingPaymentId === p.id}
                            on:click={() => handleDeletePayment(p)}
                          >
                            {deletingPaymentId === p.id
                              ? "Menghapus..."
                              : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      {/each}
    {/if}
  </div>
</section>

{#if showPaymentModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-lg mx-4 rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-3"
    >
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-semibold text-white">
          {editingPayment ? "Tambah Payment Baru" : "Tambah Payment"}
        </h2>
        <button
          class="text-xs text-white/50 hover:text-white"
          on:click={() => (showPaymentModal = false)}
        >
          Tutup
        </button>
      </div>

      <div class="space-y-2 text-xs max-h-[70vh] overflow-y-auto pr-1">
        <label class="flex flex-col gap-1">
          <span class="text-white/70">Nama payment</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={paymentForm.paymentName}
            placeholder="BCA VA, QRIS GV, dll"
          />
        </label>

        <ImageUrlField
          label="Thumbnail URL"
          bind:value={paymentForm.thumbnail}
          placeholder="https://images.duitku.com/..."
          help="Bisa paste manual atau pilih dari image manager."
        />

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Method code</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={paymentForm.methodCode}
            placeholder="BC, GQ, SP, dll"
          />
        </label>

        <div class="grid grid-cols-2 gap-2">
          <label class="flex flex-col gap-1 text-xs">
            <span class="text-white/70">Fee type</span>
            <select
              class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
              bind:value={paymentForm.feeType}
            >
              <option value="flat">Flat</option>
              <option value="percent">Percent</option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-xs">
            <span class="text-white/70">
              Fee value
              {#if paymentForm.feeType === "percent"}
                <span class="text-white/40">(%)</span>
              {:else}
                <span class="text-white/40">(Rp)</span>
              {/if}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
              bind:value={paymentForm.feeValue}
            />
          </label>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <label class="flex flex-col gap-1 text-xs">
            <span class="text-white/70">Source</span>
            <input
              class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
              bind:value={paymentForm.source}
              placeholder="DUITKU, XENDIT, dll"
            />
          </label>

          <label class="flex flex-col gap-1 text-xs">
            <span class="text-white/70">Visibility</span>
            <select
              class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
              bind:value={paymentForm.paymentVisibility}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <label class="flex flex-col gap-1 text-xs">
          <span class="text-white/70">Group</span>
          <select
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={paymentForm.group}
          >
            <option value="qris">QRIS</option>
            <option value="va">Virtual Account</option>
            <option value="ewallet">E-Wallet</option>
            <option value="retail">Retail</option>
          </select>
        </label>
      </div>

      <div class="flex justify-end gap-2 pt-2 text-xs">
        <button
          class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          type="button"
          on:click={() => (showPaymentModal = false)}
        >
          Batal
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
          type="button"
          on:click={submitPayment}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  </div>
{/if}
