export interface CreateAddressRequest {
  street: string;
  title:string;
  houseNumber: string;
  description: string;
  districtId: number;
  customerId: string;
  default: boolean;
}