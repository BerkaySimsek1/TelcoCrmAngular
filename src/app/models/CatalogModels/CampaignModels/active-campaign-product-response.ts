export interface ActiveCampaignProductResponse {
  campaignProductId: number; // join id
  campaignId: number;
  campaignName: string;
  productId: string;         // DİKKAT: backend'de ProductOffer ID burada
  discountRate: number;      // 0..1 normalize edilmiş
}