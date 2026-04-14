<script lang="ts">
  import type { SiteConfig } from "../../../app.js";
  import "./page.css";

  const lastUpdated = "1 April 2026";

  const { data } = $props();

  const siteConfig: SiteConfig = data.siteConfig;

  // console.log(siteConfig);

  const sections = [
    {
      id: "pengumpulan",
      title: "1. Data yang Kami Kumpulkan",
      content: [
        {
          subtitle: "Data yang kamu berikan langsung:",
          items: [
            "Nama tampilan (display name) saat mendaftar.",
            "Alamat email yang digunakan untuk membuat akun.",
            "Password yang disimpan dalam bentuk terenkripsi (hashed) — kami tidak pernah menyimpan password dalam bentuk teks biasa.",
            "ID game dan server yang kamu masukkan saat melakukan top-up.",
            "Informasi yang kamu berikan saat menghubungi layanan pelanggan.",
          ],
        },
        {
          subtitle: "Data yang dikumpulkan otomatis:",
          items: [
            "Alamat IP dan informasi perangkat (browser, sistem operasi, resolusi layar).",
            "Data aktivitas seperti halaman yang dikunjungi, waktu akses, dan durasi sesi.",
            "Data transaksi termasuk ID transaksi, nominal, metode pembayaran, dan status transaksi.",
            "Cookie dan data penyimpanan lokal untuk menjaga sesi login tetap aktif.",
          ],
        },
      ],
    },
    {
      id: "penggunaan",
      title: "2. Cara Kami Menggunakan Data",
      items: [
        "Memproses dan memverifikasi transaksi top-up serta mengirimkan item ke akun game kamu.",
        "Mengirimkan notifikasi terkait transaksi, pembaruan layanan, atau informasi keamanan akun.",
        "Mendeteksi dan mencegah aktivitas penipuan, penyalahgunaan, serta akses tidak sah.",
        "Menganalisis pola penggunaan untuk meningkatkan performa dan pengalaman pengguna Platform.",
        "Mematuhi kewajiban hukum dan regulasi yang berlaku di Indonesia.",
        "Merespons pertanyaan dan keluhan yang kamu sampaikan melalui layanan pelanggan.",
      ],
    },
    {
      id: "penyimpanan",
      title: "3. Penyimpanan & Keamanan Data",
      items: [
        "Seluruh data pengguna disimpan di server yang berlokasi di Indonesia dan/atau negara yang memiliki standar perlindungan data yang setara.",
        "Kami menggunakan enkripsi TLS/SSL untuk melindungi data selama proses transmisi antara perangkatmu dan server kami.",
        "Password disimpan menggunakan algoritma hashing satu arah (bcrypt) sehingga tidak dapat dipulihkan oleh siapapun, termasuk tim kami.",
        "Data transaksi dan akun pengguna disimpan selama akun aktif dan hingga 5 tahun setelah penutupan akun untuk keperluan audit dan kepatuhan hukum.",
        "Kami secara rutin melakukan audit keamanan dan penetration testing untuk memastikan sistem tetap terlindungi.",
      ],
    },
    {
      id: "berbagi",
      title: "4. Berbagi Data dengan Pihak Ketiga",
      items: [
        `${siteConfig?.siteName ?? "Topupin Store"} tidak menjual atau menyewakan data pribadimu kepada pihak ketiga manapun.`,
        "Data transaksi dibagikan kepada penyedia layanan pembayaran (payment gateway) hanya untuk keperluan verifikasi dan pemrosesan transaksi.",
        "Data ID game dibagikan kepada publisher atau penyedia layanan top-up yang bersangkutan semata-mata untuk memproses pengiriman item.",
        "Kami dapat menggunakan layanan pihak ketiga seperti analitik dan pemantauan performa yang hanya menerima data dalam bentuk agregat dan anonim.",
        "Data dapat diungkapkan kepada otoritas yang berwenang apabila diwajibkan oleh hukum, perintah pengadilan, atau regulasi yang berlaku.",
      ],
    },
    {
      id: "cookie",
      title: "5. Cookie & Teknologi Pelacakan",
      items: [
        `${siteConfig?.siteName ?? "Topupin Store"} menggunakan cookie esensial untuk menjaga sesi login dan preferensi pengguna agar tetap aktif selama kunjungan.`,
        "Cookie analitik digunakan untuk memahami bagaimana pengguna berinteraksi dengan Platform guna meningkatkan kualitas layanan.",
        "Kamu dapat mengelola atau menonaktifkan cookie melalui pengaturan browser. Namun, menonaktifkan cookie esensial dapat mengganggu fungsi login dan transaksi.",
        "Kami tidak menggunakan cookie pelacak iklan (advertising tracker) pihak ketiga.",
      ],
    },
    {
      id: "hak",
      title: "6. Hak-hak Kamu sebagai Pengguna",
      items: [
        "Hak Akses — Kamu berhak meminta salinan data pribadi yang kami simpan tentangmu kapan saja.",
        "Hak Koreksi — Kamu dapat memperbarui informasi akunmu yang tidak akurat langsung melalui halaman pengaturan akun.",
        "Hak Penghapusan — Kamu dapat meminta penghapusan data pribadimu. Permintaan akan diproses dalam 30 hari kerja, kecuali data tersebut diperlukan untuk keperluan hukum.",
        "Hak Portabilitas — Kamu berhak mendapatkan data pribadimu dalam format yang dapat dibaca mesin untuk dipindahkan ke layanan lain.",
        "Hak Keberatan — Kamu dapat mengajukan keberatan atas pemrosesan data untuk keperluan tertentu, seperti pemasaran langsung.",
        "Untuk menggunakan hak-hak di atas, kirimkan permintaan ke privacy@wtpanjay.com beserta verifikasi identitasmu.",
      ],
    },
    {
      id: "anak",
      title: "7. Perlindungan Data Anak",
      items: [
        `Layanan ${siteConfig?.siteName ?? "Topupin Store"} tidak ditujukan untuk anak-anak di bawah usia 13 tahun. Kami tidak dengan sengaja mengumpulkan data dari anak-anak di bawah usia tersebut.`,
        "Bagi pengguna berusia 13–17 tahun, penggunaan layanan harus dengan sepengetahuan dan pengawasan orang tua atau wali.",
        "Jika kami mengetahui bahwa data dari anak di bawah 13 tahun telah dikumpulkan tanpa persetujuan orang tua, kami akan segera menghapus data tersebut.",
        "Orang tua atau wali yang memiliki kekhawatiran terkait data anak dapat menghubungi kami di privacy@wtpanjay.com.",
      ],
    },
    {
      id: "transfer",
      title: "8. Transfer Data Internasional",
      items: [
        "Dalam beberapa kasus operasional, data mungkin diproses di luar Indonesia oleh penyedia layanan cloud atau infrastruktur yang kami gunakan.",
        "Setiap transfer data internasional dilakukan dengan memastikan bahwa negara tujuan atau penyedia layanan memiliki standar perlindungan data yang memadai.",
        "Kami menggunakan klausul kontraktual standar dan perjanjian pemrosesan data untuk melindungi hakmu dalam transfer data internasional.",
      ],
    },
    {
      id: "perubahan",
      title: "9. Perubahan Kebijakan Privasi",
      items: [
        `${siteConfig?.siteName ?? "Topupin Store"} dapat memperbarui kebijakan privasi ini dari waktu ke waktu untuk mencerminkan perubahan layanan, regulasi, atau praktik privasi kami.`,
        "Perubahan material akan diberitahukan melalui email terdaftar atau notifikasi yang terlihat jelas di Platform minimal 7 hari sebelum berlaku.",
        "Versi terbaru kebijakan privasi selalu tersedia di halaman ini dengan tanggal pembaruan yang dicantumkan di bagian atas dokumen.",
        "Melanjutkan penggunaan layanan setelah perubahan berlaku dianggap sebagai penerimaan terhadap kebijakan privasi yang diperbarui.",
      ],
    },
    {
      id: "kontak",
      title: "10. Hubungi Tim Privasi Kami",
      items: [
        "Untuk pertanyaan, permintaan, atau keluhan terkait privasi dan perlindungan data pribadimu, hubungi kami melalui:",
        `Email Privasi: ${siteConfig?.contactEmail ?? ""}`,
        `Email Dukungan Umum: ${siteConfig?.supportEmail ?? ""}`,
        "Jam Operasional: Senin – Minggu, 08.00 – 22.00 WIB",
        "Kami berkomitmen merespons setiap permintaan terkait privasi dalam waktu 3 hari kerja.",
      ],
    },
  ];

  let activeId = $state("pengumpulan");

  function scrollTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    activeId = id;
  }
