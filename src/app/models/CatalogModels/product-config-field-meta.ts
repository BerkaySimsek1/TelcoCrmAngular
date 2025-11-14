export type ConfigDataType = 'String' | 'Number' | 'Boolean';

export interface ProductConfigFieldMeta {
  fieldId: number;           // örn: productSpecCharId / charId, BE ne dönerse
  key: string;               // "Pstn No", "XDSL User Name" vb (Characteristic.name)
  dataType: ConfigDataType;  // "String" / "Number" / "Boolean" (Characteristic.dataType)
  unitOfMeasure?: string;    // "Mbps", "GB" vb (Characteristic.unitOfMeasure)
  required: boolean;         // ProductSpecCharacteristic.isRequired
  allowedValues?: string[];  // CharacteristicValue.value listesi (o ürüne bağlı)
}