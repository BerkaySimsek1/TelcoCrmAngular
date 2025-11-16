import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingAccountResponse } from '../../../models/BillingAccountModels/billingAccountResponse';
import { BillingAccountServiceTs } from '../../../services/billing-account-service.ts';
import { CustomerProductsComponents } from '../../CustomerProductsComponents/customer-products-components';
import { CustomerAccProductService } from '../../../services/customerAcc-product-service';
import { DeleteConfirmationModalComponent } from '../../DeleteConfirmationModalComponents/delete-confirmation-modal/delete-confirmation-modal';




@Component({
  selector: 'app-billing-account-info-list',
  standalone: true,
  imports: [CommonModule, CustomerProductsComponents, DeleteConfirmationModalComponent],
  templateUrl: './billing-account-info-list.html',
  styleUrls: ['./billing-account-info-list.scss'],
})
export class BillingAccountInfoListComponent implements OnInit {
  billingAccounts = signal<BillingAccountResponse[]>([]);
  customerId = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = 4;
  expandedAccountId = signal<number | null>(null);
  
  // Modal state
  modalOpen = signal<boolean>(false);
  modalType = signal<'confirm' | 'error'>('confirm');
  modalTitle = signal<string>('');
  modalMessage = signal<string>('');
  modalLoading = signal<boolean>(false);
  selectedAccountForDelete = signal<number | null>(null);
  

  constructor(
    private billingAccountService: BillingAccountServiceTs,
    private customerAccProductService: CustomerAccProductService,
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
    this.selectedAccountForDelete.set(accountId);
    this.modalType.set('confirm');
    this.modalTitle.set('Are you sure you want to delete?');
    this.modalMessage.set('');
    this.modalOpen.set(true);
  }

  private handleDeleteConfirmed(): void {
    const accountId = this.selectedAccountForDelete();
    
    if (!accountId) return;

    this.modalLoading.set(true);

    // Önce ürün kontrolü yap
    this.customerAccProductService.getProductsForBillingAccount(accountId)
      .subscribe({
        next: (products) => {
          if (products && products.length > 0) {
            // Ürün varsa hata mesajı göster
            this.modalLoading.set(false);
            this.modalType.set('error');
            this.modalTitle.set('');
            this.modalMessage.set('This billing account cannot be deleted because it is linked to an active product.');
          } else {
            // Ürün yoksa silme işlemini gerçekleştir
            this.performDelete(accountId);
          }
        },
        error: (err) => {
          console.error('Error checking products:', err);
          this.modalLoading.set(false);
          this.modalType.set('error');
          this.modalTitle.set('');
          this.modalMessage.set('An error occurred while checking products. Please try again.');
        }
      });
  }

  private performDelete(accountId: number): void {
    this.billingAccountService.deleteBillingAccount(accountId)
      .subscribe({
        next: () => {
          console.log('Account deleted successfully');
          this.modalLoading.set(false);
          this.modalOpen.set(false);
          this.selectedAccountForDelete.set(null);
          
          // Listeyi yeniden yükle
          this.loadBillingAccounts();
        },
        error: (err) => {
          console.error('Error deleting account:', err);
          this.modalLoading.set(false);
          this.modalType.set('error');
          this.modalTitle.set('');
          this.modalMessage.set('An error occurred while deleting the account. Please try again.');
        }
      });
  }

  onModalConfirm(): void {
    this.handleDeleteConfirmed();
  }

  onModalCancel(): void {
    this.modalOpen.set(false);
    this.selectedAccountForDelete.set(null);
    this.modalLoading.set(false);
  }

  onModalClose(): void {
    this.modalOpen.set(false);
    this.selectedAccountForDelete.set(null);
    this.modalLoading.set(false);
  }

  toggleExpand(accountId: number): void {
    if (this.expandedAccountId() === accountId) {
      this.expandedAccountId.set(null);
    } else {
      this.expandedAccountId.set(accountId);
    }
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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
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
    this.router.navigate([
      '/customer',
      this.customerId(),
      'start-new-sale',
      accountId
    ]);
  }

  transfer(accountId: number): void {
    console.log('Transfer for account:', accountId);
  }

  serviceAddressChange(accountId: number): void {
    console.log('Service Address Change for account:', accountId);
  }

  viewProduct(productId: number): void {
    console.log('View product:', productId);
  }
}