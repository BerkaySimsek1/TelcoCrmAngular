import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingAccountProductResponse } from '../models/SalesProductModels/billingAccountProductResponse'; 
import { OrderProductDetailResponse } from '../models/SalesProductModels/orderProductDetailResponse';


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
  /**
   * Ürün silme işlemi
   * @param productId Silinecek ürünün ID'si
   */
  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}`);
  }
    /**
   * Ürün detaylarını getirir (MongoDB _id ile)
   * @param productId MongoDB _id
   */
  getProductDetails(productId: string): Observable<OrderProductDetailResponse> {
    return this.http.get<OrderProductDetailResponse>(
      `${this.apiUrl}/products/${productId}/details`
    );
  }
}