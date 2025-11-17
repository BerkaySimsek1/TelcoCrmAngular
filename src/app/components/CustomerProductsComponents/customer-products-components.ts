import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { BillingAccountProductResponse } from '../../models/SalesProductModels/billingAccountProductResponse';
import { CustomerAccProductService } from '../../services/customerAcc-product-service';
import { DeleteConfirmationModalComponent } from '../DeleteConfirmationModalComponents/delete-confirmation-modal/delete-confirmation-modal';

@Component({
  selector: 'app-customer-products-components',
  standalone: true,
  imports: [CommonModule, DeleteConfirmationModalComponent],
  templateUrl: './customer-products-components.html',
  styleUrls: ['./customer-products-components.scss'],
})
export class CustomerProductsComponents implements OnInit {
  @Input() billingAccountId!: number;

  products = signal<BillingAccountProductResponse[]>([]);
  
  // Modal state
  modalOpen = signal<boolean>(false);
  modalTitle = signal<string>('');
  modalMessage = signal<string>('');
  modalLoading = signal<boolean>(false);

  // Artık burada OrderProduct / CustomerProduct id tutuyoruz
  selectedProductForDelete = signal<string | null>(null);

  constructor(private customerAccProductService: CustomerAccProductService) {} 

  ngOnInit(): void {
    if (this.billingAccountId) {
      this.customerAccProductService.getProductsForBillingAccount(this.billingAccountId)
        .subscribe((products: BillingAccountProductResponse[]) => {
          this.products.set(products);
        });
    }
  }

  // Buradaki productId = orderProductId
  deleteProduct(orderProductId: string): void {
    this.selectedProductForDelete.set(orderProductId);
    this.modalTitle.set('The product cancellation process will be initiated. Are you sure?');
    this.modalMessage.set('');
    this.modalOpen.set(true);
  }

  private performDelete(orderProductId: string): void {
    this.modalLoading.set(true);
    
    this.customerAccProductService.deleteProduct(orderProductId)
      .subscribe({
        next: () => {
          console.log('Product deleted successfully');
          this.modalLoading.set(false);
          this.modalOpen.set(false);
          this.selectedProductForDelete.set(null);
          
          // Ürünü listeden id ile çıkar (productOfferId ile değil)
          this.products.update(prods => 
            prods.filter(p => p.id !== orderProductId)
          );
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.modalLoading.set(false);
          // Hata durumunda title boş kalmasın
          this.modalTitle.set('Product could not be deleted');
          this.modalMessage.set('An error occurred while deleting the product. Please try again.');
        }
      });
  }

  onModalConfirm(): void {
    const productId = this.selectedProductForDelete();
    if (productId) {
      this.performDelete(productId);
    }
  }

  onModalCancel(): void {
    this.modalOpen.set(false);
    this.selectedProductForDelete.set(null);
    this.modalLoading.set(false);
  }

  onModalClose(): void {
    this.modalOpen.set(false);
    this.selectedProductForDelete.set(null);
    this.modalLoading.set(false);
  }

  viewProduct(productId: string): void {
    console.log('View product tıklandı:', productId);
  }
}