</script>

<svelte:head>
  <title>Kebijakan Privasi — {siteConfig?.siteName ?? "Topupin Store"}</title>
  <meta
    name="description"
    content={`Pelajari bagaimana ${siteConfig?.siteName ?? "Topupin Store"} mengumpulkan, menggunakan, dan melindungi data pribadimu.`}
  />
</svelte:head>

<div class="pp-root">
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="glow glow-1" aria-hidden="true"></div>
  <div class="glow glow-2" aria-hidden="true"></div>

  <!-- Header -->
  <header class="pp-header">
    <div class="header-inner">
      <a href="/" class="logo-link" aria-label="Kembali ke beranda">
        <svg
          class="logo-icon"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
        >
          <polygon
            points="20,2 38,11 38,29 20,38 2,29 2,11"
            fill="var(--color-primary)"
            opacity="0.15"
          />
          <polygon
            points="20,2 38,11 38,29 20,38 2,29 2,11"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="1.5"
          />
          <text
            x="20"
            y="26"
            text-anchor="middle"
            font-family="'Rajdhani',sans-serif"
            font-weight="700"
            font-size="14"
            fill="var(--color-primary)">W</text
          >
        </svg>
        <span class="logo-text">{siteConfig?.siteName ?? "Topupin Store"}</span>
      </a>
      <a href="/" class="back-link">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Kembali
      </a>
    </div>
  </header>

  <div class="pp-layout">
    <!-- Sidebar TOC -->
    <aside class="pp-sidebar" aria-label="Daftar isi">
      <p class="toc-heading">Daftar Isi</p>
      <nav>
        <ul class="toc-list" role="list">
          {#each sections as sec}
            <li>
              <button
                class="toc-item"
                class:active={activeId === sec.id}
                onclick={() => scrollTo(sec.id)}
              >
                {sec.title}
              </button>
            </li>
          {/each}
        </ul>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="pp-main">
      <!-- Hero -->
      <div class="pp-hero">
        <div class="hero-badge">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Dokumen Resmi
        </div>
        <h1 class="pp-title">Kebijakan Privasi</h1>
        <p class="pp-subtitle">
          Privasi dan keamanan datamu adalah prioritas kami. Halaman ini
          menjelaskan secara transparan bagaimana
          {siteConfig?.siteName ?? "Topupin Store"} mengumpulkan, menggunakan, dan
          melindungi informasi pribadimu.
        </p>
        <p class="pp-updated">
          Terakhir diperbarui: <strong>{lastUpdated}</strong>
        </p>
      </div>

      <!-- Highlight cards -->
      <div class="highlight-grid" aria-label="Ringkasan komitmen privasi">
        <div class="highlight-card">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span class="highlight-title">Data Terenkripsi</span>
          <span class="highlight-desc"
            >Password & transaksi dilindungi enkripsi end-to-end</span
          >
        </div>
        <div class="highlight-card">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <span class="highlight-title">Tidak Dijual</span>
          <span class="highlight-desc"
            >Data kamu tidak pernah dijual ke pihak ketiga manapun</span
          >
        </div>
        <div class="highlight-card">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span class="highlight-title">Hak Pengguna</span>
          <span class="highlight-desc"
            >Akses, koreksi, dan hapus datamu kapan saja</span
          >
        </div>
      </div>

      <!-- Sections -->
      {#each sections as sec}
        <section id={sec.id} class="pp-section">
          <h2 class="section-title">{sec.title}</h2>

          {#if sec.content}
            <!-- Grouped items (section 1) -->
            {#each sec.content as group}
              <div class="item-group">
                <p class="group-subtitle">{group.subtitle}</p>
                <ul class="section-list" role="list">
                  {#each group.items as item}
                    <li class="section-item">
                      <span class="bullet" aria-hidden="true"></span>
                      <p>{item}</p>
                    </li>
                  {/each}
                </ul>
              </div>
            {/each}
          {:else}
            <!-- Flat list -->
            <ul class="section-list" role="list">
              {#each sec.items as item}
                <li class="section-item">
                  <span class="bullet" aria-hidden="true"></span>
                  <p>{item}</p>
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/each}

      <!-- Footer CTA -->
      <div class="pp-cta">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"
          />
        </svg>
        <div>
          <p class="cta-title">Ada pertanyaan tentang privasi?</p>
          <p class="cta-desc">
            Tim kami siap membantu menjawab pertanyaan seputar perlindungan data
            pribadimu.
          </p>
        </div>
        <a href="mailto:{siteConfig?.supportEmail ?? ''}" class="btn-contact"
          >Hubungi Kami</a
        >
      </div>
    </main>
  </div>
</div>
