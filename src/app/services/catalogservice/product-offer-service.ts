import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../models/CatalogModels/CampaignModels/product-response';

@Injectable({
  providedIn: 'root'
})
export class ProductOfferService {
  private readonly baseUrl = 'http://localhost:8091/catalogservice';

  constructor(private http: HttpClient) {}

  // backend: GET /api/product-offers/{id}/for-basket
  getForBasket(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/api/product-offers/${id}/for-basket`);
  }

}
