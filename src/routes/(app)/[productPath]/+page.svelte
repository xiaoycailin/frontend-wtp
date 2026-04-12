<script>
  import HeroProductDetail from "$lib/components/sections/HeroProductDetail.svelte";
  import TopupForm from "$lib/components/sections/topup-components/TopupForm.svelte";

  const { data } = $props();
</script>

<HeroProductDetail productDetail={data.productDetail} />
<TopupForm
  products={data.products}
  productDetail={data.productDetail}
  productPath={data.productPath}
/>
