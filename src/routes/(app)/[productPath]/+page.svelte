<script>
  import HeroProductDetail from "$lib/components/sections/HeroProductDetail.svelte";
  import TopupForm from "$lib/components/sections/topup-components/TopupForm.svelte";

  const { data } = $props();
  // console.log(data);
</script>

<HeroProductDetail productDetail={data.productDetail} />
<TopupForm products={data.products} productDetail={data.productDetail} />
