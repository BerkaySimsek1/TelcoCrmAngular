export interface CreateContactMediumRequest {
  customerId: string;
  contactMediums: ContactMedium[];
}

export interface ContactMedium {
  type: string;
  value: string;
  isPrimary: boolean;
}