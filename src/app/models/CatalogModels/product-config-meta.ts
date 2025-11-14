import { ProductConfigCharacteristic } from './product-config-characteristic';

export interface ProductConfigMeta {
  productOfferId: string;
  productOfferName: string;

  // BACKEND: "characteristics"
  characteristics: ProductConfigCharacteristic[];
}
