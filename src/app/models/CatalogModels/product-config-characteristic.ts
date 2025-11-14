// src/app/models/CatalogModels/product-config-characteristic.ts
export interface ProductConfigCharacteristic {
  key: string;
  dataType: string;        // "String" | "Number" | "Boolean" vs
  unitOfMeasure: string;   // "Marka", "Model", "N/A" ...
  required: boolean;
  allowedValues: string[];
  defaultValue?: string | null;
}
