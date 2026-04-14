<script lang="ts">
  import type { SiteConfig } from "../../../app.js";
  import "./tos.css";

  const lastUpdated = "1 April 2026";

  const { data } = $props();
  const siteConfig: SiteConfig = data.siteConfig;
  // console.log(siteConfig);

  const sections = [
    {
      id: "umum",
      title: "1. Ketentuan Umum",
      content: [
        `Dengan mengakses dan menggunakan layanan ${siteConfig?.siteName ?? "Topupin Store"} ("Platform"), kamu dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku di bawah ini.`,
        `${siteConfig?.siteName ?? "Topupin Store"} adalah platform top-up game online yang menyediakan layanan pembelian diamond, kredit, voucher, dan item dalam game untuk berbagai judul game populer.`,
        "Syarat dan ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan akan diberitahukan melalui notifikasi di Platform atau email terdaftar, dan berlaku efektif sejak tanggal pembaruan dipublikasikan.",
        "Jika kamu tidak menyetujui perubahan tersebut, kamu dapat menghentikan penggunaan layanan kami.",
      ],
    },
    {
      id: "akun",
      title: "2. Pendaftaran & Akun",
      content: [
        `Untuk menggunakan layanan ${siteConfig?.siteName ?? "Topupin Store"}, kamu wajib mendaftarkan diri dengan menggunakan alamat email yang valid dan aktif.`,
        "Kamu bertanggung jawab penuh atas kerahasiaan akun dan password milikmu. Segala aktivitas yang terjadi melalui akunmu adalah tanggung jawabmu sepenuhnya.",
        "Satu pengguna hanya diperbolehkan memiliki satu akun aktif. Pembuatan akun ganda dapat mengakibatkan penangguhan atau penghapusan akun.",
        `${siteConfig?.siteName ?? "Topupin Store"} berhak menangguhkan atau menghapus akun yang terindikasi melakukan kecurangan, penyalahgunaan, atau pelanggaran ketentuan ini.`,
        "Kamu wajib segera melaporkan kepada kami jika mengetahui adanya akses tidak sah ke akunmu melalui layanan pelanggan.",
      ],
    },
    {
      id: "layanan",
      title: "3. Layanan Top-Up",
      content: [
        `${siteConfig?.siteName ?? "Topupin Store"} menyediakan layanan top-up untuk berbagai game seperti Mobile Legends: Bang Bang, Free Fire, PUBG Mobile, Genshin Impact, Honkai: Star Rail, dan game populer lainnya.`,
        "Semua item yang dibeli melalui Platform (diamond, kredit, voucher, UC, dll.) akan dikirimkan langsung ke akun game yang kamu daftarkan. Pastikan ID game dan server yang kamu masukkan sudah benar sebelum melakukan pembayaran.",
        `${siteConfig?.siteName ?? "Topupin Store"} tidak bertanggung jawab atas kerugian akibat kesalahan penginputan ID game atau server yang dilakukan oleh pengguna.`,
        `Waktu pengiriman item bergantung pada provider game masing-masing, namun ${siteConfig?.siteName ?? "Topupin Store"} berupaya memproses setiap transaksi dalam waktu 1Ã—24 jam.`,
        "Harga yang tertera pada Platform sudah termasuk biaya layanan dan dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu.",
      ],
    },
    {
      id: "pembayaran",
      title: "4. Pembayaran",
      content: [
        `${siteConfig?.siteName ?? "Topupin Store"} menerima berbagai metode pembayaran termasuk transfer bank, dompet digital (GoPay, OVO, DANA, ShopeePay), dan QRIS.`,
        `Seluruh transaksi pembayaran diproses melalui sistem pembayaran yang aman dan terenkripsi. ${siteConfig?.siteName ?? "Topupin Store"} tidak menyimpan informasi kartu kredit atau debit pengguna.`,
        "Transaksi yang telah berhasil diproses dan item telah dikirimkan ke akun game tidak dapat dibatalkan.",
        "Jika pembayaran berhasil namun item belum diterima dalam waktu 1Ã—24 jam, pengguna dapat mengajukan klaim melalui halaman Riwayat Transaksi atau menghubungi layanan pelanggan kami.",
        `${siteConfig?.siteName ?? "Topupin Store"} berhak membatalkan transaksi yang dicurigai sebagai tindakan penipuan atau penyalahgunaan metode pembayaran.`,
      ],
    },
    {
      id: "refund",
      title: "5. Kebijakan Pengembalian Dana",
      content: [
        "Pengembalian dana (refund) hanya dapat diproses apabila item yang dibeli belum terkirim ke akun game dalam waktu 1Ã—24 jam setelah pembayaran berhasil dikonfirmasi.",
        "Permintaan refund tidak akan diproses jika item telah berhasil dikirimkan ke akun game yang didaftarkan, terlepas dari alasan apapun.",
        "Untuk mengajukan refund, pengguna wajib menyertakan bukti pembayaran, ID transaksi, dan tangkapan layar yang menunjukkan item belum diterima.",
        "Proses verifikasi refund membutuhkan waktu 3â€“7 hari kerja. Dana akan dikembalikan melalui metode pembayaran yang sama dengan saat transaksi dilakukan.",
        `${siteConfig?.siteName ?? "Topupin Store"} berhak menolak permintaan refund yang tidak memenuhi persyaratan di atas atau yang terindikasi diajukan dengan itikad tidak baik.`,
      ],
    },
    {
      id: "kewajiban",
      title: "6. Kewajiban & Larangan Pengguna",
      content: [
        `Kamu wajib menggunakan layanan ${siteConfig?.siteName ?? "Topupin Store"} hanya untuk keperluan yang sah dan sesuai dengan ketentuan yang berlaku.`,
        `Dilarang menggunakan layanan ${siteConfig?.siteName ?? "Topupin Store"} untuk melakukan tindak penipuan, penggelapan, atau aktivitas ilegal lainnya.`,
        `Dilarang mencoba meretas, memanipulasi, atau mengganggu sistem dan infrastruktur ${siteConfig?.siteName ?? "Topupin Store"} dalam bentuk apapun.`,
        "Dilarang melakukan pembelian menggunakan metode pembayaran milik orang lain tanpa izin yang sah dari pemiliknya.",
        "Pelanggaran terhadap ketentuan ini dapat mengakibatkan penangguhan akun permanen, pembatalan transaksi, dan/atau tindakan hukum sesuai peraturan perundang-undangan yang berlaku.",
      ],
    },
    {
      id: "privasi",
      title: "7. Privasi & Data Pengguna",
      content: [
        `${siteConfig?.siteName ?? "Topupin Store"} mengumpulkan data pribadi seperti nama, alamat email, dan riwayat transaksi untuk keperluan operasional layanan.`,
        "Data pengguna tidak akan dijual, disewakan, atau dibagikan kepada pihak ketiga tanpa persetujuan pengguna, kecuali diwajibkan oleh hukum yang berlaku.",
        `${siteConfig?.siteName ?? "Topupin Store"} menggunakan teknologi enkripsi untuk melindungi data pengguna dari akses tidak sah.`,
        "Pengguna dapat mengajukan permintaan penghapusan data dengan menghubungi layanan pelanggan kami. Proses penghapusan membutuhkan waktu hingga 30 hari kerja.",
      ],
    },
    {
      id: "haki",
      title: "8. Hak Kekayaan Intelektual",
      content: [
        `Seluruh konten yang terdapat pada Platform ${siteConfig?.siteName ?? "Topupin Store"}, termasuk namun tidak terbatas pada logo, desain, teks, gambar, dan kode program, merupakan hak milik ${siteConfig?.siteName ?? "Topupin Store"} dan dilindungi oleh undang-undang hak cipta yang berlaku.`,
        `Nama game, logo, dan aset visual milik pihak ketiga yang ditampilkan di Platform digunakan hanya untuk keperluan identifikasi produk dan merupakan hak milik masing-masing pemegang merek.",
        "Pengguna dilarang menyalin, memodifikasi, atau mendistribusikan konten Platform tanpa izin tertulis dari ${siteConfig?.siteName ?? "Topupin Store"}.`,
      ],
    },
    {
      id: "batasan",
      title: "9. Batasan Tanggung Jawab",
      content: [
        `${siteConfig?.siteName ?? "Topupin Store"} tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami.`,
        `${siteConfig?.siteName ?? "Topupin Store"} tidak bertanggung jawab atas gangguan server game, perubahan kebijakan publisher game, atau penghapusan item oleh pihak developer game.`,
        `Tanggung jawab maksimal ${siteConfig?.siteName ?? "Topupin Store"} kepada pengguna dalam satu insiden tidak melebihi nilai transaksi yang bersangkutan.`,
        `Platform disediakan 'sebagaimana adanya'. ${siteConfig?.siteName ?? "Topupin Store"} tidak menjamin bahwa layanan akan berjalan tanpa gangguan atau bebas dari kesalahan sepenuhnya.`,
      ],
    },
    {
      id: "hukum",
      title: "10. Hukum yang Berlaku",
      content: [
        "Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia.",
        "Setiap sengketa yang timbul dari atau berkaitan dengan syarat dan ketentuan ini akan diselesaikan melalui musyawarah mufakat terlebih dahulu.",
        "Apabila penyelesaian secara musyawarah tidak tercapai dalam 30 hari, sengketa akan diselesaikan melalui Badan Arbitrase Nasional Indonesia (BANI) atau pengadilan yang berwenang.",
      ],
    },
    {
      id: "kontak",
      title: "11. Hubungi Kami",
      content: [
        `Jika kamu memiliki pertanyaan, keluhan, atau saran terkait syarat dan ketentuan ini maupun layanan kami, jangan ragu untuk menghubungi tim ${siteConfig?.siteName ?? "Topupin Store"}.`,
        `Email Dukungan: ${siteConfig.supportEmail ?? ""}`,
        "Jam Operasional: Senin - Minggu, 08.00 - 22.00 WIB",
        "Kami berkomitmen untuk merespons setiap pertanyaan dalam waktu 1x24 jam pada hari kerja.",
      ],
    },
  ];

  // Active section for TOC highlight
  let activeId = $state("umum");

  function scrollTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    activeId = id;
  }
