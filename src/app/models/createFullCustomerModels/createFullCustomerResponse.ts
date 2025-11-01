export interface CreateFullCustomerResponse {
  customerId: string;
  customerNumber: string;
  addresses: { id: number; default: boolean }[];
  contactMediums: { id: number; type: string; isPrimary: boolean }[];
}