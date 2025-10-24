export interface SearchCustomerResponse {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  motherName: string;
  fatherName: string;
  gender: string;
  addresses: Address[];
  contactMediums: ContactMedium[];
}

export interface ContactMedium {
  id: number;
  type: string;
  value: string;
  isPrimary: boolean;
}

export interface Address {
  id: number;
  street: string;
  houseNumber: string;
  description: string;
  isDefault: boolean;
  districtId: number;
  districtName: string;
  cityId: number;
  cityName: string;
}