// src/app/services/catalog-product-offer.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogProductOfferWithDetailResponse } from '../../models/CatalogModels/catalog-product-offer-with-detail';

@Injectable({ providedIn: 'root' })
export class CatalogProductOfferService {
  private readonly baseUrl = 'http://localhost:8091/catalogservice';

  constructor(private http: HttpClient) {}

  getByCatalogId(catalogId: number, activeOnly = false)
    : Observable<CatalogProductOfferWithDetailResponse[]> {
    const url = activeOnly
      ? `${this.baseUrl}/api/catalog-product-offers/by-catalog/${catalogId}/active`
      : `${this.baseUrl}/api/catalog-product-offers/by-catalog/${catalogId}`;
    return this.http.get<CatalogProductOfferWithDetailResponse[]>(url);
  }
}
