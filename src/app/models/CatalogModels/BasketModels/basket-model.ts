import { BasketItem } from "./basket-item";

export interface Basket {
  id: string;
  billingAccId: number;
  totalPrice: number;
  campaignId?: number | null;
  campaignName?: string | null;
  basketItems: BasketItem[];
}