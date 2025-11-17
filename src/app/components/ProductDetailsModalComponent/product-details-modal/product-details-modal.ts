import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderProductDetailResponse } from '../../../models/SalesProductModels/orderProductDetailResponse';
import { AddressService } from '../../../services/address-service';
import { AddressResponse } from '../../../models/AddressModels/addressResponse';

@Component({
  selector: 'app-product-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details-modal.html',
  styleUrls: ['./product-details-modal.scss']
})
export class ProductDetailsModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() product: OrderProductDetailResponse | null = null;
  @Input() isLoading = false;
  @Output() onClose = new EventEmitter<void>();

  addressDetails: AddressResponse | null = null;
  addressLoading = false;
  addressError = false;
  addressErrorMessage = '';

  constructor(private addressService: AddressService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Modal açıldığında adres bilgisini yükle
      if (this.product?.addressId) {
        this.loadAddressDetails(this.product.addressId);
      } else {
        this.addressError = true;
        this.addressErrorMessage = 'Adres ID bulunamadı';
      }
    } else if (changes['isOpen'] && !this.isOpen) {
      document.body.style.overflow = 'auto';
      // Modal kapandığında adres verilerini temizle
      this.resetAddressState();
    }
  }

  private loadAddressDetails(addressId: number): void {
    this.addressLoading = true;
    this.addressError = false;
    this.addressErrorMessage = '';

    this.addressService.getAddressById(addressId).subscribe({
      next: (address: AddressResponse) => {
        this.addressDetails = address;
        this.addressLoading = false;
      },
      error: (err) => {
        console.error('Adres yüklenirken hata:', err);
        this.addressError = true;
        this.addressErrorMessage = err.error?.message || 'Adres bilgisi yüklenemedi. Lütfen daha sonra tekrar deneyin.';
        this.addressLoading = false;
      }
    });
  }

  private resetAddressState(): void {
    this.addressDetails = null;
    this.addressError = false;
    this.addressErrorMessage = '';
    this.addressLoading = false;
  }

  close(): void {
    document.body.style.overflow = 'auto';
    this.onClose.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}