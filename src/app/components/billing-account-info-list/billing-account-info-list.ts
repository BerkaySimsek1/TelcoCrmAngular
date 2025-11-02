import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingAccountResponse } from '../../models/BillingAccountModels/billingAccountResponse';
import { BillingAccountServiceTs } from '../../services/billing-account-service.ts';

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
  totalPages = signal<number>(12);

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

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(val => val - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(val => val + 1);
    }
  }
}