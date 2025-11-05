import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingAccountResponse } from '../../models/BillingAccountModels/billingAccountResponse';
import { BillingAccountServiceTs } from '../../services/billing-account-service.ts';

interface Product {
  id: number;
  productId: string;
  productName: string;
  campaignName: string;
  campaignId: string;
}

@Component({
  selector: 'app-billing-account-info-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing-account-info-list.html',
  styleUrl: './billing-account-info-list.scss',
})
export class BillingAccountInfoListComponent implements OnInit {
  billingAccounts = signal<BillingAccountResponse[]>([]);
  customerId = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = 4;
  expandedAccountId = signal<number | null>(null);
  
  // Mock product data - gerçek backend'den gelecek
  mockProducts: { [key: number]: Product[] } = {
    1: [
      { id: 1, productId: 'P001', productName: 'ADSL 8 MB', campaignName: 'DATA MODEM', campaignId: 'C001' },
      { id: 2, productId: 'P002', productName: 'TV Package', campaignName: 'DIGITAL TV', campaignId: 'C002' },
    ],
    2: [
      { id: 3, productId: 'P003', productName: 'Fiber 100MB', campaignName: 'FIBER INTERNET', campaignId: 'C003' },
    ],
    3: [
      { id: 4, productId: 'P004', productName: 'Mobile Plan', campaignName: 'MOBILE SERVICE', campaignId: 'C004' },
      { id: 5, productId: 'P005', productName: 'Voice Plan', campaignName: 'CALLING SERVICE', campaignId: 'C005' },
      { id: 6, productId: 'P006', productName: 'SMS Bundle', campaignName: 'SMS PACKAGE', campaignId: 'C006' },
    ],
    4: [
      { id: 7, productId: 'P007', productName: 'Corporate Plan', campaignName: 'BUSINESS SERVICE', campaignId: 'C007' },
    ],
    5: [
      { id: 8, productId: 'P008', productName: 'Premium Bundle', campaignName: 'ALL-IN-ONE', campaignId: 'C008' },
      { id: 9, productId: 'P009', productName: 'Cloud Storage', campaignName: 'CLOUD SERVICE', campaignId: 'C009' },
    ],
  };

  constructor(
    private billingAccountService: BillingAccountServiceTs,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadBillingAccounts();
  }

  loadBillingAccounts(): void {
    const customerIdFromRoute = this.route.parent?.snapshot.paramMap.get('customerId')
                              || this.route.snapshot.paramMap.get('customerId');
    
    if (!customerIdFromRoute) {
      console.error('customerId paramı bulunamadı.');
      this.error.set('Customer ID bulunamadı');
      this.loading.set(false);
      return;
    }

    console.log('CustomerId:', customerIdFromRoute);
    this.customerId.set(customerIdFromRoute);
    this.loading.set(true);
    this.error.set('');

    this.billingAccountService.getBillingAccountByCustomerId(customerIdFromRoute)
      .subscribe({
        next: (response: BillingAccountResponse[]) => {
          console.log('API Response:', response);
          this.billingAccounts.set(response);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Full error object:', err);
          if (err.status === 404) {
            this.billingAccounts.set([]);
            this.loading.set(false);
          } else {
            this.error.set('Billing accounts yüklenirken bir hata oluştu');
            this.loading.set(false);
          }
        }
      });
  }

  createNewAccount(): void {
    this.router.navigate(['/create-billing-account'], {
      queryParams: { customerId: this.customerId() }
    });
  }

  editAccount(accountId: number): void {
    console.log('Edit account:', accountId);
    this.router.navigate(['/billing-account-update'], {
      queryParams: {
        customerId: this.customerId(),
        billingAccountId: accountId
      }
    });
  }

  deleteAccount(accountId: number): void {
    console.log('Delete account:', accountId);
  }

  toggleExpand(accountId: number): void {
    if (this.expandedAccountId() === accountId) {
      this.expandedAccountId.set(null);
    } else {
      this.expandedAccountId.set(accountId);
    }
  }

  getProducts(accountId: number): Product[] {
    return this.mockProducts[accountId] || [];
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
  }

  getTotalPages(): number {
    return Math.ceil(this.billingAccounts().length / this.itemsPerPage);
  }

  getPaginatedAccounts(): BillingAccountResponse[] {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.billingAccounts().slice(startIndex, endIndex);
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage();
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      // 5 ya da daha az sayfa varsa hepsini göster
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // İlk sayfa
      pages.push(1);

      // Mevcut sayfanın etrafındaki sayfalar
      const startRange = Math.max(2, currentPage - 1);
      const endRange = Math.min(totalPages - 1, currentPage + 1);

      if (startRange > 2) {
        pages.push('...');
      }

      for (let i = startRange; i <= endRange; i++) {
        pages.push(i);
      }

      if (endRange < totalPages - 1) {
        pages.push('...');
      }

      // Son sayfa
      pages.push(totalPages);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(val => val - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.getTotalPages()) {
      this.currentPage.update(val => val + 1);
    }
  }

  startNewSale(accountId: number): void {
    console.log('Start New Sale for account:', accountId);
    // this.router.navigate(['/start-new-sale'], { queryParams: { accountId } });
  }

  transfer(accountId: number): void {
    console.log('Transfer for account:', accountId);
    // this.router.navigate(['/transfer'], { queryParams: { accountId } });
  }

  serviceAddressChange(accountId: number): void {
    console.log('Service Address Change for account:', accountId);
    // this.router.navigate(['/service-address-change'], { queryParams: { accountId } });
  }

  viewProduct(productId: number): void {
    console.log('View product:', productId);
    // this.router.navigate(['/product-details'], { queryParams: { productId } });
  }
}