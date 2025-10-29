import { Component, OnInit, signal } from '@angular/core';
import { CustomerResponse } from '../../models/customerResponse';
import { CustomerService } from '../../services/customer-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-info-card',
  imports: [RouterLink],
  templateUrl: './customer-info-card.html',
  styleUrl: './customer-info-card.scss',
})
export class CustomerInfoCard implements OnInit {
  customerResponse = signal<CustomerResponse | undefined>(undefined);
  showDeleteModal = signal<boolean>(false);
  showErrorModal = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.getCustomerInfo();
  }

  getCustomerInfo() {
    const customerId = this.route.snapshot.paramMap.get('customerId');
    
    if (!customerId) {
      console.error('customerId paramı bulunamadı.');
      return;
    }
    
    this.customerService.getCustomerById(customerId).subscribe({
      next: (response) => this.customerResponse.set(response),
      error: (error) => console.error('Error fetching customer:', error)
    }); 
  }

  openDeleteConfirmation() {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
    this.errorMessage.set('');
  }

  confirmDelete() {
    const customerId = this.customerResponse()?.id;
    
    if (!customerId) {
      console.error('Customer ID bulunamadı.');
      return;
    }

    this.customerService.softDeleteCustomer(customerId).subscribe({
      next: () => {
        this.closeDeleteModal();
        // Customer search sayfasına yönlendir
        this.router.navigate(['/search-list']);
      },
      error: (error) => {
        this.closeDeleteModal();
        
        // ACC 5: Active products hatası kontrolü
        if (error.status === 400 || error.error?.message?.includes('active products')) {
          this.errorMessage.set('Since the customer has active products, the customer cannot be deleted.');
        } else {
          this.errorMessage.set('An error occurred while deleting the customer. Please try again.');
        }
        
        this.showErrorModal.set(true);
      }
    });
  }

}
