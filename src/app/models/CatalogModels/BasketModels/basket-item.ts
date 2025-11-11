export interface BasketItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  discount: number;        // 0..1
  quantity: number;
  discountedPrice: number; // BE getter’ı ile gelir (unit price after discount)
  productOfferId?: string | null;
  campaignProductId?: number | null;
  name:string,
  price: number,
  description?:string
  isCampaign?:boolean,
  isHeader?:boolean
}