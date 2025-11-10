export interface CatalogProductOfferWithDetailResponse {
  catalogProductOfferId: number;
  catalogId: number;

  productOfferId: string;
  productOfferName: string;
  productOfferDescription?: string;
  discountRate?: number; // 0..1
  status?: string;
  startDate?: string;
  endDate?: string;

  productId?: string;
  productName?: string;
  productPrice?: number;
}