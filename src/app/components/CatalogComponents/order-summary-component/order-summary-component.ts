// src/app/components/Sales/order-summary/order-summary.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from '../../../services/address-service';
import { AddressResponse } from '../../../models/AddressModels/addressResponse';
import { OrderCreationService } from '../../../services/catalogservice/order-creation-service';
import { SalesService } from '../../../services/catalogservice/sales-service';
import { CreateOrderRequest } from '../../../models/CatalogModels/create-order-request';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary-component.html',
  styleUrls: ['./order-summary-component.scss'],
})
export class OrderSummaryComponent implements OnInit {
  submitting = signal(false);

  // 🔥 address tek obje olacak
  address = signal<AddressResponse | null>(null);
  loadingAddress = signal(false);
  addressError = signal<string>('');
  orderSuccess = signal(false);

  totalAmount = computed(() => {
    const st = this.orderCreation.state();
    if (!st.basket) return 0;
    return (st.basket as any).totalPrice ?? 0;
  });

  constructor(
    public orderCreation: OrderCreationService,
    private route: ActivatedRoute,
    private router: Router,
    private salesService: SalesService,
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    const st = this.orderCreation.state();
    const customerId = this.getCustomerIdFromRoute();

    // Sepet yoksa geri dön
    if (!st.basket || !st.basket.basketItems || st.basket.basketItems.length === 0) {
      if (customerId && st.billingAccountId) {
        this.router.navigate(['/customer', customerId, 'start-new-sale', st.billingAccountId]);
      } else {
        this.router.navigate(['/search-list']);
      }
      return;
    }

    // 🔥 Seçilmiş addressId varsa ona göre adresi yükle
    if (customerId && st.addressId) {
      this.loadSelectedAddress(customerId, st.addressId);
    }
  }

  private getCustomerIdFromRoute(): string | null {
    return (
      this.route.parent?.parent?.snapshot.paramMap.get('customerId') ??
      this.route.parent?.snapshot.paramMap.get('customerId') ??
      this.route.snapshot.paramMap.get('customerId')
    );
  }

  // configuration-product’taki loadAddresses mantığının summary versiyonu
  private loadSelectedAddress(customerId: string, addressId: number) {
    this.loadingAddress.set(true);
    this.addressError.set('');

    this.addressService.getAddressByCustomerId(customerId).subscribe({
      next: (response: any) => {
        const list: AddressResponse[] = Array.isArray(response)
          ? response
          : [response];

        // seçili adresi bul, yoksa ilkini al
        const selected =
          list.find((a) => a.id === addressId) ?? list[0] ?? null;

        this.address.set(selected);
        this.loadingAddress.set(false);
      },
      error: (err) => {
        console.error('Address load error', err);
        this.loadingAddress.set(false);

        if (err.status === 404) {
          this.addressError.set('No address found for this customer');
        } else {
          this.addressError.set('Error loading address');
        }
      },
    });
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
      'configuration',
    ]);
  }

  onSubmit() {
  const st = this.orderCreation.state();
  if (!st.billingAccountId || !st.addressId) {
    console.error('Order state eksik');
    return;
  }

  const req: CreateOrderRequest = {
    billingAccountId: st.billingAccountId,
    addressId: st.addressId,
    configurations: st.configurations ?? [],
  };

  this.submitting.set(true);
  this.orderSuccess.set(false);
  
  this.salesService.createOrder(req).subscribe({
    next: () => {
      this.submitting.set(false);
      this.orderSuccess.set(true);
      
      // 2 saniye success mesajı göster, sonra billing account sayfasına yönlendir
      setTimeout(() => {
        this.orderCreation.reset();
        const customerId = this.getCustomerIdFromRoute();
        if (customerId) {
          this.router.navigate(['/customer', customerId, 'customer-account']);
        } else {
          this.router.navigate(['/search-list']);
        }
      }, 2000);
    },
    error: (err) => {
      console.error('createOrder error', err);
      this.submitting.set(false);
    },
  });
}
}
