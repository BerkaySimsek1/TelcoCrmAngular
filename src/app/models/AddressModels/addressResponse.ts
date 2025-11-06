export interface AddressResponse {
  id: number;
  title:string;
  street: string;
  houseNumber: string;
  description: string;
  customerId: string;
  districtId: number;
  districtName: string;
  cityName: string;
  default: boolean;
}