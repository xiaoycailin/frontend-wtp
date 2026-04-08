<script>
  // import ParticleCanvas from "$lib/components/ParticleCanvas.svelte";
  import Banners from "$lib/components/sections/Banners.svelte";
  import Productlist from "$lib/components/sections/Productlist.svelte";
  import { getContext } from "svelte";
  const search = getContext("sch_query");

  let { data } = $props();
</script>

<!-- <svelte:head>
  <title>Website Topup Terpercaya</title>
</svelte:head> -->

<Banners />

<!-- <ParticleCanvas /> -->
<Productlist {data} searchQuery={search.value} />
