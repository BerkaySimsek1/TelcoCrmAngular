import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingAccountProductResponse } from '../models/SalesProductModels/billingAccountProductResponse'; 

@Injectable({ providedIn: 'root' })
export class CustomerAccProductService {
  // API Gateway + Service Adı + Controller Yolu
  private apiUrl = 'http://localhost:8091/salesservice/api/orders';

  constructor(private http: HttpClient) {}

  /**
   * Bir fatura hesabına bağlı aktif ürünleri getirir.
   * @param billingAccountId Fatura hesabı ID'si
   */
  getProductsForBillingAccount(billingAccountId: number): Observable<BillingAccountProductResponse[]> {
    return this.http.get<BillingAccountProductResponse[]>(
      `${this.apiUrl}/products-by-billing-account/${billingAccountId}`
    );
  }
}