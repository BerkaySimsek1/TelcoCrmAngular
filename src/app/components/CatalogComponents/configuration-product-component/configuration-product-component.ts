// src/app/components/Sales/configuration-product/configuration-product-component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import { AddressService } from '../../../services/address-service';
import { Basket } from '../../../models/CatalogModels/BasketModels/basket-model';
import { AddressResponse } from '../../../models/AddressModels/addressResponse';
import { ProductConfigMeta } from '../../../models/CatalogModels/product-config-meta';
import { OrderCreationService } from '../../../services/catalogservice/order-creation-service';
import { ProductConfigMetaService } from '../../../services/catalogservice/product-config-meta-service';
import { ProductConfigurationDTO } from '../../../models/CatalogModels/product-configuration-dto';
import { ConfigurationPair } from '../../../models/CatalogModels/configuration-pair';

@Component({
  selector: 'app-configuration-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuration-product-component.html',
  styleUrls: ['./configuration-product-component.scss'],
})
export class ConfigurationProductComponent implements OnInit {
  formGroup!: FormGroup;

  // billing account’taki gibi çoklu adres desteği
  addresses = signal<AddressResponse[]>([]);
  loading = signal(false);
  loadingAddresses = signal(false);
  errorMessage = signal<string>('');

  // productOfferId -> meta
  configMetaMap = new Map<string, ProductConfigMeta>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orderCreation: OrderCreationService,
    private configMetaService: ProductConfigMetaService,
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    const st = this.orderCreation.state();
    const customerId = this.getCustomerIdFromRoute();

    // create-address’ten geri dönerken gelen id’yi yakala
    const createdAddressId = (history.state as any)?.createdAddressId as
      | number
      | undefined;

    // Sepet boşsa geri dön
    if (!st.basket || !st.basket.basketItems || st.basket.basketItems.length === 0) {
      if (customerId && st.billingAccountId) {
        this.router.navigate([
          '/customer',
          customerId,
          'start-new-sale',
          st.billingAccountId,
        ]);
      } else {
        this.router.navigate(['/search-list']);
      }
      return;
    }

    this.buildEmptyForm();

    // create-address’ten döndüysek addressId’yi önden set et
    if (createdAddressId) {
      this.formGroup.patchValue({ addressId: createdAddressId });
    }

    if (customerId) {
      this.loadAddresses(customerId);
    }

