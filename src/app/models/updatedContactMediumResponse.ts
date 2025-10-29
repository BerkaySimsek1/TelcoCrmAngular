export interface UpdatedContactMediumResponse {
  customerId: string;
  updatedContactMediums: UpdatedContactMedium[];
}

export interface UpdatedContactMedium {
  id: number;
  customerId: string;
  type: string;
  value: string;
  isPrimary: boolean;
}