<script lang="ts">
  import {
    TrophyStar,
    Shield,
    Bolt,
    VrHeadset,
    Globe,
    Group,
  } from "@boxicons/svelte";

  const stats = [
    { value: "2Jt+", label: "Transaksi Berhasil" },
    { value: "500rb+", label: "Pengguna Aktif" },
    { value: "50+", label: "Game Tersedia" },
    { value: "99.9%", label: "Uptime Layanan" },
  ];

  const features = [
    {
      icon: Bolt,
      title: "Proses Instan",
      desc: "Item terkirim otomatis ke akun game kamu dalam hitungan detik tanpa perlu konfirmasi manual.",
      accent: true,
    },
    {
      icon: Shield,
      title: "100% Aman",
      desc: "Transaksi dilindungi enkripsi SSL/TLS. Data dan riwayat pembelianmu terjaga sepenuhnya.",
      accent: false,
    },
    {
      icon: Globe,
      title: "50+ Game Tersedia",
      desc: "Mobile Legends, Free Fire, PUBG Mobile, Genshin Impact, Honkai, dan banyak lagi.",
      accent: false,
    },
    {
      icon: TrophyStar,
      title: "Harga Kompetitif",
      desc: "Kami berkomitmen memberikan harga terbaik dengan promo dan flash sale rutin setiap minggu.",
      accent: false,
    },
    {
      icon: VrHeadset,
      title: "Support 24/7",
      desc: "Tim customer service kami siap membantu kamu setiap hari dari pukul 08.00 hingga 22.00 WIB.",
      accent: false,
    },
    {
      icon: Group,
      title: "Komunitas Aktif",
      desc: "Bergabung dengan jutaan gamer Indonesia dan ikuti kompetisi leaderboard top-up bulanan.",
      accent: false,
    },
  ];

  const storyParagraphs = [
    "WTPANJAY dimulai pada 2023 oleh sekelompok gamer yang lelah dengan proses top-up yang lambat, mahal, dan tidak transparan. Kami percaya bahwa mengisi saldo game seharusnya semudah memesan makanan online.",
    "Dalam waktu satu tahun, kami telah memproses lebih dari dua juta transaksi dan melayani ratusan ribu gamer dari Sabang sampai Merauke. Setiap transaksi diproses secara otomatis dalam hitungan detik tanpa perlu konfirmasi manual.",
    "Kami terus berinovasi dengan menghadirkan fitur-fitur baru seperti Leaderboard komunitas, Kalkulator konversi diamond, dan program loyalitas untuk pengguna setia.",
  ];

  const cardHighlights = [
    ["Fast", "< 5 detik"],
    ["Aman", "SSL/TLS"],
    ["Murah", "Harga terbaik"],
  ];
</script>

<svelte:head>
  <title>Tentang Kami â€” WTPANJAY</title>
  <meta
    name="description"
    content="Kenalan dengan WTPANJAY, platform top-up game terpercaya di Indonesia."
  />
</svelte:head>

<!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
<section style="position:relative; padding:5rem 0 7rem; overflow:hidden;">
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
      Platform Top-Up Game Terpercaya
    </div>

    <h1
      style="font-size:clamp(2rem,5vw,3rem); font-weight:900; color:#fff;
               letter-spacing:-0.02em; line-height:1.2; margin-bottom:1.25rem;"
    >
      Kami hadir untuk bikin<br />
      <span style="color:var(--color-primary);">gaming kamu lebih mudah</span>
    </h1>

    <p
      style="font-size:1rem; color:rgba(255,255,255,0.5); line-height:1.75; max-width:42rem; margin:0 auto;"
    >
      WTPANJAY adalah platform top-up game online yang memungkinkan jutaan gamer
      Indonesia mengisi diamond, kredit, dan voucher game favorit mereka dengan
      cepat, aman, dan terjangkau.
    </p>
  </div>
</section>

<!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• STATS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
<section
  style="border-top:1px solid rgba(255,255,255,0.07); border-bottom:1px solid rgba(255,255,255,0.07); padding:2.5rem 0;"
