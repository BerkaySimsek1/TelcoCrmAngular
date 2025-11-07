import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BillingAccountServiceTs } from '../../../services/billing-account-service.ts.js';
import { AddressService } from '../../../services/address-service.js';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateBillingAccountRequest } from '../../../models/BillingAccountModels/createBillingAccountRequest.js';
interface AddressOption {
  id: number;
  title: string;
}
@Component({
  selector: 'app-create-billing-account-card',
 standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-billing-account-card.html',
  styleUrl: './create-billing-account-card.scss',
})
export class CreateBillingAccountComponent implements OnInit {
  customerId = signal<string>('');
  accountName = signal<string>('');
  selectedAddressId = signal<number | null>(null);
  addresses = signal<AddressOption[]>([]);
  isDropdownOpen = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  loading = signal<boolean>(false);
  loadingAddresses = signal<boolean>(false);

  constructor(
    private billingAccountService: BillingAccountServiceTs,
    private addressService: AddressService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Query params'dan customerId al
    this.route.queryParams.subscribe(params => {
      const customerId = params['customerId'];
      if (customerId) {
        this.customerId.set(customerId);
        this.loadAddresses(customerId);
      } else {
        this.errorMessage.set('Customer ID bulunamadı');
      }
    });

    // 2) create-address’ten geri dönerken state ile gelen id’yi yakala
    // router.getCurrentNavigation() sadece ilk tick’te dolu olabilir, o yüzden history.state kullan
    const s = (history.state as any)?.createdAddressId as number | undefined;
    if (s) this.selectedAddressId.set(s);
  }

  loadAddresses(customerId: string): void {
    this.loadingAddresses.set(true);
    
    this.addressService.getAddressByCustomerId(customerId).subscribe({
      next: (response: any) => {
        // Response array veya tek obje olabilir
        const addressList = Array.isArray(response) ? response : [response];
        
        this.addresses.set(addressList.map((addr: any) => ({
          id: addr.id,
          title: addr.title || 'Unnamed Address'
        })));
        
        this.loadingAddresses.set(false);
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        this.loadingAddresses.set(false);
        
        // 404 ise adres yok demektir
        if (err.status === 404) {
          this.addresses.set([]);
        } else {
          this.errorMessage.set('Error loading addresses');
        }
      }
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(val => !val);
  }

  selectAddress(address: AddressOption): void {
    this.selectedAddressId.set(address.id);
    this.isDropdownOpen.set(false);
    this.errorMessage.set('');
  }

  getSelectedAddressTitle(): string {
    const selected = this.addresses().find(addr => addr.id === this.selectedAddressId());
    return selected ? `Title : ${selected.title}` : 'Select Address';
  }

  validateForm(): boolean {
    if (!this.accountName().trim()) {
      this.errorMessage.set('Please fill in all required fields');
      return false;
    }
    if (!this.selectedAddressId()) {
      this.errorMessage.set('Please fill in all required fields');
      return false;
    }
    return true;
  }

  createAccount(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);

    const request: CreateBillingAccountRequest = {
      customerId: this.customerId(),
      addressId: this.selectedAddressId()!,
      accountName: this.accountName()
    };

    this.billingAccountService.createBillingAccount(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set('Billing account successfully created');
        
        // 1.5 saniye sonra billing accounts sayfasına dön
        setTimeout(() => {
          this.router.navigate([`/customer/${this.customerId()}/customer-account`]);
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('Error creating billing account');
        console.error('Error creating billing account:', err);
      }
    });
  }

  addNewAddress(): void {
    // Doğru create-address rotası:
    // /customers/:customerId/addresses/new?returnTo=/create-billing-account?customerId=XYZ
    const returnTo = `/create-billing-account?customerId=${encodeURIComponent(this.customerId())}`;
    this.router.navigate(
      ['/customers', this.customerId(), 'addresses', 'new'],
      { queryParams: { returnTo } }
    );
  }


  cancel(): void {
    this.router.navigate([`/customer/${this.customerId()}/customer-account`]);
  }
}