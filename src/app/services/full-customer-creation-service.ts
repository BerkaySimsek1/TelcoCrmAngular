import { Injectable, signal } from '@angular/core';
import { CreateCustomerRequest } from '../models/createCustomerRequest';
import { CreateAddressItem } from '../models/createFullCustomerModels/createAddressItem';
import { ContactMedium } from '../models/searchCustomerResponse';

export interface WizardState {
  individual?: CreateCustomerRequest;
  addresses: CreateAddressItem[];
  mediums: ContactMedium[];
}

@Injectable({ providedIn: 'root' })
export class FullCustomerCreationService
 {
  public state = signal<WizardState>({
    individual: undefined,
    addresses: [],
    mediums: [],
  });

  reset() {
    this.state.set({ individual: undefined, addresses: [], mediums: [] });
  }
}