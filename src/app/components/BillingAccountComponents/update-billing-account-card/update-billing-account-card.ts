import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BillingAccountServiceTs } from '../../../services/billing-account-service.ts.js';
import { AddressService } from '../../../services/address-service.js';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateBillingAccountRequest } from '../../../models/BillingAccountModels/updateBillingAccountRequest.js';
interface AddressOption {
  id: number;
  title: string;
}
@Component({
  selector: 'app-update-billing-account-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './update-billing-account-card.html',
  styleUrl: './update-billing-account-card.scss',
})
export class UpdateBillingAccountComponent implements OnInit {
  customerId = signal<string>('');
  billingAccountId = signal<number>(0);
  accountNumber = signal<string>('');
  accountName = signal<string>('');
  selectedAddressId = signal<number | null>(null);
  addresses = signal<AddressOption[]>([]);
  isDropdownOpen = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  loading = signal<boolean>(false);
  loadingAddresses = signal<boolean>(false);
  loadingAccount = signal<boolean>(false);

  constructor(
    private billingAccountService: BillingAccountServiceTs,
    private addressService: AddressService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Query params'dan customerId ve billingAccountId al
    this.route.queryParams.subscribe(params => {
      const customerId = params['customerId'];
      const billingAccountId = params['billingAccountId'];
      
      if (customerId && billingAccountId) {
        this.customerId.set(customerId);
        this.billingAccountId.set(Number(billingAccountId));
        this.loadAddresses(customerId);
        this.loadBillingAccount(customerId, Number(billingAccountId));
      } else {
        this.errorMessage.set('Required parameters not found');
      }
    });
  }

  loadBillingAccount(customerId: string, billingAccountId: number): void {
    this.loadingAccount.set(true);
    
    this.billingAccountService.getBillingAccountByCustomerId(customerId).subscribe({
      next: (accounts) => {
        const account = accounts.find(acc => acc.id === billingAccountId);
        
        if (account) {
          this.accountNumber.set(account.accountNumber);
          this.accountName.set(account.accountName);
          this.selectedAddressId.set(account.addressId);
        } else {
          this.errorMessage.set('Billing account not found');
        }
        
        this.loadingAccount.set(false);
      },
      error: (err) => {
        console.error('Error loading billing account:', err);
        this.errorMessage.set('Error loading billing account');
        this.loadingAccount.set(false);
      }
    });
  }

  loadAddresses(customerId: string): void {
    this.loadingAddresses.set(true);
    
    this.addressService.getAddressByCustomerId(customerId).subscribe({
      next: (response: any) => {
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

  updateAccount(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);

    const request: UpdateBillingAccountRequest = {
      accountName: this.accountName(),
      addressId: this.selectedAddressId()!
      
    };

    this.billingAccountService.updateBillingAccount(this.billingAccountId(), request).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set('Billing account successfully updated');
        
        setTimeout(() => {
          this.router.navigate([`/customer/${this.customerId()}/customer-account`]);
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('Error updating billing account');
        console.error('Error updating billing account:', err);
      }
    });
  }

  addNewAddress(): void {
    // Update sayfasından yeni adres ekleme
    const returnTo = `/billing-account-update?customerId=${encodeURIComponent(this.customerId())}&billingAccountId=${this.billingAccountId()}`;
    this.router.navigate(
      ['/customers', this.customerId(), 'addresses', 'new'],
      { queryParams: { returnTo } }
    );
  }

  cancel(): void {
    this.router.navigate([`/customer/${this.customerId()}/customer-account`]);
  }
}