>
  <div
    style="display:grid; grid-template-columns:repeat(2,1fr); gap:1px;
              background:rgba(255,255,255,0.07); border-radius:1rem; overflow:hidden;"
  >
    {#each stats as stat}
      <div
        style="background:#111; display:flex; flex-direction:column;
                  align-items:center; justify-content:center;
                  padding:2rem 1rem; text-align:center;"
      >
        <span
          style="font-size:2.25rem; font-weight:900; color:var(--color-primary); line-height:1;"
          >{stat.value}</span
        >
        <span
          style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin-top:0.375rem; font-weight:500;"
          >{stat.label}</span
        >
      </div>
    {/each}
  </div>
</section>

<!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CERITA KAMI â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
<section style="padding:4rem 0;">
  <div
    style="display:grid; grid-template-columns:1fr; gap:2.5rem; align-items:center;"
  >
    <!-- Text -->
    <div>
      <p
        style="font-size:0.7rem; font-weight:700; color:var(--color-primary);
                text-transform:uppercase; letter-spacing:0.12em; margin-bottom:0.75rem;"
      >
        Cerita Kami
      </p>
      <h2
        style="font-size:clamp(1.5rem,3vw,2rem); font-weight:900; color:#fff;
                 line-height:1.3; margin-bottom:1.5rem;"
      >
        Lahir dari frustasi gamer,<br />dibangun untuk gamer
      </h2>
      <div style="display:flex; flex-direction:column; gap:1rem;">
        {#each storyParagraphs as para}
          <p
            style="font-size:0.875rem; color:rgba(255,255,255,0.5); line-height:1.8;"
          >
            {para}
          </p>
        {/each}
      </div>
    </div>

    <!-- Visual card stack -->
    <div style="position:relative; height:18rem;">
      <div
        style="position:absolute; inset:1rem 1.5rem 0; background:#1a1a1a;
                  border-radius:1rem; border:1px solid rgba(255,255,255,0.06);
                  transform:rotate(2deg);"
      ></div>
      <div
        style="position:absolute; inset:0.5rem 0.75rem 0; background:#1e1e1e;
                  border-radius:1rem; border:1px solid rgba(255,255,255,0.08);
                  transform:rotate(-1deg);"
      ></div>
      <div
        style="position:absolute; inset:0; background:#161616;
                  border-radius:1rem; border:1px solid rgba(245,197,24,0.18);
                  display:flex; flex-direction:column; align-items:center;
                  justify-content:center; gap:1rem; padding:1.5rem;"
      >
        <div
          style="width:4rem; height:4rem; border-radius:0.875rem; background:var(--color-primary);
                    display:flex; align-items:center; justify-content:center;
                    box-shadow:0 10px 30px rgba(245,197,24,0.30);"
        >
          <svg
            viewBox="0 0 24 24"
            style="width:2rem;height:2rem;fill:#000;"
            aria-hidden="true"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div style="text-align:center;">
          <p style="font-size:1.25rem; font-weight:900; color:var(--color-primary);">
            WTPANJAY
          </p>
          <p
            style="font-size:0.7rem; color:rgba(255,255,255,0.35); margin-top:0.25rem;"
          >
            Est. 2023 Â· Indonesia
          </p>
        </div>
        <div
          style="width:100%; border-top:1px solid rgba(255,255,255,0.07);
                    padding-top:1rem; display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; text-align:center;"
        >
          {#each cardHighlights as [k, v]}
            <div>
              <p style="font-size:0.625rem; color:var(--color-primary); font-weight:700;">
                {k}
              </p>
              <p
                style="font-size:0.625rem; color:rgba(255,255,255,0.3); margin-top:0.2rem;"
              >
                {v}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• NILAI-NILAI â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
<section style="padding:4rem 0;">
  <div style="text-align:center; margin-bottom:3rem;">
    <p
      style="font-size:0.7rem; font-weight:700; color:var(--color-primary);
              text-transform:uppercase; letter-spacing:0.12em; margin-bottom:0.5rem;"
    >
      Nilai Kami
    </p>
    <h2 style="font-size:clamp(1.5rem,3vw,2rem); font-weight:900; color:#fff;">
      Kenapa pilih WTPANJAY?
    </h2>
  </div>

  <div
    style="display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1rem;"
  >
    {#each features as item}
      <div
        style="padding:1.25rem; border-radius:1rem; transition:all 200ms ease;
                  {item.accent
          ? 'background:rgba(245,197,24,0.09); border:1px solid rgba(245,197,24,0.28);'
          : 'background:#161616; border:1px solid rgba(255,255,255,0.08);'}"
      >
        <div
          style="width:2.5rem; height:2.5rem; border-radius:0.625rem;
                    display:flex; align-items:center; justify-content:center; margin-bottom:1rem;
                    {item.accent
            ? 'background:var(--color-primary); color:#000;'
            : 'background:rgba(255,255,255,0.07); color:var(--color-primary);'}"
        >
          <svelte:component this={item.icon} size="sm" />
        </div>
        <h3
          style="font-size:0.875rem; font-weight:700; color:#fff; margin-bottom:0.5rem;"
        >
          {item.title}
        </h3>
        <p
          style="font-size:0.75rem; color:rgba(255,255,255,0.45); line-height:1.7;"
        >
          {item.desc}
        </p>
      </div>
    {/each}
  </div>
</section>

<!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MISI & VISI â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
<section style="padding:4rem 0;">
  <div style="display:grid; grid-template-columns:1fr; gap:1rem;">
    <!-- Misi -->
    <div
      style="padding:1.75rem; border-radius:1rem;
                background:#161616; border:1px solid rgba(255,255,255,0.09);"
    >
      <div
        style="width:2.5rem; height:2.5rem; border-radius:0.625rem; margin-bottom:1.25rem;
                  background:rgba(245,197,24,0.10); border:1px solid rgba(245,197,24,0.22);
                  display:flex; align-items:center; justify-content:center; color:var(--color-primary);"
      >
        <svg
          style="width:1.25rem;height:1.25rem;"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" /><polyline
            points="12 6 12 12 16 14"
          />
        </svg>
      </div>
      <h3
        style="font-size:1.125rem; font-weight:900; color:#fff; margin-bottom:0.75rem;"
      >
        Misi
      </h3>
      <p
        style="font-size:0.875rem; color:rgba(255,255,255,0.5); line-height:1.8;"
      >
        Menyediakan layanan top-up game yang cepat, terjangkau, dan terpercaya
        bagi seluruh gamer Indonesia, sehingga mereka bisa fokus menikmati
        permainan tanpa hambatan.
      </p>
    </div>

    <!-- Visi -->
    <div
      style="padding:1.75rem; border-radius:1rem;
                background:rgba(245,197,24,0.06); border:1px solid rgba(245,197,24,0.22);"
    >
      <div
        style="width:2.5rem; height:2.5rem; border-radius:0.625rem; margin-bottom:1.25rem;
                  background:var(--color-primary); display:flex; align-items:center; justify-content:center;
                  box-shadow:0 8px 20px rgba(245,197,24,0.25);"
      >
        <svg
          style="width:1.25rem;height:1.25rem;color:#000;"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
            cx="12"
            cy="12"
            r="3"
          />
        </svg>
      </div>
      <h3
        style="font-size:1.125rem; font-weight:900; color:#fff; margin-bottom:0.75rem;"
      >
        Visi
      </h3>
      <p
        style="font-size:0.875rem; color:rgba(255,255,255,0.5); line-height:1.8;"
      >
        Menjadi platform top-up game nomor satu di Asia Tenggara yang
        menghubungkan gamer dengan ekosistem gaming secara menyeluruh â€” dari
        top-up hingga komunitas.
      </p>
    </div>
  </div>
</section>

<!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
<section style="padding:4rem 0 2rem;">
  <div
    style="position:relative; overflow:hidden; border-radius:1.25rem; padding:3rem 2rem;
              text-align:center; background:rgba(245,197,24,0.06);
              border:1px solid rgba(245,197,24,0.22);"
  >
    <div
      style="position:absolute; inset:0; display:flex; align-items:center;
                justify-content:center; pointer-events:none;"
      aria-hidden="true"
    >
      <div
        style="width:16rem; height:16rem; border-radius:50%;
                  background:rgba(245,197,24,0.09); filter:blur(60px);"
      ></div>
    </div>

    <div style="position:relative; z-index:1;">
      <h2
        style="font-size:clamp(1.5rem,3vw,2rem); font-weight:900; color:#fff; margin-bottom:0.75rem;"
      >
        Siap mulai top-up sekarang?
      </h2>
      <p
        style="font-size:0.875rem; color:rgba(255,255,255,0.5); margin-bottom:1.75rem;
                max-width:32rem; margin-left:auto; margin-right:auto; line-height:1.7;"
      >
        Bergabung dengan jutaan gamer yang sudah mempercayakan top-up mereka ke
        WTPANJAY. Daftar gratis dan nikmati promo pertama kamu.
      </p>
      <div
        style="display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:0.75rem;"
      >
        <a
          href="/daftar"
          style="display:inline-flex; align-items:center; padding:0.65rem 1.5rem;
                  border-radius:0.625rem; background:var(--color-primary); color:#000;
                  font-size:0.875rem; font-weight:700; text-decoration:none;
                  box-shadow:0 8px 20px rgba(245,197,24,0.28);
                  transition:transform 150ms ease, background 150ms ease;"
          onmouseenter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#ffd740")}
          onmouseleave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "var(--color-primary)")}
        >
          Daftar Gratis
        </a>
        <a
          href="/"
          style="display:inline-flex; align-items:center; padding:0.65rem 1.5rem;
                  border-radius:0.625rem; color:rgba(255,255,255,0.75);
                  font-size:0.875rem; font-weight:600; text-decoration:none;
                  background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
                  transition:background 150ms ease;"
          onmouseenter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.12)")}
          onmouseleave={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.07)")}
        >
          Lihat Game
        </a>
      </div>
    </div>
  </div>
</section>

