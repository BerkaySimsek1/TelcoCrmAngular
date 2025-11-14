import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductResponse } from '../../models/CatalogModels/CampaignModels/product-response';
import { ProductConfigMeta } from '../../models/CatalogModels/product-config-meta';
export interface GetListSearchProductOfferResponse {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductOfferService {
  private readonly baseUrl = 'http://localhost:8091/catalogservice';

  constructor(private http: HttpClient) {}

  searchById(id: string): Observable<GetListSearchProductOfferResponse[]> {
    if (!id || id.trim() === '') {
      return throwError(() => new Error('Product Offer ID cannot be empty.'));
    }
    return this.http.get<GetListSearchProductOfferResponse[]>(
      `${this.baseUrl}/api/product-offers/search/by-id?id=${encodeURIComponent(id.trim())}`
    ).pipe(
      catchError(error => {
        console.error('Search by ID error:', error);
        return throwError(() => error);
      })
    );
  }

  searchByName(name: string): Observable<GetListSearchProductOfferResponse[]> {
    if (!name || name.trim() === '') {
      return throwError(() => new Error('Product Offer name cannot be empty.'));
    }
    return this.http.get<GetListSearchProductOfferResponse[]>(
      `${this.baseUrl}/api/product-offers/search/by-name?name=${encodeURIComponent(name.trim())}`
    ).pipe(
      catchError(error => {
        console.error('Search by name error:', error);
        return throwError(() => error);
      })
    );
  }
   // backend: GET /api/product-offers/{id}/for-basket
  getForBasket(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/api/product-offers/${id}/for-basket`);
  }


  getConfigMeta(id: string): Observable<ProductConfigMeta> {
  return this.http.get<ProductConfigMeta>(
    `${this.baseUrl}/api/product-offers/${id}/config-meta`
  );
}

}

