import type { PaymentMethod } from "./types";

export const directMethods: PaymentMethod[] = [
  {
    id: "coinpedia",
    name: "Coinpedia",
    tag: "BEST PRICE",
    note: "Max. 0,00 COINPEDIA",
  },
];

export const availablePromos = [
  {
    code: "GAME10",
    label: "Diskon 10%",
    desc: "Potongan 10% maks Rp 15.000",
    discount: 0.1,
  },
  {
    code: "NEWUSER",
    label: "Pengguna Baru",
    desc: "Gratis biaya layanan",
    discount: 0.05,
  },
  {
    code: "FLASH5",
    label: "Flash 5%",
    desc: "Potongan 5% semua produk",
    discount: 0.05,
  },
];
