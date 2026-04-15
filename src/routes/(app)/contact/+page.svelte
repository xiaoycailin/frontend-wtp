<script lang="ts">
  import {
    Globe,
    Gmail,
    MapIcon,
    MessageBubble,
    Phone,
    Telegram,
    Whatsapp,
  } from "@boxicons/svelte";
  import type { SiteConfig } from "../../../app.js";
  import { toastStore } from "$lib/components/Toast/state.js";

  const { data } = $props();
  const siteConfig: SiteConfig = data?.siteConfig;

  console.log(siteConfig);

  const waNumber = siteConfig?.supportWhatsapp ?? "6288220783426";
  const waLink = `https://wa.me/${waNumber}`;
  const displayNumber = `+${waNumber}`;

  const quickContacts = [
    {
      icon: Phone,
      label: "Nomor WhatsApp",
      value: displayNumber,
      href: waLink,
      desc: "Untuk bantuan transaksi, komplain, dan pertanyaan umum.",
      external: true,
    },
    {
      icon: Whatsapp,
      label: "WhatsApp Support",
      value: "Online 08.00–22.00 WIB",
      href: waLink,
      desc: "Channel tercepat untuk respon bantuan harian.",
      external: true,
    },
    {
      icon: Telegram,
      label: "Telegram",
      value: siteConfig?.telegramUrl
        ? "Hubungi via Telegram"
        : "Belum tersedia",
      href: siteConfig?.telegramUrl ?? null,
      desc: "Alternatif kontak jika kamu lebih nyaman memakai Telegram.",
      external: true,
    },
    {
      icon: Gmail,
      label: "Email Support",
      value: siteConfig?.supportEmail ?? "Belum tersedia",
      href: siteConfig?.supportEmail
        ? `mailto:${siteConfig.supportEmail}`
        : null,
      desc: "Cocok untuk kendala transaksi dan kebutuhan bantuan teknis.",
      external: false,
    },
    // {
    //   icon: Gmail,
    //   label: "Email Kontak",
    //   value: siteConfig?.contactEmail ?? "Belum tersedia",
    //   href: siteConfig?.contactEmail
    //     ? `mailto:${siteConfig.contactEmail}`
    //     : null,
    //   desc: "Untuk kerja sama, bisnis, atau pertanyaan umum non-support.",
    //   external: false,
    // },
    {
      icon: Globe,
      label: "Website Resmi",
      value: siteConfig?.siteUrl ?? "Belum tersedia",
      href: siteConfig?.siteUrl ?? null,
      desc: "Pastikan hanya melakukan transaksi melalui website resmi kami.",
      external: true,
    },
  ].filter((item) => item.value !== "Belum tersedia" || item.href);

  let name = $state(null);
  let email = $state(null);
  let topic = $state(null);
  let message = $state(null);

  function sendToWhatsapp() {
    if (!name && !topic && !message)
      return toastStore.show("Harap lengkapi semua kolom");
    const text = `Halo ${siteConfig?.siteName ?? "Topupin Store"}, saya ingin menghubungi support.
*Nama*: ${name || "-"}
*Email*: ${email || "-"}
*Topik*: ${topic || "-"}
*Pesan*: ${message || "-"}`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  }
</script>

<svelte:head>
  <title>Kontak - {siteConfig?.siteName ?? "Topupin Store"}</title>
  <meta
    name="description"
    content="Butuh bantuan top up game, komplain transaksi, atau kerja sama dengan Topupin Store? Hubungi tim support kami lewat WhatsApp atau formulir kontak."
  />
</svelte:head>

<!-- HERO -->
<section style="position:relative; padding:5rem 0 3.5rem; overflow:hidden;">
  <div
    style="position:absolute; top:-8rem; right:-8rem; width:500px; height:500px;
           border-radius:50%; background:rgba(245,197,24,0.07);
           filter:blur(100px); pointer-events:none;"
    aria-hidden="true"
  ></div>
  <div
    style="position:absolute; bottom:-8rem; left:-8rem; width:400px; height:400px;
           border-radius:50%; background:rgba(245,197,24,0.04);
           filter:blur(100px); pointer-events:none;"
    aria-hidden="true"
  ></div>

  <div
    style="position:relative; z-index:1; max-width:48rem; margin:0 auto; text-align:center; padding:0 1rem;"
  >
    <div
      style="display:inline-flex; align-items:center; gap:0.5rem;
             padding:0.375rem 1rem; border-radius:9999px;
             background:rgba(245,197,24,0.10); border:1px solid rgba(245,197,24,0.25);
             color:var(--color-primary); font-size:0.75rem; font-weight:600; margin-bottom:1.5rem;"
    >
      <svg
        style="width:14px;height:14px;"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      Butuh bantuan? Hubungi kami
    </div>

    <h1
      style="font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff;
             letter-spacing:-0.02em; line-height:1.2; margin-bottom:1.25rem;"
    >
      Tim support siap<br />
      <span style="color:var(--color-primary);">bantu transaksi kamu</span>
    </h1>

    <p
      style="font-size:1rem; color:rgba(255,255,255,0.5); line-height:1.75; max-width:42rem; margin:0 auto;"
    >
      Ada kendala top up, saldo belum masuk, atau ingin kerja sama dengan
      {siteConfig?.siteName ?? "Topupin Store"}? Kirim pesan lewat WhatsApp atau
      formulir kontak di bawah.
    </p>
  </div>
