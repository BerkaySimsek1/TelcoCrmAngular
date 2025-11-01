// services/full-customer-creation-service.ts
import { Injectable, signal } from '@angular/core';
import { CreateCustomerRequest } from '../models/createCustomerRequest';
import { CreateAddressItem } from '../models/createFullCustomerModels/createAddressItem';
import { ContactMedium } from '../models/createContactMediumRequest';

export interface FullCustomerState {
  individual?: CreateCustomerRequest;
  addresses: CreateAddressItem[];
  contactMediums: ContactMedium[];
}

const STORAGE_KEY = 'full-customer-wizard';

@Injectable({ providedIn: 'root' })
export class FullCustomerCreationService {
  private _state = signal<FullCustomerState>({ addresses: [], contactMediums: [] });

  state = this._state; // public readonly gibi kullan

  constructor() {
    this.hydrate();
  }

  // ----- persist / hydrate -----
  private persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._state()));
    } catch {}
  }

  private hydrate() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as FullCustomerState;
      // basit şema güvenliği
      this._state.set({
        individual: parsed.individual,
        addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
        contactMediums: Array.isArray(parsed.contactMediums) ? parsed.contactMediums : [],
      });
    } catch {}
  }

  // Her set/patch sonunda persist çağır
  setIndividual(ind: CreateCustomerRequest) {
    this._state.set({ ...this._state(), individual: ind });
    this.persist();
  }

  upsertAddress(index: number | null, addr: CreateAddressItem) {
    const cur = this._state();
    const list = [...cur.addresses];
    if (index == null || index < 0 || index >= list.length) list.push(addr);
    else list[index] = addr;
    this._state.set({ ...cur, addresses: list });
    this.persist();
  }

  removeAddress(index: number) {
    const cur = this._state();
    const list = [...cur.addresses];
    if (index >= 0 && index < list.length) list.splice(index, 1);
    this._state.set({ ...cur, addresses: list });
    this.persist();
  }

  setAddresses(addrs: CreateAddressItem[]) {
    const cur = this._state();
    this._state.set({ ...cur, addresses: [...addrs] });
    this.persist();
  }

  setContactMediums(cms: ContactMedium[]) {
    const cur = this._state();
    this._state.set({ ...cur, contactMediums: cms });
    this.persist();
  }

  reset() {
    this._state.set({ addresses: [], contactMediums: [] });
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }
}
