import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { BillingAccountProductResponse } from '../../models/SalesProductModels/billingAccountProductResponse';
import { OrderProductDetailResponse } from '../../models/SalesProductModels/orderProductDetailResponse';
import { CustomerAccProductService } from '../../services/customerAcc-product-service';
import { DeleteConfirmationModalComponent } from '../DeleteConfirmationModalComponents/delete-confirmation-modal/delete-confirmation-modal';
import { ProductDetailsModalComponent } from '../ProductDetailsModalComponent/product-details-modal/product-details-modal';

@Component({
  selector: 'app-customer-products-components',
  standalone: true,
  imports: [CommonModule, DeleteConfirmationModalComponent, ProductDetailsModalComponent],
  templateUrl: './customer-products-components.html',
  styleUrls: ['./customer-products-components.scss'],
})
export class CustomerProductsComponents implements OnInit {
  @Input() billingAccountId!: number;

  products = signal<BillingAccountProductResponse[]>([]);
  
  // Delete Modal state
  deleteModalOpen = signal<boolean>(false);
  deleteModalTitle = signal<string>('');
  deleteModalMessage = signal<string>('');
  deleteModalLoading = signal<boolean>(false);
  selectedProductForDelete = signal<string | null>(null);

  // Details Modal state
  detailsModalOpen = signal<boolean>(false);
  selectedProductDetails = signal<OrderProductDetailResponse | null>(null);
  detailsModalLoading = signal<boolean>(false);

  constructor(private customerAccProductService: CustomerAccProductService) {} 

  ngOnInit(): void {
    if (this.billingAccountId) {
      this.customerAccProductService.getProductsForBillingAccount(this.billingAccountId)
        .subscribe((products: BillingAccountProductResponse[]) => {
          this.products.set(products);
        });
    }
  }

  // Delete işlemleri
  deleteProduct(orderProductId: string): void {
    this.selectedProductForDelete.set(orderProductId);
    this.deleteModalTitle.set('Ürün iptal süreci başlatılacak. Emin misiniz?');
    this.deleteModalMessage.set('');
    this.deleteModalOpen.set(true);
  }

  private performDelete(orderProductId: string): void {
    this.deleteModalLoading.set(true);
    
    this.customerAccProductService.deleteProduct(orderProductId)
      .subscribe({
        next: () => {
          console.log('Product deleted successfully');
          this.deleteModalLoading.set(false);
          this.deleteModalOpen.set(false);
          this.selectedProductForDelete.set(null);
          
          // Ürünü listeden çıkar
          this.products.update(prods => 
            prods.filter(p => p.id !== orderProductId)
          );
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.deleteModalLoading.set(false);
          this.deleteModalTitle.set('Ürün silinemedi');
          this.deleteModalMessage.set('Ürün silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      });
  }

  onDeleteModalConfirm(): void {
    const productId = this.selectedProductForDelete();
    if (productId) {
      this.performDelete(productId);
    }
  }

  onDeleteModalCancel(): void {
    this.deleteModalOpen.set(false);
    this.selectedProductForDelete.set(null);
    this.deleteModalLoading.set(false);
  }

  onDeleteModalClose(): void {
    this.deleteModalOpen.set(false);
    this.selectedProductForDelete.set(null);
    this.deleteModalLoading.set(false);
  }

  // Details Modal işlemleri
  viewProduct(productId: string): void {
    this.detailsModalLoading.set(true);
    this.detailsModalOpen.set(true);

    this.customerAccProductService.getProductDetails(productId)
      .subscribe({
        next: (product: OrderProductDetailResponse) => {
          this.selectedProductDetails.set(product);
          this.detailsModalLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching product details:', err);
          this.detailsModalLoading.set(false);
          this.detailsModalOpen.set(false);
        }
      });
  }

  onDetailsModalClose(): void {
    this.detailsModalOpen.set(false);
    this.selectedProductDetails.set(null);
    this.detailsModalLoading.set(false);
  }
}