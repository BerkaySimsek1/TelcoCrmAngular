export interface ProductConfiguration {
  key: string;
  value: string;
}

export interface OrderProductDetailResponse {
  id: string;
  productOfferId: string;
  productOfferName: string;
  status: string;
  billingAccountId: number;
  addressId: number;
  configuration: ProductConfiguration[];
}