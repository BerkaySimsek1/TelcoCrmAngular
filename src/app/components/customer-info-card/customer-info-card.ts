import { Component, OnInit, signal } from '@angular/core';
import { CustomerResponse } from '../../models/customerResponse';
import { CustomerService } from '../../services/customer-service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-info-card',
  imports: [RouterLink],
  templateUrl: './customer-info-card.html',
  styleUrl: './customer-info-card.scss',
})
export class CustomerInfoCard implements OnInit {
  customerResponse = signal<CustomerResponse | undefined>(undefined);

  constructor(private route: ActivatedRoute,private customerService: CustomerService) { }

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
}
