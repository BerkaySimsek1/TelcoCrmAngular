import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressService } from '../../services/address-service';
import { AddressResponse } from '../../models/addressResponse';
import { FullCustomerCreationService } from '../../services/full-customer-creation-service';
import { CreateFlowMode } from '../../shared/create-flow-mode';

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
  mode!: CreateFlowMode;

  constructor(
    private addressService: AddressService,
    private router: Router,
    private route: ActivatedRoute,
    private fullCustomer: FullCustomerCreationService
  ) {}

ngOnInit(): void {
  this.mode =
    (this.route.snapshot.data['mode'] as 'wizard' | 'standalone') ??
    (this.route.snapshot.paramMap.get('customerId') ? 'standalone' : 'wizard');

  if (this.mode === 'wizard') {
    const wizardAddrs = this.fullCustomer.state().addresses || [];
    this.addresses.set(
      wizardAddrs.map((a, idx) => ({
        id: idx + 1,
        street: a.street,
        houseNumber: a.houseNumber,
        description: a.description,
        default: a.default
      } as AddressResponse))
    );
    this.loading.set(false);
  } else {
    // ✅ customerId’yi instance alanına ATA
    const customerIdFromRoute = this.route.snapshot.paramMap.get('customerId');
    if (!customerIdFromRoute) {
      console.error('customerId paramı bulunamadı.');
      this.loading.set(false);
      return;
    }
    this.customerId = customerIdFromRoute;            // <<<<<<  önemli
    this.loadAddresses(this.customerId);              // instance’ı kullan
  }
}

  private loadAddresses(customerId: string) {
    this.loading.set(true);
    this.addressService.getAddressByCustomerId(customerId).subscribe({
      next: (res) => {
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
    if (this.mode === 'wizard') {
      this.router.navigate(['/onboarding/addresses/new']);
    } else {
      this.router.navigate(['/customers', this.customerId, 'addresses', 'new']);
    }
  }

  editAddress(addressId: number) {
    if (this.mode === 'wizard') {
      // Wizard’da editi basit tut: istersen state içinden sile/sun ve /new’e yönlendir
      this.router.navigate(['/onboarding/addresses/new'], { queryParams: { edit: addressId } });
    } else {
      this.router.navigate(['/customers', this.customerId, 'addresses', addressId]);
    }
  }

  deleteAddress(addressId: number) {
    if (this.mode === 'wizard') {
      // state’ten çıkar
      const current = this.fullCustomer.state();
      const newList = (current.addresses || []).filter((_, idx) => idx + 1 !== addressId);
      this.fullCustomer.state.set({ ...current, addresses: newList });

      // UI’ı güncelle
      this.addresses.set(this.addresses().filter(a => a.id !== addressId));
      return;
    }

    // standalone: API soft delete
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
    if (addressId === null) return;

    if (this.mode === 'wizard') {
      // zaten deleteAddress içinde state’ten sildik; modal’ı sadece kapat
      this.closeDeleteModal();
      return;
    }

    // standalone
    this.addressService.softDeleteAddress(addressId).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadAddresses(this.customerId!);
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
    if (this.mode === 'wizard') {
      this.router.navigate(['/create-customerr']);
    } else {
      this.router.navigate(['/customer-info', this.customerId]);
    }
  }

  goToNext() {
    if (this.mode === 'wizard') {
      // wizard’da sonraki adım contact medium
      this.router.navigate(['/create-contactmedium']);
    } else {
      // standalone’da next yok; istersen gizle
      this.router.navigate(['/customer-info', this.customerId]);
    }
  }
}