</section>

<!-- QUICK CONTACT CARDS -->
<section
  style="border-top:1px solid rgba(255,255,255,0.07); border-bottom:1px solid rgba(255,255,255,0.07); padding:2.5rem 0;"
>
  <div
    style="display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1rem;"
  >
    {#each quickContacts as item}
      <a
        href={item.href}
        style="text-decoration:none;"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div
          style="background:#111; padding:1.5rem 1.25rem; border-radius:1rem;
                 border:1px solid rgba(255,255,255,0.08);
                 display:flex; flex-direction:column; gap:0.4rem;"
        >
          <div
            style="width:2.25rem; height:2.25rem; border-radius:0.625rem;
                   display:flex; align-items:center; justify-content:center;
                   background:rgba(245,197,24,0.12); color:var(--color-primary); margin-bottom:0.25rem;"
          >
            <svelte:component this={item.icon} size="sm" />
          </div>
          <p
            style="font-size:0.75rem; color:rgba(255,255,255,0.55); font-weight:600;"
          >
            {item.label}
          </p>
          <p style="font-size:0.95rem; font-weight:800; color:#fff;">
            {item.value}
          </p>
          <p style="font-size:0.75rem; color:rgba(255,255,255,0.45);">
            {item.desc}
          </p>
        </div>
      </a>
    {/each}
  </div>
</section>

<!-- FORM & INFO -->
<section style="padding:4rem 0 3rem;">
  <div
    style="display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); gap:2rem; align-items:flex-start;"
  >
    <!-- Form -->
    <div
      style="padding:1.75rem; border-radius:1.25rem;
             background:#161616; border:1px solid rgba(255,255,255,0.09);"
    >
      <div
        style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;"
      >
        <div>
          <p
            style="font-size:0.7rem; font-weight:700; color:var(--color-primary);
                   text-transform:uppercase; letter-spacing:0.12em; margin-bottom:0.4rem;"
          >
            Formulir Kontak
          </p>
          <h2 style="font-size:1.3rem; font-weight:900; color:#fff;">
            Kirim pesan ke tim support
          </h2>
        </div>
        <div
          style="width:2.5rem; height:2.5rem; border-radius:0.75rem;
                 background:rgba(245,197,24,0.08);
                 display:flex; align-items:center; justify-content:center; color:var(--color-primary);"
        >
          <Whatsapp size="sm" />
        </div>
      </div>

      <!-- Contoh form only-frontend; nanti bisa kamu ganti ke form actions -->
      <form
        on:submit|preventDefault={sendToWhatsapp}
        // method="post"
        style="display:flex; flex-direction:column; gap:0.9rem;"
      >
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <div style="flex:1 1 180px;">
            <label
              for="name"
              style="display:block; font-size:0.75rem; color:rgba(255,255,255,0.7); margin-bottom:0.25rem;"
            >
              Nama lengkap
            </label>
            <input
              bind:value={name}
              id="name"
              name="name"
              type="text"
              required
              placeholder="Isi nama kamu"
              style="width:100%; padding:0.65rem 0.75rem; border-radius:0.625rem;
                     border:1px solid rgba(255,255,255,0.2); background:#111;
                     color:#fff; font-size:0.8rem; outline:none;"
            />
          </div>
          <div style="flex:1 1 180px;">
            <label
              for="email"
              style="display:block; font-size:0.75rem; color:rgba(255,255,255,0.7); margin-bottom:0.25rem;"
            >
              Email (opsional)
            </label>
            <input
              bind:value={email}
              id="email"
              name="email"
              type="email"
              placeholder="contoh@email.com"
              style="width:100%; padding:0.65rem 0.75rem; border-radius:0.625rem;
                     border:1px solid rgba(255,255,255,0.2); background:#111;
                     color:#fff; font-size:0.8rem; outline:none;"
            />
          </div>
        </div>

        <div>
          <label
            for="topic"
            style="display:block; font-size:0.75rem; color:rgba(255,255,255,0.7); margin-bottom:0.25rem;"
          >
            Topik
          </label>
          <select
            bind:value={topic}
            id="topic"
            name="topic"
            required
            style="width:100%; padding:0.65rem 0.75rem; border-radius:0.625rem;
                   border:1px solid rgba(255,255,255,0.2); background:#111;
                   color:rgba(255,255,255,0.9); font-size:0.8rem; outline:none;"
          >
            <option value="" disabled selected>Pilih topik</option>
            <option value="transaksi"
              >Kendala transaksi / saldo belum masuk</option
            >
            <option value="akun">Masalah akun & login</option>
            <option value="kerjasama">Kerja sama / partnership</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label
            for="message"
            style="display:block; font-size:0.75rem; color:rgba(255,255,255,0.7); margin-bottom:0.25rem;"
          >
            Pesan kamu
          </label>
          <textarea
            bind:value={message}
            id="message"
            name="message"
            rows="5"
            required
            placeholder="Ceritakan kendala atau pertanyaan kamu secara detail biar tim kami bisa bantu lebih cepat."
            style="width:100%; padding:0.7rem 0.75rem; border-radius:0.75rem;
                   border:1px solid rgba(255,255,255,0.2); background:#111;
                   color:#fff; font-size:0.8rem; line-height:1.6; resize:vertical; outline:none;"
          ></textarea>
        </div>

        <div
          style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:0.75rem; margin-top:0.25rem;"
        >
          <p
            style="font-size:0.7rem; color:rgba(255,255,255,0.45); max-width:14rem;"
          >
            Dengan mengirim pesan, kamu setuju bahwa tim kami akan menghubungi
            via WhatsApp atau email jika diperlukan.
          </p>
          <button
            type="submit"
            style="display:inline-flex; align-items:center; justify-content:center;
                   padding:0.6rem 1.6rem; border-radius:0.75rem;
                   background:var(--color-primary); color:#000;
                   font-size:0.85rem; font-weight:700; border:none;
                   cursor:pointer; box-shadow:0 8px 20px rgba(245,197,24,0.28);"
          >
            Kirim Pesan
          </button>
        </div>
      </form>
    </div>

    <!-- Info panel -->
    <div
      style="padding:1.75rem; border-radius:1.25rem;
             background:rgba(245,197,24,0.06); border:1px solid rgba(245,197,24,0.22);"
    >
      <p
        style="font-size:0.7rem; font-weight:700; color:var(--color-primary);
               text-transform:uppercase; letter-spacing:0.12em; margin-bottom:0.5rem;"
      >
        Jam Operasional
      </p>
      <h3
        style="font-size:1.1rem; font-weight:900; color:#fff; margin-bottom:0.5rem;"
      >
        Support aktif setiap hari
      </h3>
      <p
        style="font-size:0.85rem; color:rgba(255,255,255,0.55); line-height:1.7; margin-bottom:1.25rem;"
      >
        Tim {siteConfig?.siteName ?? "Topupin Store"} siap membantu kamu setiap hari
        pukul 08.00–22.00 WIB melalui WhatsApp dan tiket support.
      </p>

      <div
        style="padding:0.9rem 0.9rem; border-radius:0.9rem;
               background:#161616; border:1px dashed rgba(245,197,24,0.5);
               margin-bottom:1.25rem;"
      >
        <p
          style="font-size:0.8rem; color:rgba(255,255,255,0.6); line-height:1.7;"
        >
          Untuk proses pengecekan transaksi yang lebih cepat, sertakan: ID game,
          server (jika ada), nominal top up, metode pembayaran, dan bukti
          pembayaran.
        </p>
      </div>

      <div
        style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.25rem;"
      >
        <div>
          <p
            style="font-size:0.75rem; color:rgba(255,255,255,0.55); margin-bottom:0.15rem;"
          >
            WhatsApp Resmi
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style="font-size:0.9rem; font-weight:800; color:var(--color-primary); text-decoration:none;"
          >
            {displayNumber}
          </a>
        </div>

        {#if siteConfig?.siteUrl}
          <div>
            <p
              style="font-size:0.75rem; color:rgba(255,255,255,0.55); margin-bottom:0.15rem;"
            >
              Website
            </p>
            <a
              href={siteConfig.siteUrl}
              style="font-size:0.85rem; color:rgba(255,255,255,0.8); text-decoration:none;"
            >
              {siteConfig.siteUrl}
            </a>
          </div>
        {/if}
      </div>

      <p
        style="font-size:0.75rem; color:rgba(255,255,255,0.45); line-height:1.7;"
      >
        Hindari melakukan transaksi di luar website resmi
        {siteConfig?.siteUrl ? ` (${siteConfig.siteUrl})` : ""} dan nomor WhatsApp
        di atas untuk mencegah penipuan.
      </p>
    </div>
  </div>
</section>
