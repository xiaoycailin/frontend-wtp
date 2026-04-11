<script lang="ts">
  import { goto } from "$app/navigation";
  import ImageUrlField from "$lib/components/admin/ImageUrlField.svelte";

  type SubCategory = {
    id: string;
    title: string;
    categoryId: string;
  };

  type Category = {
    id: string;
    title: string;
    subCategories?: SubCategory[];
  };

  type ParsedRow = {
    rowNumber: number;
    title: string;
    sku: string;
    price: string;
    stock: string;
    description: string;
    conditionNotes: string;
    isSpecial: boolean;
    raw: Record<string, string>;
  };

  const { data } = $props();
  const categories: Category[] = data?.categories ?? [];

  const availableSubCategories = categories.flatMap((category) =>
    (category.subCategories ?? []).map((sub) => ({
      ...sub,
      categoryTitle: category.title,
    })),
  );

  let fileName = $state("");
  let rows = $state<ParsedRow[]>([]);
  let parseError = $state<string | null>(null);
  let subCategoryId = $state("");
  let thumbnailUrl = $state("");
  let uploading = $state(false);
  let submitError = $state<string | null>(null);
  let submitSuccess = $state<string | null>(null);

  const expectedExample = ["Nama Produk", "SKU", "Harga", "Stok", "Deskripsi"];

  function normalizeHeader(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function cleanText(value: unknown) {
    return String(value ?? "")
      .replace(/\r/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pickValue(row: Record<string, string>, keys: string[]) {
    for (const key of keys) {
      if (row[key]) return row[key];
    }
    return "";
  }

  function getCellValue(cell: Element | null, sharedStrings: string[]) {
    if (!cell) return "";

    const type = cell.getAttribute("t");
    const valueNode = cell.getElementsByTagName("v")[0];
    const inlineNode = cell.getElementsByTagName("t")[0];

    if (type === "inlineStr" && inlineNode?.textContent) {
      return inlineNode.textContent;
    }

    if (!valueNode?.textContent) return "";

    if (type === "s") {
      const index = Number(valueNode.textContent);
      return Number.isNaN(index) ? "" : (sharedStrings[index] ?? "");
    }

    return valueNode.textContent;
  }

  function columnRefToIndex(ref: string) {
    const letters = ref.replace(/[^A-Z]/gi, "").toUpperCase();
    let index = 0;

    for (let i = 0; i < letters.length; i += 1) {
      index = index * 26 + (letters.charCodeAt(i) - 64);
    }

    return Math.max(index - 1, 0);
  }

  async function parseExcel(file: File) {
    const JSZip = (await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm")).default;
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const parser = new DOMParser();
    const workbookXml = await zip.file("xl/workbook.xml")?.async("string");

    if (!workbookXml) {
      throw new Error("File Excel tidak valid.");
    }

    const relsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
    const relMap = new Map<string, string>();

    if (relsXml) {
      const relsDoc = parser.parseFromString(relsXml, "application/xml");
      const relNodes = Array.from(relsDoc.getElementsByTagName("Relationship"));
      for (const rel of relNodes) {
        const id = rel.getAttribute("Id");
        const target = rel.getAttribute("Target");
        if (id && target) relMap.set(id, target);
      }
    }

    const sharedStringsXml = await zip.file("xl/sharedStrings.xml")?.async("string");
    const sharedStrings: string[] = [];

    if (sharedStringsXml) {
      const sharedDoc = parser.parseFromString(sharedStringsXml, "application/xml");
      const items = Array.from(sharedDoc.getElementsByTagName("si"));
      for (const item of items) {
        const texts = Array.from(item.getElementsByTagName("t"))
          .map((node) => node.textContent ?? "")
          .join("");
        sharedStrings.push(texts);
      }
    }

    const workbookDoc = parser.parseFromString(workbookXml, "application/xml");
    const sheet = workbookDoc.getElementsByTagName("sheet")[0];

    if (!sheet) {
      throw new Error("Sheet Excel tidak ditemukan.");
    }

    const relId = sheet.getAttribute("r:id");
    const target = relId ? relMap.get(relId) : null;
    const sheetPath = target ? `xl/${target.replace(/^\//, "")}` : "xl/worksheets/sheet1.xml";
    const sheetXml = await zip.file(sheetPath)?.async("string");

    if (!sheetXml) {
      throw new Error("Isi sheet Excel gagal dibaca.");
    }

    const sheetDoc = parser.parseFromString(sheetXml, "application/xml");
    const rowNodes = Array.from(sheetDoc.getElementsByTagName("row"));

    if (!rowNodes.length) {
      throw new Error("Sheet Excel kosong.");
    }

    const matrix = rowNodes.map((rowNode) => {
      const row: string[] = [];
      const cells = Array.from(rowNode.getElementsByTagName("c"));
      for (const cell of cells) {
        const ref = cell.getAttribute("r") ?? "A1";
        const colIndex = columnRefToIndex(ref);
        row[colIndex] = cleanText(getCellValue(cell, sharedStrings));
      }
      return row;
    });

    const headerRow = matrix.find((row) => row.some((cell) => cleanText(cell)));

    if (!headerRow) {
      throw new Error("Header Excel tidak ditemukan.");
    }

    const headers = headerRow.map((cell, index) => normalizeHeader(cell || `column_${index + 1}`));
    const headerIndex = matrix.indexOf(headerRow);

    const parsedRows = matrix
      .slice(headerIndex + 1)
      .map((row, index) => {
        const raw = headers.reduce<Record<string, string>>((acc, header, headerIndex) => {
          acc[header] = cleanText(row[headerIndex] ?? "");
          return acc;
        }, {});

        const title = pickValue(raw, ["nama_produk", "produk", "title", "nama", "item", "nominal"]);
        const sku = pickValue(raw, ["sku", "kode_produk", "kode", "code"]);
        const price = pickValue(raw, ["harga", "price", "modal", "harga_jual"]);
        const stock = pickValue(raw, ["stok", "stock", "qty", "quantity"]);
        const description = pickValue(raw, ["deskripsi", "description", "keterangan"]);
        const conditionNotes = pickValue(raw, ["catatan_kondisi", "condition_notes", "note", "notes"]);

        return {
          rowNumber: headerIndex + index + 2,
          title,
          sku,
          price,
          stock: stock || "100",
          description,
          conditionNotes,
          isSpecial: false,
          raw,
        } satisfies ParsedRow;
      })
      .filter((row) => row.title || row.sku || row.price);

    if (!parsedRows.length) {
      throw new Error("Tidak ada data produk yang berhasil dibaca dari Excel.");
    }

    rows = parsedRows;
  }

  async function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    rows = [];
    parseError = null;
    submitError = null;
    submitSuccess = null;
    fileName = file?.name ?? "";

    if (!file) return;

    try {
      await parseExcel(file);
    } catch (error: any) {
      console.error(error);
      parseError = error?.message ?? "Gagal membaca file Excel";
    }
  }

  function updateRow(index: number, key: keyof ParsedRow, value: string | boolean) {
    rows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [key]: value } : row,
    );
  }

  const canSubmit = $derived(
    !!subCategoryId && rows.length > 0 && !uploading && rows.every((row) => row.title && row.sku && row.price),
  );

  async function handleSubmit() {
    if (!canSubmit) return;

    uploading = true;
    submitError = null;
    submitSuccess = null;

    try {
      for (const row of rows) {
        const res = await fetch("/api/v1/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: row.title,
            sku: row.sku,
            description: row.description || undefined,
            subCategoryId,
            price: Number(String(row.price).replace(/[^0-9.-]/g, "")) || 0,
            currency: "IDR",
            stock: Number(String(row.stock).replace(/[^0-9.-]/g, "")) || 0,
            thumbnails: thumbnailUrl || undefined,
            conditionNotes: row.conditionNotes || undefined,
            special: row.isSpecial,
          }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            json?.data?.message ??
              json?.message ??
              `Gagal menambahkan produk pada baris ${row.rowNumber}`,
          );
        }
      }

      submitSuccess = `${rows.length} produk berhasil ditambahkan.`;
      rows = [];
      fileName = "";
    } catch (error: any) {
      console.error(error);
      submitError = error?.message ?? "Batch insert gagal";
    } finally {
      uploading = false;
    }
  }
