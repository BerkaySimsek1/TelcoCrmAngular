// src/app/services/catalog-product-offer.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogProductOfferWithDetailResponse } from '../../models/CatalogModels/catalog-product-offer-with-detail';

@Injectable({ providedIn: 'root' })
export class CatalogProductOfferService {
  private readonly baseUrl = 'http://localhost:8091/catalogservice';

  constructor(private http: HttpClient) {}

  // ✅ default: activeOnly=true, includeChildren=true
  getByCatalogId(
    catalogId: number,
    activeOnly = true,
    includeChildren = true
  ): Observable<CatalogProductOfferWithDetailResponse[]> {

    // aktif endpoint + includeChildren=true paramı
    let url = activeOnly
      ? `${this.baseUrl}/api/catalog-product-offers/by-catalog/${catalogId}/active`
      : `${this.baseUrl}/api/catalog-product-offers/by-catalog/${catalogId}`;

    if (includeChildren) {
      url += (url.includes('?') ? '&' : '?') + 'includeChildren=true';
    }

    return this.http.get<CatalogProductOfferWithDetailResponse[]>(url);
  }
}
