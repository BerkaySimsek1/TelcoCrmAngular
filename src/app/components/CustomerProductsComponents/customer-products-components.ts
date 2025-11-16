import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
// Senin istediğin isimlendirmeleri ve yolları kullanıyoruz
import { BillingAccountProductResponse } from '../../models/SalesProductModels/billingAccountProductResponse';
import { CustomerAccProductService } from '../../services/customerAcc-product-service';
@Component({
  selector: 'app-customer-products-components',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-products-components.html',
  styleUrls: ['./customer-products-components.scss'],
})
export class CustomerProductsComponents implements OnInit {
  @Input() billingAccountId!: number; // Dışarıdan fatura hesabı ID'si alınıyor

  products = signal<BillingAccountProductResponse[]>([]);

  constructor(private customerAccProductService: CustomerAccProductService) {} 

  ngOnInit(): void {
    if (this.billingAccountId) {

      // Servisi 'number' ID ile çağır
      this.customerAccProductService.getProductsForBillingAccount(this.billingAccountId)
        .subscribe((products: BillingAccountProductResponse[]) => {
          this.products.set(products);
        });
    }
  }

}