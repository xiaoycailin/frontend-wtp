export interface Product {
  id: any;
  productFlashId?: any;
  label: string;
  sublabel?: string;
  price: number;
  originalPrice?: number;
  icon: string;
  stock?: number;
  maxStock?: number;
  tag?: string;
  instant?: boolean;
}

export interface PaymentMethod {
  id: any;
  name: string;
  logo?: string;
  tag?: "BEST PRICE" | "PROMO";
  note?: string;
  autoCheck?: boolean;
  surcharge?: number;
  requiredLogin?: boolean;
}

export interface PromoApplied {
  id?: number;
  code: string;
  title?: string;
  desc: string;
  discount: number;
  discType?: "flat" | "percent";
  valid?: boolean;
  reason?: string | null;
  previewDiscount?: number;
  minTrx?: number | null;
  maxDiscount?: number | null;
}

export interface AvailablePromo {
  id: number;
  code: string;
  title: string;
  discType: "flat" | "percent";
  value: number;
  minTrx?: number | null;
  maxDiscount?: number | null;
  valid: boolean;
  reason?: string | null;
  allowFlashSale: boolean;
  previewDiscount: number;
  remainingUse: number;
  expiredDate?: string | null;
}

export interface SupportedGameConfig {
  code: string;
  label: string;
  requiresZone: boolean;
  autoZone: boolean;
  servers?: string[];
}

export type ZoneInputMode = "none" | "text" | "select";

export type TabKey = "flash" | "special" | "diamond";
