import { ConfigurationPair } from "./configuration-pair";

export interface ProductConfigurationDTO {
  productOfferId: string;              // Hangi ürüne ait
  configuration: ConfigurationPair[];  // Key-value listesi
}