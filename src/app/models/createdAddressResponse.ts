export interface CreatedAddressResponse {
  id: number;
  street: string;
  houseNumber: string;
  description: string;
  customerId: string;
  districtId: number;
  districtName: string;
  cityName: string;
  default: boolean;
}