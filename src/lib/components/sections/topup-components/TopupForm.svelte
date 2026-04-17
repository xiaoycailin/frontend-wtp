<script lang="ts">
  import type {
    Product,
    PromoApplied,
    SupportedGameConfig,
    ZoneInputMode,
  } from "./types";

  import Step1Account from "./Step1Account.svelte";
  import Step2Nominal from "./Step2Nominal.svelte";
  import Step3Quantity from "./Step3Quantity.svelte";
  import Step4Promo from "./Step4Promo.svelte";
  import Step5Payment from "./Step5Payment.svelte";
  import Step6Contact from "./Step6Contact.svelte";
  import OrderSidebar from "./OrderSidebar.svelte";
  import { onMount } from "svelte";
  import { auth } from "$lib/auth";
  import Step1AccountCustom from "./Step1AccountCustom.svelte";

  let { products, productDetail, productPath, siteConfig, user, token } =
    $props();

  let userId = $state("");
  let serverId = $state("");
  let userCustomInput = $state({});

  let selected = $state<Product | null>(null);
  let quantity = $state(1);
  let promoApplied = $state<PromoApplied | null>(null);
  let selectedPay: any = $state({});
  let phone = $state("");
  let email = $state("");

  onMount(() => {
    auth.init();
    email = user?.email ?? auth.user?.email ?? "";
  });

  let supportedGames = $state<SupportedGameConfig[]>([]);
  let gameConfig = $state<SupportedGameConfig | null>(null);
  let gameConfigLoading = $state(false);
  let inputTypes = $state<any[]>([]);
  let customGameConfig = $state<SupportedGameConfig | null>(null);

  const zoneInputMode = $derived<ZoneInputMode>(
    !gameConfig?.requiresZone
      ? "none"
      : gameConfig.servers?.length
        ? "select"
        : "text",
  );

  const basePrice = $derived(selected?.price ?? 0);

  const discountAmount = $derived(promoApplied?.previewDiscount ?? 0);

  const totalPrice = $derived(
    Math.max(basePrice - discountAmount, 0) * quantity,
  );

  const requiresServerInput = $derived(zoneInputMode !== "none");

  const canOrder = $derived(
    !!userId.trim() &&
      (!!selected || false) &&
      !!selectedPay &&
      !!email.trim() &&
      (!requiresServerInput || !!serverId.trim()),
  );

  async function fetchInputConfig() {
    gameConfigLoading = true;
    try {
      // Fallback to games/supported
      const res = await fetch("/api/v1/games/supported");
      const json = await res.json();
      if (!res.ok) {
        supportedGames = [];
        gameConfig = null;
        return;
      }
      supportedGames = json?.data ?? [];
      gameConfig =
        supportedGames.find((item) => item.code === productPath) ?? null;
    } catch (error) {
      console.error("Failed to load input config", error);
      supportedGames = [];
      gameConfig = null;
      inputTypes = [];
      customGameConfig = null;
    } finally {
      gameConfigLoading = false;
    }
  }

  // console.log(productDetail);

  $effect(() => {
    fetchInputConfig();
  });

  // $effect(() => {
  //   setInterval(() => {
  //     console.log("DATA => ", userCustomInput);
  //   }, 1000);
  // });

  $effect(() => {
    if (zoneInputMode === "none") {
      serverId = "";
    } else if (
      zoneInputMode === "select" &&
      serverId &&
      !(gameConfig?.servers ?? []).includes(serverId)
    ) {
      serverId = "";
    }
  });
</script>

<svelte:head>
  <title>{productDetail?.title} - {productDetail.description}</title>
</svelte:head>

<section
  class="w-full mt-6 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start"
>
  <div class="flex flex-col gap-4">
    {#if productDetail?.inputs && productDetail?.inputs?.length > 0}
      <Step1AccountCustom bind:userCustomInput inputs={productDetail.inputs} />
    {:else}
      <Step1Account bind:userId bind:serverId {gameConfig} {zoneInputMode} />
    {/if}

    <Step2Nominal {products} bind:selected />

    <Step3Quantity bind:quantity {selected} {basePrice} />

    <Step4Promo bind:promoApplied {selected} {quantity} />

    <Step5Payment
      bind:selectedPay
      {basePrice}
      {selected}
      {token}
      {user}
      {promoApplied}
    />

    <Step6Contact bind:phone bind:email />
  </div>

  <div class="flex flex-col gap-4 xl:sticky xl:top-[115px]">
    <OrderSidebar
      bind:selected
      {siteConfig}
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
      {gameConfig}
      {zoneInputMode}
      {gameConfigLoading}
      {userCustomInput}
      inputs={productDetail.inputs}
    />
  </div>
</section>
