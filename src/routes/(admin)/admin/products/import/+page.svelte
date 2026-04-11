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

  type SheetConfig = {
    enabled: boolean;
    subCategoryId: string;
    thumbnailUrl: string;
  };

  type ParsedSheet = {
    name: string;
    rows: ParsedRow[];
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
  let sheets = $state<ParsedSheet[]>([]);
  let activeSheetName = $state("");
  let settingsSheetName = $state("");
  let sheetConfigs = $state<Record<string, SheetConfig>>({});
  let parseError = $state<string | null>(null);
  let uploading = $state(false);
  let submitError = $state<string | null>(null);
  let submitSuccess = $state<string | null>(null);

  const expectedExample = [
    "Kode Produk",
    "Produk",
    "Harga",
    "Stok",
    "Deskripsi",
  ];

  const activeSheet = $derived(
    sheets.find((sheet) => sheet.name === activeSheetName) ?? null,
  );

  const settingsSheet = $derived(
    sheets.find((sheet) => sheet.name === settingsSheetName) ?? null,
  );

  const selectedSheets = $derived(
    sheets.filter((sheet) => sheetConfigs[sheet.name]?.enabled),
  );

  const totalSelectedRows = $derived(
    selectedSheets.reduce((acc, sheet) => acc + sheet.rows.length, 0),
  );

  function getSheetConfig(sheetName: string): SheetConfig {
    return (
      sheetConfigs[sheetName] ?? {
        enabled: false,
        subCategoryId: "",
        thumbnailUrl: "",
      }
    );
  }

  function setSheetConfig(sheetName: string, nextConfig: Partial<SheetConfig>) {
    sheetConfigs = {
      ...sheetConfigs,
      [sheetName]: {
        ...getSheetConfig(sheetName),
        ...nextConfig,
      },
    };
  }

  const canSubmit = $derived(
    selectedSheets.length > 0 &&
      !uploading &&
      selectedSheets.every((sheet) => {
        const config = getSheetConfig(sheet.name);
        return (
          !!config.subCategoryId &&
          sheet.rows.every((row) => row.title && row.sku && row.price)
        );
      }),
  );

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

  function normalizeSheetPath(target: string) {
    if (!target) return "";

    const cleaned = target.replace(/^\/+/, "");
    if (cleaned.startsWith("xl/")) return cleaned;
    if (cleaned.startsWith("worksheets/")) return `xl/${cleaned}`;
    return `xl/${cleaned}`;
  }

  function getCellValue(cell: Element | null, sharedStrings: string[]) {
    if (!cell) return "";

    const type = cell.getAttribute("t");
    const valueNode = cell.getElementsByTagName("v")[0];
    const inlineNode = cell.getElementsByTagName("is")[0];

    if (type === "inlineStr" && inlineNode) {
      return Array.from(inlineNode.getElementsByTagName("t"))
        .map((node) => node.textContent ?? "")
        .join("");
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

  function mapRow(raw: Record<string, string>, rowNumber: number) {
    const sku = pickValue(raw, [
      "sku",
      "kode_produk",
      "kode",
      "code",
      "product_code",
    ]);

    const title = pickValue(raw, [
      "nama_produk",
      "produk",
      "title",
      "nama",
      "item",
      "nominal",
      "kode_produk",
    ]);

    const price = pickValue(raw, ["harga", "price", "modal", "harga_jual"]);
    const description = pickValue(raw, ["deskripsi", "description", "keterangan"]);
    const seller = pickValue(raw, ["seller", "penjual"]);
    const status = pickValue(raw, ["status"]);
    const updatedAt = pickValue(raw, ["perubahan_terakhir", "updated_at"]);

    const fallbackNotes = [
      seller && `Seller: ${seller}`,
      status && `Status: ${status}`,
      updatedAt && `Updated: ${updatedAt}`,
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      rowNumber,
      title,
      sku,
      price,
      stock: "999",
      description,
      conditionNotes: fallbackNotes,
      isSpecial: false,
      raw,
    } satisfies ParsedRow;
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

    const workbookDoc = parser.parseFromString(workbookXml, "application/xml");

    const relsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
    const relMap = new Map<string, string>();

    if (relsXml) {
      const relsDoc = parser.parseFromString(relsXml, "application/xml");
      const relNodes = Array.from(relsDoc.getElementsByTagName("Relationship"));
      for (const rel of relNodes) {
        const id = rel.getAttribute("Id");
        const target = rel.getAttribute("Target");
        if (id && target) relMap.set(id, normalizeSheetPath(target));
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

    const sheetNodes = Array.from(workbookDoc.getElementsByTagName("sheet"));
    if (!sheetNodes.length) {
      throw new Error("Sheet Excel tidak ditemukan.");
    }

    const nextSheets: ParsedSheet[] = [];

    for (const sheetNode of sheetNodes) {
      const sheetName = cleanText(sheetNode.getAttribute("name") ?? "Sheet");
      const relId =
        sheetNode.getAttribute("r:id") ??
        sheetNode.getAttribute("id") ??
        "";

      const target = relMap.get(relId);
      const fallbackSheetId = sheetNode.getAttribute("sheetId") ?? "1";
      const candidatePaths = [
        target,
        `xl/worksheets/sheet${fallbackSheetId}.xml`,
        `xl/worksheets/${sheetName}.xml`,
      ].filter(Boolean) as string[];

      let sheetXml = "";
      for (const candidate of candidatePaths) {
        const content = await zip.file(candidate)?.async("string");
        if (content) {
          sheetXml = content;
          break;
        }
      }

      if (!sheetXml) continue;

      const sheetDoc = parser.parseFromString(sheetXml, "application/xml");
      const rowNodes = Array.from(sheetDoc.getElementsByTagName("row"));
      if (!rowNodes.length) continue;

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
      if (!headerRow) continue;

      const headers = headerRow.map((cell, index) =>
        normalizeHeader(cell || `column_${index + 1}`),
      );
      const headerIndex = matrix.indexOf(headerRow);

      const parsedRows = matrix
        .slice(headerIndex + 1)
        .map((row, index) => {
          const raw = headers.reduce<Record<string, string>>(
            (acc, header, headerCellIndex) => {
              acc[header] = cleanText(row[headerCellIndex] ?? "");
              return acc;
            },
            {},
          );

          return mapRow(raw, headerIndex + index + 2);
        })
        .filter((row) => row.title || row.sku || row.price);

      if (parsedRows.length) {
        nextSheets.push({
          name: sheetName,
          rows: parsedRows,
        });
      }
    }

    if (!nextSheets.length) {
      throw new Error("Isi sheet Excel gagal dibaca.");
    }

    sheets = nextSheets;
    activeSheetName = nextSheets.find((sheet) => sheet.name === "ML")?.name ?? nextSheets[0]?.name ?? "";
    settingsSheetName = "";
    sheetConfigs = nextSheets.reduce<Record<string, SheetConfig>>((acc, sheet) => {
      acc[sheet.name] = {
        enabled: false,
        subCategoryId: sheetConfigs[sheet.name]?.subCategoryId ?? "",
        thumbnailUrl: sheetConfigs[sheet.name]?.thumbnailUrl ?? "",
      };
      return acc;
    }, {});
  }

  async function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    sheets = [];
    activeSheetName = "";
    settingsSheetName = "";
    sheetConfigs = {};
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

  function updateRow(
    sheetName: string,
    index: number,
    key: keyof ParsedRow,
    value: string | boolean,
  ) {
    sheets = sheets.map((sheet) =>
      sheet.name === sheetName
        ? {
            ...sheet,
            rows: sheet.rows.map((row, rowIndex) =>
              rowIndex === index ? { ...row, [key]: value } : row,
            ),
          }
        : sheet,
    );
  }

  function openPreview(sheetName: string) {
    activeSheetName = sheetName;
  }

  function openSettings(sheetName: string) {
    settingsSheetName = sheetName;
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    uploading = true;
    submitError = null;
    submitSuccess = null;

    try {
      let totalInserted = 0;

      for (const sheet of selectedSheets) {
        const config = getSheetConfig(sheet.name);

        for (const row of sheet.rows) {
          const res = await fetch("/api/v1/products", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: row.title,
              sku: row.sku,
              description: row.description || undefined,
              subCategoryId: config.subCategoryId,
              price: Number(String(row.price).replace(/[^0-9.-]/g, "")) || 0,
              currency: "IDR",
              stock: 999,
              thumbnails: config.thumbnailUrl || undefined,
              conditionNotes: row.conditionNotes || undefined,
              special: row.isSpecial,
            }),
          });

          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            throw new Error(
              json?.data?.message ??
                json?.message ??
                `Gagal menambahkan produk pada sheet ${sheet.name} baris ${row.rowNumber}`,
            );
          }

          totalInserted += 1;
        }
      }

      submitSuccess = `${totalInserted} produk berhasil ditambahkan dari ${selectedSheets.length} page terpilih.`;
      sheets = [];
      activeSheetName = "";
      settingsSheetName = "";
      sheetConfigs = {};
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
        Batch Insert dari Excel per Page
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-2xl">
        Pilih page yang mau di-import, atur kategori dan thumbnail per page lewat popup, lalu preview datanya sebelum submit.
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

  <div class="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
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
          Parser otomatis baca semua sheet/page. Contoh kolom: {expectedExample.join(", ")}.
        </p>
        {#if fileName}
          <p class="text-[11px] text-white/60">File: {fileName}</p>
        {/if}
      </div>

      {#if sheets.length}
        <div class="space-y-2">
          <label class="text-xs text-white/70">Pilih page yang mau di-import</label>
          <div class="space-y-2 max-h-[520px] overflow-auto pr-1">
            {#each sheets as sheet}
              {@const config = getSheetConfig(sheet.name)}
              <div class="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <label class="flex items-center gap-2 min-w-0 text-xs text-white/85">
                    <input
                      type="checkbox"
                      class="rounded border-white/20 bg-black/60"
                      checked={config.enabled}
                      onchange={(e) =>
                        setSheetConfig(sheet.name, {
                          enabled: (e.currentTarget as HTMLInputElement).checked,
                        })}
                    />
                    <span class="truncate font-semibold">{sheet.name}</span>
                  </label>
                  <span class="text-[11px] text-white/45">{sheet.rows.length} produk</span>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                    onclick={() => openPreview(sheet.name)}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                    onclick={() => openSettings(sheet.name)}
                  >
                    Setting
                  </button>
                </div>

                <div class="text-[11px] text-white/45 space-y-1">
                  <p>
                    Status: <span class={config.enabled ? "text-emerald-300" : "text-white/35"}>{config.enabled ? "siap import" : "skip"}</span>
                  </p>
                  <p>
                    Sub kategori: <span class="text-white/65">{availableSubCategories.find((sub) => sub.id === config.subCategoryId)?.title ?? "belum dipilih"}</span>
                  </p>
                  <p>
                    Thumbnail: <span class="text-white/65">{config.thumbnailUrl ? "sudah diisi" : "belum diisi"}</span>
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

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

      <div class="rounded-xl border border-white/10 bg-black/20 p-3 text-[11px] text-white/55 space-y-1">
        <p class="font-semibold text-white/70">Ringkasan import</p>
        {#if sheets.length}
          {#each sheets as sheet}
            {@const config = getSheetConfig(sheet.name)}
            <div class="flex items-center justify-between gap-3">
              <span class={config.enabled ? "text-white/80" : "text-white/30"}>{sheet.name}</span>
              <span>{config.enabled ? `${sheet.rows.length} produk` : "skip"}</span>
            </div>
          {/each}
        {:else}
          <p>Belum ada sheet terbaca.</p>
        {/if}
      </div>

      <button
        type="button"
        class="w-full px-4 py-2.5 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740] disabled:opacity-50"
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        {uploading ? "Mengimport..." : `Import Page Terpilih (${totalSelectedRows})`}
      </button>
    </div>

    <div class="rounded-2xl border border-white/5 bg-[#0c0c0c] overflow-hidden">
      <div class="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
        <div>
          <p class="text-sm font-semibold text-white">Preview {activeSheet?.name ?? "Produk"}</p>
          <p class="text-[11px] text-white/45">
            Preview ini ngikut tombol Preview, bukan checkbox import.
          </p>
        </div>
        <div class="text-[11px] text-white/45">
          {activeSheet?.rows.length ?? 0} baris di page ini
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
            {#if !activeSheet}
              <tr>
                <td colspan="8" class="px-4 py-8 text-center text-white/35">
                  Klik tombol Preview di salah satu page untuk lihat datanya.
                </td>
              </tr>
            {:else}
              {#each activeSheet.rows as row, index}
                <tr class="border-b border-white/5 align-top">
                  <td class="px-4 py-3 text-white/45">{row.rowNumber}</td>
                  <td class="px-4 py-3 min-w-[220px]">
                    <input
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
                      value={row.title}
                      oninput={(e) =>
                        updateRow(
                          activeSheet.name,
                          index,
                          "title",
                          (e.currentTarget as HTMLInputElement).value,
                        )}
                    />
                  </td>
                  <td class="px-4 py-3 min-w-[140px]">
                    <input
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
                      value={row.sku}
                      oninput={(e) =>
                        updateRow(
                          activeSheet.name,
                          index,
                          "sku",
                          (e.currentTarget as HTMLInputElement).value,
                        )}
                    />
                  </td>
                  <td class="px-4 py-3 min-w-[120px]">
                    <input
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
                      value={row.price}
                      oninput={(e) =>
                        updateRow(
                          activeSheet.name,
                          index,
                          "price",
                          (e.currentTarget as HTMLInputElement).value,
                        )}
                    />
                  </td>
                  <td class="px-4 py-3 min-w-[100px]">
                    <input
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
                      value={row.stock}
                      oninput={(e) =>
                        updateRow(
                          activeSheet.name,
                          index,
                          "stock",
                          (e.currentTarget as HTMLInputElement).value,
                        )}
                    />
                  </td>
                  <td class="px-4 py-3 min-w-[240px]">
                    <textarea
                      rows="2"
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white resize-y focus:outline-none focus:border-[var(--color-primary)]/70"
                      oninput={(e) =>
                        updateRow(
                          activeSheet.name,
                          index,
                          "description",
                          (e.currentTarget as HTMLTextAreaElement).value,
                        )}
                    >{row.description}</textarea>
                  </td>
                  <td class="px-4 py-3 min-w-[220px]">
                    <textarea
                      rows="2"
                      class="w-full px-2.5 py-2 rounded-lg bg-black/30 border border:white/10 text-xs text-white resize-y focus:outline-none focus:border-[var(--color-primary)]/70"
                      oninput={(e) =>
                        updateRow(
                          activeSheet.name,
                          index,
                          "conditionNotes",
                          (e.currentTarget as HTMLTextAreaElement).value,
                        )}
                    >{row.conditionNotes}</textarea>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      class="rounded border-white/20 bg-black/60"
                      checked={row.isSpecial}
                      onchange={(e) =>
                        updateRow(
                          activeSheet.name,
                          index,
                          "isSpecial",
                          (e.currentTarget as HTMLInputElement).checked,
                        )}
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

  {#if settingsSheet}
    {@const settingsConfig = getSheetConfig(settingsSheet.name)}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div class="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 space-y-4 shadow-2xl">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em]">
              Setting Page
            </p>
            <h2 class="text-xl font-black text-white mt-1">{settingsSheet.name}</h2>
            <p class="text-xs text-white/45 mt-1">
              Atur sub kategori dan thumbnail untuk semua produk di page ini.
            </p>
          </div>
          <button
            type="button"
            class="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
            onclick={() => (settingsSheetName = "")}
          >
            Tutup
          </button>
        </div>

        <label class="inline-flex items-center gap-2 text-xs text-white/80">
          <input
            type="checkbox"
            class="rounded border-white/20 bg-black/60"
            checked={settingsConfig.enabled}
            onchange={(e) =>
              setSheetConfig(settingsSheet.name, {
                enabled: (e.currentTarget as HTMLInputElement).checked,
              })}
          />
          Import page ini
        </label>

        <div class="space-y-1.5">
          <label class="text-xs text-white/70">Sub Kategori</label>
          <select
            value={settingsConfig.subCategoryId}
            onchange={(e) =>
              setSheetConfig(settingsSheet.name, {
                subCategoryId: (e.currentTarget as HTMLSelectElement).value,
              })}
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
          >
            <option value="">Pilih sub kategori</option>
            {#each availableSubCategories as sub}
              <option value={sub.id}>{sub.categoryTitle} - {sub.title}</option>
            {/each}
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs text-white/70">Thumbnail Page</label>
          <ImageUrlField
            value={settingsConfig.thumbnailUrl}
            placeholder="https://asset.weebin.site/uploads/...jpg"
            help="Bisa paste manual atau pilih dari image manager. Thumbnail ini dipakai untuk semua produk pada page ini."
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs text-white/70">URL thumbnail tersimpan</label>
          <input
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]/70"
            value={settingsConfig.thumbnailUrl}
            oninput={(e) =>
              setSheetConfig(settingsSheet.name, {
                thumbnailUrl: (e.currentTarget as HTMLInputElement).value,
              })}
            placeholder="https://asset.weebin.site/uploads/...jpg"
          />
          <p class="text-[11px] text-white/45">
            Field ini yang dipakai langsung ke payload import.
          </p>
        </div>

        <div class="flex items-center justify-between gap-3 pt-2">
          <p class="text-[11px] text-white/45">
            Stock default semua produk di import ini akan jadi <span class="text-white font-semibold">999</span>.
          </p>
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
            onclick={() => (settingsSheetName = "")}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  {/if}
</section>
