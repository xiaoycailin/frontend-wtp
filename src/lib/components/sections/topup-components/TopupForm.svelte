<script lang="ts">
  import type { Product, PromoApplied } from "./types";
  // import { getVaSurcharge } from "./paymentConstants";

  import Step1Account from "./Step1Account.svelte";
  import Step2Nominal from "./Step2Nominal.svelte";
  import Step3Quantity from "./Step3Quantity.svelte";
  import Step4Promo from "./Step4Promo.svelte";
  import Step5Payment from "./Step5Payment.svelte";
  import Step6Contact from "./Step6Contact.svelte";
  import OrderSidebar from "./OrderSidebar.svelte";

  let { products, productDetail } = $props();

  // ── Step 1 ─────────────────────────────────────────────────────
  let userId = $state("");
  let serverId = $state("");

  // ── Step 2 ─────────────────────────────────────────────────────
  let selected = $state<Product | null>(null);

  // ── Step 3 ─────────────────────────────────────────────────────
  let quantity = $state(1);

  // ── Step 4 ─────────────────────────────────────────────────────
  let promoApplied = $state<PromoApplied | null>(null);

  // ── Step 5 ─────────────────────────────────────────────────────
  let selectedPay: any = $state({});

  // ── Step 6 ─────────────────────────────────────────────────────
  let phone = $state("");
  let email = $state("");

  // ── Derived values ─────────────────────────────────────────────
  const basePrice = $derived(selected?.price ?? 0);

  const discountAmount = $derived(
    promoApplied
      ? Math.min(Math.round(basePrice * promoApplied.discount), 15_000)
      : 0,
  );

  const totalPrice = $derived((basePrice - discountAmount) * quantity);

  const canOrder = $derived(
    !!userId.trim() && !!selected && !!selectedPay && !!email.trim(),
  );
</script>

<svelte:head>
  <title>{productDetail?.title} - {productDetail.description}</title>
</svelte:head>

<section
  class="w-full mt-6 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start"
>
  <!-- LEFT — Steps 1–6 -->
  <div class="flex flex-col gap-4">
    <Step1Account bind:userId bind:serverId />

    <Step2Nominal {products} bind:selected />

    <Step3Quantity bind:quantity {selected} {basePrice} />

    <Step4Promo bind:promoApplied />

    <Step5Payment bind:selectedPay {basePrice} {selected} />

    <Step6Contact bind:phone bind:email />
  </div>

  <!-- RIGHT — Sticky sidebar -->
  <div class="flex flex-col gap-4 xl:sticky xl:top-[115px]">
    <OrderSidebar
      bind:selected
      {canOrder}
      {basePrice}
      {discountAmount}
      {totalPrice}
      {quantity}
      {promoApplied}
      {userId}
      {serverId}
      {selectedPay}
      {phone}
      {email}
    />
  </div>
</section>
