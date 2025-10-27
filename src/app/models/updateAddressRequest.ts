export interface UpdateAddressRequest {
  street: string;
  houseNumber: string;
  description: string;
  districtId: string;
  customerId: string;
  default: boolean;
}