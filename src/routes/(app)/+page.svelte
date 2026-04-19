<script lang="ts">
  // import ParticleCanvas from "$lib/components/ParticleCanvas.svelte";
  import Banners from "$lib/components/sections/Banners.svelte";
  import Productlist from "$lib/components/sections/Productlist.svelte";
  import { getContext, onMount } from "svelte";
  import type { SiteConfig } from "../../app.js";
  import { isPWA } from "$lib/utils.js";
  import { goto } from "$app/navigation";
  import WalletCard from "$lib/components/WalletCard.svelte";
  import BottomNavigation from "$lib/components/BottomNavigation.svelte";
  const search: any = getContext("sch_query");

  let { data } = $props();
  const userBalances: any[] = data?.user?.userBalances ?? [];
  const siteConfig: SiteConfig = data.siteConfig;

  let tGems = $state(0);
  let tPoints = $state(0);

  onMount(() => {
    if (isPWA()) {
      goto("/app");
    }

    tGems = userBalances?.find((s) => s.type == "WALLET")?.amount ?? 0;
    tPoints = userBalances?.find((s) => s.type == "POINTS")?.amount ?? 0;
  });
</script>

<svelte:head>
  <title>{siteConfig?.siteName} - {siteConfig?.tagline}</title>
</svelte:head>

{#if isPWA()}
  <WalletCard
    username={data?.user?.displayName}
    points={Number(tPoints)}
    gems={Number(tGems)}
  />
{/if}
<Banners banners={data.banners ?? []} />

<!-- <ParticleCanvas /> -->
<Productlist {data} searchQuery={search.value} />
<BottomNavigation />
