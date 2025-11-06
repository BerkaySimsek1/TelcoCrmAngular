import { ContactMedium } from "../ContactMediumModels/createContactMediumRequest";
import { CreateCustomerRequest } from "../CustomerModels/createCustomerRequest";
import { CreateAddressItem } from "./createAddressItem";

export interface CreateFullCustomerRequest {
  individualCustomer: CreateCustomerRequest;
  addresses: CreateAddressItem[];          // customerId YOK (backend set edecek)
  contactMediums: ContactMedium[];         // customerId YOK (backend set edecek)
}