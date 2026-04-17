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

  let { products, productDetail, productPath, siteConfig, user, token } =
    $props();

  let userId = $state("");
  let serverId = $state("");

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

  const totalPrice = $derived(Math.max(basePrice - discountAmount, 0) * quantity);

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
      // First try to fetch input types for this subcategory
      const subCategorySlug = productDetail?.subCategory?.slug;
      if (subCategorySlug) {
        const res = await fetch(`/api/v1/input-types/subcategory-slug/${subCategorySlug}`);
        if (res.ok) {
          const json = await res.json();
          inputTypes = json.data || [];
          if (inputTypes.length > 0) {
            // Transform input types to SupportedGameConfig
            // For now, take the first input as zone config
            const first = inputTypes[0];
            const servers = first.model === 'select' && first.options ? first.options.map((opt: any) => opt.value) : [];
            customGameConfig = {
              code: subCategorySlug,
              label: productDetail.subCategory?.title || subCategorySlug,
              requiresZone: true,
              autoZone: false,
              servers: servers.length > 0 ? servers : undefined,
            };
            gameConfig = customGameConfig;
            return; // Stop here, don't fetch games/supported
          }
        }
      }
      // Fallback to games/supported
      const res = await fetch("/api/v1/games/supported");
      const json = await res.json();
      if (!res.ok) {
        supportedGames = [];
        gameConfig = null;
        return;
      }
      supportedGames = json?.data ?? [];
      gameConfig = supportedGames.find((item) => item.code === productPath) ?? null;
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

  $effect(() => {
    fetchInputConfig();
  });

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
  // console.log(productDetail);
</script>

<svelte:head>
  <title>{productDetail?.title} - {productDetail.description}</title>
</svelte:head>

<section
  class="w-full mt-6 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start"
>
  <div class="flex flex-col gap-4">
    <Step1Account bind:userId bind:serverId {gameConfig} {zoneInputMode} />

    <Step2Nominal {products} bind:selected />

    <Step3Quantity bind:quantity {selected} {basePrice} />

    <Step4Promo bind:promoApplied {selected} {quantity} />

    <Step5Payment bind:selectedPay {basePrice} {selected} {token} {user} {promoApplied} />

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
    />
  </div>
</section>