</script>

<svelte:head>
  <title
    >Syarat &amp; Ketentuan - {siteConfig?.siteName ?? "Topupin Store"}</title
  >
  <meta
    name="description"
    content="Baca syarat dan ketentuan penggunaan layanan top-up game {siteConfig?.siteName ??
      'Topupin Store'}."
  />
</svelte:head>

<div class="tos-root">
  <!-- Background grid -->
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="glow glow-1" aria-hidden="true"></div>

  <!-- Header -->
  <header class="tos-header">
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
            fill="var(--color-primary)">TS</text
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
          <line x1="19" y1="12" x2="5" y2="12" /><polyline
            points="12 19 5 12 12 5"
          />
        </svg>
        Kembali
      </a>
    </div>
  </header>

  <div class="tos-layout">
    <!-- Sidebar TOC -->
    <aside class="tos-sidebar" aria-label="Daftar isi">
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
    <main class="tos-main">
      <!-- Hero -->
      <div class="tos-hero">
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Dokumen Resmi
        </div>
        <h1 class="tos-title">Syarat &amp; Ketentuan</h1>
        <p class="tos-subtitle">
          Harap baca seluruh ketentuan berikut dengan seksama sebelum
          menggunakan layanan {siteConfig?.siteName ?? "Topupin Store"}.
        </p>
        <p class="tos-updated">
          Terakhir diperbarui: <strong>{lastUpdated}</strong>
        </p>
      </div>

      <!-- Sections -->
      {#each sections as sec}
        <section id={sec.id} class="tos-section">
          <h2 class="section-title">{sec.title}</h2>
          <ul class="section-list" role="list">
            {#each sec.content as paragraph}
              <li class="section-item">
                <span class="bullet" aria-hidden="true"></span>
                <p>{paragraph}</p>
              </li>
            {/each}
          </ul>
        </section>
      {/each}

      <!-- Footer CTA -->
      <div class="tos-cta">
        <p>
          Dengan melanjutkan penggunaan layanan {siteConfig?.siteName ??
            "Topupin Store"}, kamu menyatakan telah membaca dan menyetujui
          seluruh syarat dan ketentuan di atas.
        </p>
        <a href="/" class="btn-home">Kembali ke Beranda</a>
      </div>
    </main>
  </div>
</div>
