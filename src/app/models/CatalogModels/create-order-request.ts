import { ProductConfigurationDTO } from "./product-configuration-dto";

export interface CreateOrderRequest {
  billingAccountId: number;
  addressId: number;
  configurations: ProductConfigurationDTO[];
}