</script>

<section class="space-y-6">
  <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div>
      <p class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1">
        Import Produk
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Batch Insert dari Excel
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-2xl">
        Upload file Excel, convert dulu ke JSON di frontend, cek preview hasilnya, lalu kirim produk yang valid ke server.
      </p>
    </div>

    <button
      type="button"
      class="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
      onclick={() => goto("/admin/products")}
    >
      Kembali ke Produk
    </button>
  </header>

  <div class="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
    <div class="space-y-4 rounded-2xl border border-white/5 bg-[#0c0c0c] p-4">
      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Upload Excel</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          class="w-full rounded-lg border border-dashed border-white/15 bg-black/20 px-3 py-3 text-xs text-white file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-black"
          onchange={handleFileChange}
        />
        <p class="text-[11px] text-white/45">
          Contoh kolom yang kebaca: {expectedExample.join(", ")}.
        </p>
        {#if fileName}
          <p class="text-[11px] text-white/60">File: {fileName}</p>
        {/if}
      </div>

      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Sub Kategori tujuan</label>
        <select
          bind:value={subCategoryId}
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
        >
          <option value="">Pilih sub kategori</option>
          {#each availableSubCategories as sub}
            <option value={sub.id}>{sub.categoryTitle} - {sub.title}</option>
          {/each}
        </select>
      </div>

      <ImageUrlField
        label="Thumbnail untuk semua produk"
        bind:value={thumbnailUrl}
        placeholder="https://asset.weebin.site/uploads/...jpg"
        help="Satu URL thumbnail untuk semua produk import. Kalau mau beda-beda bisa diedit setelah produk masuk."
      />

      {#if parseError}
        <div class="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {parseError}
        </div>
      {/if}

      {#if submitError}
        <div class="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {submitError}
        </div>
      {/if}

      {#if submitSuccess}
        <div class="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          {submitSuccess}
        </div>
      {/if}

      <button
        type="button"
        class="w-full px-4 py-2.5 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740] disabled:opacity-50"
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        {uploading ? "Mengimport..." : `Import ${rows.length} Produk`}
      </button>
    </div>

    <div class="rounded-2xl border border-white/5 bg-[#0c0c0c] overflow-hidden">
      <div class="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
        <div>
          <p class="text-sm font-semibold text-white">Preview Produk</p>
          <p class="text-[11px] text-white/45">
            Cek hasil convert Excel ke JSON sebelum disimpan.
          </p>
        </div>
        <div class="text-[11px] text-white/45">
          {rows.length} baris siap diproses
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-xs">
          <thead class="bg-white/5 border-b border-white/5">
            <tr>
              <th class="px-4 py-2.5 font-semibold text-white/60">Baris</th>
              <th class="px-4 py-2.5 font-semibold text-white/60">Judul</th>
              <th class="px-4 py-2.5 font-semibold text-white/60">SKU</th>
              <th class="px-4 py-2.5 font-semibold text-white/60">Harga</th>
              <th class="px-4 py-2.5 font-semibold text-white/60">Stok</th>
              <th class="px-4 py-2.5 font-semibold text-white/60">Deskripsi</th>
              <th class="px-4 py-2.5 font-semibold text-white/60">Catatan</th>
              <th class="px-4 py-2.5 font-semibold text-white/60 text-center">isSpecial</th>
            </tr>
          </thead>
          <tbody>
            {#if !rows.length}
              <tr>
                <td colspan="8" class="px-4 py-8 text-center text-white/35">
                  Upload file Excel dulu buat lihat preview-nya.
                </td>
              </tr>
            {:else}
              {#each rows as row, index}
                <tr class="border-b border-white/5 align-top">
                  <td class="px-4 py-3 text-white/45">{row.rowNumber}</td>
                  <td class="px-4 py-3 min-w-[220px]">
                    <input
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
                      value={row.title}
                      oninput={(e) => updateRow(index, "title", (e.currentTarget as HTMLInputElement).value)}
                    />
                  </td>
                  <td class="px-4 py-3 min-w-[140px]">
                    <input
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
                      value={row.sku}
                      oninput={(e) => updateRow(index, "sku", (e.currentTarget as HTMLInputElement).value)}
                    />
                  </td>
                  <td class="px-4 py-3 min-w-[120px]">
                    <input
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
                      value={row.price}
                      oninput={(e) => updateRow(index, "price", (e.currentTarget as HTMLInputElement).value)}
                    />
                  </td>
                  <td class="px-4 py-3 min-w-[100px]">
                    <input
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
                      value={row.stock}
                      oninput={(e) => updateRow(index, "stock", (e.currentTarget as HTMLInputElement).value)}
                    />
                  </td>
                  <td class="px-4 py-3 min-w-[240px]">
                    <textarea
                      rows="2"
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white resize-y focus:outline-none focus:border-[var(--color-primary)]/70"
                      oninput={(e) => updateRow(index, "description", (e.currentTarget as HTMLTextAreaElement).value)}
                    >{row.description}</textarea>
                  </td>
                  <td class="px-4 py-3 min-w-[220px]">
                    <textarea
                      rows="2"
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white resize-y focus:outline-none focus:border-[var(--color-primary)]/70"
                      oninput={(e) => updateRow(index, "conditionNotes", (e.currentTarget as HTMLTextAreaElement).value)}
                    >{row.conditionNotes}</textarea>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      class="rounded border-white/20 bg-black/60"
                      checked={row.isSpecial}
                      onchange={(e) => updateRow(index, "isSpecial", (e.currentTarget as HTMLInputElement).checked)}
                    />
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
