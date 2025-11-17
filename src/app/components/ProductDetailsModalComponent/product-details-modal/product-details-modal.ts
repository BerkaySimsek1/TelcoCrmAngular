import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
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

  constructor(
    private addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';

        if (this.product) {
          this.tryLoadAddress();
        }
      } else {
        document.body.style.overflow = 'auto';
        this.resetAddressState();
      }

      this.cdr.markForCheck();
    }

    if (changes['product'] && this.isOpen) {
      this.tryLoadAddress();
      this.cdr.markForCheck();
    }
  }

  private tryLoadAddress(): void {
    this.addressDetails = null;
    this.addressLoading = false;
    this.addressError = false;
    this.addressErrorMessage = '';

    if (this.product && this.product.addressId != null) {
      this.loadAddressDetails(this.product.addressId);
    } else {
      this.addressError = true;
      this.addressErrorMessage = 'Address ID not found.';
    }

    this.cdr.markForCheck();
  }

  private loadAddressDetails(addressId: number): void {
    this.addressLoading = true;
    this.addressError = false;
    this.addressErrorMessage = '';
    this.cdr.markForCheck();

    this.addressService.getAddressById(addressId).subscribe({
      next: (address: AddressResponse) => {
        this.addressDetails = address;
        this.addressLoading = false;
        this.addressError = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.addressError = true;
        this.addressErrorMessage =
          err.error?.message || 'Cannot load address info. Please try again later.';
        this.addressLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private resetAddressState(): void {
    this.addressDetails = null;
    this.addressError = false;
    this.addressErrorMessage = '';
    this.addressLoading = false;
    this.cdr.markForCheck();
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
