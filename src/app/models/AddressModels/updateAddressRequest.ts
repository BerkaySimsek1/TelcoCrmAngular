export interface UpdateAddressRequest {
  street: string;
  title:string;
  houseNumber: string;
  description: string;
  districtId: string;
  customerId: string;
  default: boolean;
}