import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressService } from '../../services/address-service';
import { AddressResponse } from '../../models/addressResponse';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-list.html',
  styleUrl: './address-list.scss',
})
export class AddressListComponent implements OnInit {
  addresses = signal<AddressResponse[]>([]);
  loading = signal(true);
  customerId!: string;
  showDeleteModal = signal<boolean>(false);
  showErrorModal = signal<boolean>(false);
  errorMessage = signal<string>('');
  addressToDelete = signal<number | null>(null);

  constructor(
    private addressService: AddressService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('customerId');
    if (!idFromRoute) {
      console.error('customerId paramı bulunamadı.');
      return;
    }
    this.customerId = idFromRoute;
    this.loadAddresses();
  }

  private loadAddresses() {
    this.loading.set(true);
    this.addressService.getAddressByCustomerId(this.customerId).subscribe({
      next: (res) => {
        // API tek obje dönerse de diziye çevir
        this.addresses.set(Array.isArray(res) ? res : [res]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Adresler alınamadı:', err);
        this.addresses.set([]);
        this.loading.set(false);
      },
    });
  }

  addNewAddress() {
    // Create address sayfasına yönlendir
    this.router.navigate(['/create-address', this.customerId]);
  }

  editAddress(addressId: number) {
    this.router.navigate(['/address-update', this.customerId, addressId]);
  }

  deleteAddress(addressId: number) {
    this.addressToDelete.set(addressId);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.addressToDelete.set(null);
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
    this.errorMessage.set('');
  }

  confirmDelete() {
    const addressId = this.addressToDelete();
    
    if (addressId === null) {
      console.error('Address ID bulunamadı.');
      return;
    }

    this.addressService.softDeleteAddress(addressId).subscribe({
      next: () => {
        this.closeDeleteModal();
        // Listeyi yeniden yükle
        this.loadAddresses();
      },
      error: (error) => {
        this.closeDeleteModal();
        this.errorMessage.set('An error occurred while deleting the address. Please try again.');
        this.showErrorModal.set(true);
        console.error('Delete error:', error);
      }
    });
  }

  goToPrevious() {
    // Önceki sayfaya dön
    this.router.navigate(['/customer-info', this.customerId]);
  }

  goToNext() {
    // Sonraki sayfaya geç
    this.router.navigate(['/next-step', this.customerId]);
  }
}