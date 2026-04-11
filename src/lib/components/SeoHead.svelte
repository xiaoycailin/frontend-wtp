<!-- src/lib/components/SeoHead.svelte -->
<script lang="ts">
  import type { Props } from "../../app";

  let {
    siteConfig,
    pageTitle,
    pageDescription,
    pageImage,
    pageUrl,
    pageType,
    noIndex = false,
  }: Props = $props();

  // console.log(siteConfig);

  // â”€â”€ Resolvers (page override > siteConfig > fallback) â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const siteName = siteConfig?.siteName ?? "WTPANJAY";
  const siteUrl = siteConfig?.siteUrl ?? "";
  const faviconUrl = siteConfig?.faviconUrl ?? "/favicon.ico";

  const title = pageTitle
    ? `${pageTitle} â€” ${siteName}`
    : (siteConfig?.metaTitle ?? siteName);

  const description =
    pageDescription ?? siteConfig?.metaDescription ?? siteConfig?.tagline ?? "";

  const canonical = pageUrl
    ? pageUrl.startsWith("http")
      ? pageUrl
      : `${siteUrl}${pageUrl}`
    : (siteConfig?.canonicalUrl ?? siteUrl);

  const robots = noIndex
    ? "noindex, nofollow"
    : (siteConfig?.metaRobots ?? "index, follow");

  // OG
  const ogTitle = pageTitle ?? siteConfig?.ogTitle ?? title;
  const ogDescription =
    pageDescription ?? siteConfig?.ogDescription ?? description;
  const ogImage = pageImage ?? siteConfig?.ogImage ?? "";
  const ogImageAlt = siteConfig?.ogImageAlt ?? `${siteName} preview`;
  const ogType = pageType ?? siteConfig?.ogType ?? "website";
  const ogLocale = siteConfig?.ogLocale ?? "id_ID";

  // Twitter
  const twCard = siteConfig?.twitterCard ?? "summary_large_image";
  const twSite = siteConfig?.twitterSite ?? "";
  const twCreator = siteConfig?.twitterCreator ?? twSite;
  const twTitle = pageTitle ?? siteConfig?.twitterTitle ?? title;
  const twDescription =
    pageDescription ?? siteConfig?.twitterDescription ?? description;
  const twImage = pageImage ?? siteConfig?.twitterImage ?? ogImage;

  // Schema.org JSON-LD
  function buildSchemaOrg(): string {
    // Kalau ada custom JSON dari DB, pakai itu
    if (siteConfig?.schemaOrgJson) return siteConfig.schemaOrgJson;

    const type = siteConfig?.schemaOrgType ?? "Organization";

    const base: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": type,
      name: siteName,
      url: siteUrl,
      description: description,
    };

    if (siteConfig?.logoUrl) {
      base["logo"] = {
        "@type": "ImageObject",
        url: siteConfig.logoUrl,
      };
    }

    if (siteConfig?.contactEmail) {
      base["contactPoint"] = {
        "@type": "ContactPoint",
        email: siteConfig.contactEmail,
        contactType: "customer support",
        availableLanguage: "Indonesian",
      };
    }

    if (siteConfig?.supportWhatsapp) {
      base["telephone"] = siteConfig.supportWhatsapp;
    }

    const sameAs: string[] = [];
    if (siteConfig?.facebookUrl) sameAs.push(siteConfig.facebookUrl);
    if (siteConfig?.instagramUrl) sameAs.push(siteConfig.instagramUrl);
    if (siteConfig?.twitterUrl) sameAs.push(siteConfig.twitterUrl);
    if (sameAs.length) base["sameAs"] = sameAs;

    return JSON.stringify(base, null, 2);
  }

  const schemaOrgJson = buildSchemaOrg();

  // GTM noscript snippet
  const gtmId = siteConfig?.googleAnalyticsId;
  const gtmContainerId = siteConfig?.googleTagManagerId;
</script>

<svelte:head>
  <!-- â”€â”€ Basic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  <title>{title}</title>
  <meta name="description" content={description} />
  {#if siteConfig?.metaKeywords}
    <meta name="keywords" content={siteConfig.metaKeywords} />
  {/if}
  <meta name="robots" content={robots} />
  <link rel="canonical" href={canonical} />

  <!-- Favicon -->
  <link rel="icon" href={faviconUrl} />
  <link rel="shortcut icon" href={faviconUrl} />
  <link rel="apple-touch-icon" href={faviconUrl} />

  <!-- â”€â”€ Open Graph â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  <meta property="og:site_name" content={siteName} />
  <meta property="og:type" content={ogType} />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:locale" content={ogLocale} />
  {#if ogImage}
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:alt" content={ogImageAlt} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  {/if}
  {#if siteConfig?.fbAppId}
    <meta property="fb:app_id" content={siteConfig.fbAppId} />
  {/if}

  <!-- â”€â”€ Twitter / X Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  <meta name="twitter:card" content={twCard} />
  <meta name="twitter:title" content={twTitle} />
  <meta name="twitter:description" content={twDescription} />
  {#if twSite}
    <meta name="twitter:site" content={twSite} />
  {/if}
  {#if twCreator}
    <meta name="twitter:creator" content={twCreator} />
  {/if}
  {#if twImage}
    <meta name="twitter:image" content={twImage} />
    <meta name="twitter:image:alt" content={ogImageAlt} />
  {/if}

  <!-- â”€â”€ Search Engine Verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  {#if siteConfig?.googleSiteVerification}
    <meta
      name="google-site-verification"
      content={siteConfig.googleSiteVerification}
    />
  {/if}
  {#if siteConfig?.bingSiteVerification}
    <meta name="msvalidate.01" content={siteConfig.bingSiteVerification} />
  {/if}

  <!-- â”€â”€ Mobile & Theme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  <meta name="theme-color" content="var(--color-primary)" />
  <meta name="application-name" content={siteName} />
  <meta name="apple-mobile-web-app-title" content={siteName} />
  <meta name="format-detection" content="telephone=no" />

  <!-- â”€â”€ Google Analytics (GA4) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  {#if gtmId}
    <!-- svelte-ignore -->
    {@html `<script async src="https://www.googletagmanager.com/gtag/js?id=${gtmId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gtmId}');
    </script>`}
  {/if}

  <!-- â”€â”€ Google Tag Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  {#if gtmContainerId}
    <!-- svelte-ignore -->
    {@html `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmContainerId}');</script>`}
  {/if}

  <!-- â”€â”€ Facebook Pixel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  {#if siteConfig?.facebookPixelId}
    <!-- svelte-ignore -->
    {@html `<script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${siteConfig.facebookPixelId}');
    fbq('track', 'PageView');
    </script>`}
  {/if}

  <!-- â”€â”€ TikTok Pixel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  {#if siteConfig?.tiktokPixelId}
    <!-- svelte-ignore -->
    {@html `<script>
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track",
      "identify","instances","debug","on","off","once","ready","alias","group","enableCookie",
      "disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,
      ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");
      o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${siteConfig.tiktokPixelId}');ttq.page();
    }(window, document, 'ttq');
    </script>`}
  {/if}

  <!-- â”€â”€ Schema.org JSON-LD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  <!-- svelte-ignore -->
  {@html `<script type="application/ld+json">${schemaOrgJson}</script>`}
</svelte:head>