    this.loadConfigMetaForBasket(st.basket);
  }

  // Ana form: addressId + ürünlerin konfig alanları
  private buildEmptyForm() {
    this.formGroup = this.fb.group({
      addressId: new FormControl<number | null>(null, [Validators.required]),
      products: this.fb.array([]),
    });
  }

  get productsArray(): FormArray {
    return this.formGroup.get('products') as FormArray;
  }

  private getCustomerIdFromRoute(): string | null {
    return (
      this.route.parent?.parent?.snapshot.paramMap.get('customerId') ??
      this.route.parent?.snapshot.paramMap.get('customerId') ??
      this.route.snapshot.paramMap.get('customerId')
    );
  }

  // 🔥 billing account’taki loadAddresses mantığını buraya uyarladık
  private loadAddresses(customerId: string) {
    this.loadingAddresses.set(true);
    this.errorMessage.set('');

    this.addressService.getAddressByCustomerId(customerId).subscribe({
      next: (response: any) => {
        // tek obje veya array olabilir
        const list: AddressResponse[] = Array.isArray(response)
          ? response
          : [response];

        this.addresses.set(list);
        this.loadingAddresses.set(false);

        // eğer formda seçili yoksa, ilk adresi default seç
        const current = this.formGroup.get('addressId')!.value as number | null;
        if (!current && list.length > 0) {
          this.formGroup.patchValue({ addressId: list[0].id });
        }
      },
      error: (err) => {
        console.error('Address load error', err);
        this.loadingAddresses.set(false);

        if (err.status === 404) {
          // hiç adres yok
          this.addresses.set([]);
        } else {
          this.errorMessage.set('Error loading addresses');
        }
      },
    });
  }

  /**
   * Sepetteki her productOfferId için backend'den config meta çeker.
   */
  private loadConfigMetaForBasket(basket: Basket) {
    const productOfferIds = Array.from(
      new Set(
        basket.basketItems.map((b: any) => b.productOfferId ?? b.productId)
      )
    );
    if (productOfferIds.length === 0) return;

    this.loading.set(true);

    forkJoin(
      productOfferIds.map((id) =>
        this.configMetaService.getMetaForProductOffer(id)
      )
    ).subscribe({
      next: (metas: ProductConfigMeta[]) => {
        metas.forEach((m) => this.configMetaMap.set(m.productOfferId, m));
        this.buildProductControls(basket, metas);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Config meta load error', err);
        this.loading.set(false);
      },
    });
  }

  /**
   * Sepet + meta bilgisi ile dinamik ürün form array'ini kurar.
   */
  private buildProductControls(basket: Basket, metas: ProductConfigMeta[]) {
    const arr = this.productsArray;
    arr.clear();

    basket.basketItems.forEach((item: any) => {
      const productOfferId = item.productOfferId ?? item.productId;
      const meta = this.configMetaMap.get(productOfferId);

      const fieldsArray = this.fb.array(
        (meta?.characteristics ?? []).map((f) =>
          this.fb.group({
            key: new FormControl<string>(f.key, { nonNullable: true }),
            value: new FormControl<string>(
              f.defaultValue ?? '',
              f.required ? [Validators.required] : []
            ),
            allowedValues: new FormControl<string[]>(f.allowedValues ?? []),
            dataType: new FormControl<string>(f.dataType),
            required: new FormControl<boolean>(f.required),
          })
        )
      );

      arr.push(
        this.fb.group({
          productOfferId: new FormControl<string>(productOfferId, {
            nonNullable: true,
          }),
          productName: new FormControl<string>(item.productName, {
            nonNullable: true,
          }),
          fields: fieldsArray,
        })
      );
    });
  }

  // Template’te kullanmak için
  getFieldsArray(index: number): FormArray {
    return (this.productsArray.at(index) as FormGroup).get(
      'fields'
    ) as FormArray;
  }

  onAddNewAddress() {
    const customerId = this.getCustomerIdFromRoute();
    if (!customerId) return;

    // billing account’taki DOĞRU rota
    const returnTo = this.router.url;
    this.router.navigate(
      ['/customers', customerId, 'addresses', 'new'],
      { queryParams: { returnTo } }
    );
  }

  onPrevious() {
    const st = this.orderCreation.state();
    const customerId = this.getCustomerIdFromRoute();
    if (!customerId || !st.billingAccountId) return;

    this.router.navigate([
      '/customer',
      customerId,
      'start-new-sale',
      st.billingAccountId,
    ]);
  }

  onNext() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const addressId = this.formGroup.get('addressId')!.value as number;

    const configs: ProductConfigurationDTO[] = this.productsArray.controls.map(
      (ctrl) => {
        const g = ctrl as FormGroup;
        const productOfferId = g.get('productOfferId')!.value as string;
        const fieldsArray = g.get('fields') as FormArray;

        const configuration: ConfigurationPair[] = fieldsArray.controls
          .map((fCtrl) => {
            const fg = fCtrl as FormGroup;
            const key = (fg.get('key')!.value as string).trim();
            const value = (fg.get('value')!.value as string).trim();
            if (!key || !value) return null;
            return { key, value } as ConfigurationPair;
          })
          .filter((x): x is ConfigurationPair => x !== null);

        return {
          productOfferId,
          configuration,
        } as ProductConfigurationDTO;
      }
    );

    this.orderCreation.setAddressId(addressId);
    this.orderCreation.setConfigurations(configs);

    const st = this.orderCreation.state();
    const customerId = this.getCustomerIdFromRoute();
    if (!customerId || !st.billingAccountId) return;

    this.router.navigate([
      '/customer',
      customerId,
      'start-new-sale',
      st.billingAccountId,
      'summary',
    ]);
  }
}
