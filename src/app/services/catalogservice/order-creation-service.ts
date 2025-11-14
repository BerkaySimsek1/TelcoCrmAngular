// src/app/services/order-creation.service.ts
import { Injectable, signal } from '@angular/core';
import { Basket } from '../../models/CatalogModels/BasketModels/basket-model';
import { ProductConfigurationDTO } from '../../models/CatalogModels/product-configuration-dto';

export interface OrderWizardState {
  billingAccountId: number | null;
  basket: Basket | null;
  addressId: number | null;
  configurations: ProductConfigurationDTO[];
}

const STORAGE_KEY = 'order-wizard';

@Injectable({ providedIn: 'root' })
export class OrderCreationService {
  private _state = signal<OrderWizardState>({
    billingAccountId: null,
    basket: null,
    addressId: null,
    configurations: [],
  });

  state = this._state;

  constructor() {
    this.hydrate();
  }

  private persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._state()));
    } catch {}
  }

  private hydrate() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as OrderWizardState;
      this._state.set({
        billingAccountId: parsed.billingAccountId ?? null,
        basket: parsed.basket ?? null,
        addressId: parsed.addressId ?? null,
        configurations: parsed.configurations ?? [],
      });
    } catch {}
  }

  setBillingAccountId(id: number) {
    this._state.set({ ...this._state(), billingAccountId: id });
    this.persist();
  }

  setBasket(basket: Basket | null) {
    this._state.set({ ...this._state(), basket });
    this.persist();
  }

  setAddressId(addressId: number) {
    this._state.set({ ...this._state(), addressId });
    this.persist();
  }

  setConfigurations(configs: ProductConfigurationDTO[]) {
    this._state.set({ ...this._state(), configurations: configs });
    this.persist();
  }

  reset() {
    this._state.set({
      billingAccountId: null,
      basket: null,
      addressId: null,
      configurations: [],
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}
