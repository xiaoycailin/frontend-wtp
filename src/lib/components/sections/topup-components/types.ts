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
  id: string;
  name: string;
  logo?: string;
  tag?: "BEST PRICE" | "PROMO";
  note?: string;
  autoCheck?: boolean;
  surcharge?: number;
}

export interface PromoApplied {
  code: string;
  desc: string;
  discount: number;
}

export type TabKey = "flash" | "special" | "diamond";
