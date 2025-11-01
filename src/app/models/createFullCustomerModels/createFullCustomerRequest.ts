import { ContactMedium } from "../createContactMediumRequest";
import { CreateCustomerRequest } from "../createCustomerRequest";
import { CreateAddressItem } from "./createAddressItem";

export interface CreateFullCustomerRequest {
  individualCustomer: CreateCustomerRequest;
  addresses: CreateAddressItem[];          // customerId YOK (backend set edecek)
  contactMediums: ContactMedium[];         // customerId YOK (backend set edecek)
}