export interface CreateAddressRequest {
  street: string;
  houseNumber: string;
  description: string;
  districtId: number;
  customerId: string;
  default: boolean;
}