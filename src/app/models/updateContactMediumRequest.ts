export interface UpdateContactMediumRequest {
  customerId: string;
  contactMediums: UpdateContactMedium[];
}

export interface UpdateContactMedium {
  id: number;
  type: string;
  value: string;
  isPrimary: boolean;
}