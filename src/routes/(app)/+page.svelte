<script lang="ts">
  // import ParticleCanvas from "$lib/components/ParticleCanvas.svelte";
  import Banners from "$lib/components/sections/Banners.svelte";
  import Productlist from "$lib/components/sections/Productlist.svelte";
  import { getContext } from "svelte";
  import type { SiteConfig } from "../../app.js";
  const search: any = getContext("sch_query");

  let { data } = $props();
  const siteConfig: SiteConfig = data.siteConfig;
</script>

<svelte:head>
  <title>{siteConfig?.siteName} - {siteConfig?.tagline}</title>
</svelte:head>

<Banners banners={data.banners ?? []} />

<!-- <ParticleCanvas /> -->
<Productlist {data} searchQuery={search.value} />
