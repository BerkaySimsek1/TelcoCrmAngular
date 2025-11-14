// src/app/services/product-config-meta.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ProductConfigMeta } from '../../models/CatalogModels/product-config-meta';


@Injectable({ providedIn: 'root' })
export class ProductConfigMetaService {
  private readonly baseUrl = 'http://localhost:8091/catalogservice';

  constructor(private http: HttpClient) {}

  /**
   * Tek bir productOffer için meta getirir.
   * BURADA URL'Yİ backend'de zaten olan endpoint'e göre sen değiştireceksin.
   * Örn: /api/product-offers/{id}/config-meta gibi.
   */
  getMetaForProductOffer(productOfferId: string): Observable<ProductConfigMeta> {
    return this.http.get<ProductConfigMeta>(
      `${this.baseUrl}/api/product-offers/${productOfferId}/config-meta`
    );
  }

  /**
   * Sepetteki tüm productOfferId'ler için paralel meta çağrısı.
   */
  getMetaForMany(productOfferIds: string[]): Observable<ProductConfigMeta[]> {
    const unique = Array.from(new Set(productOfferIds));
    if (unique.length === 0) {
      return new Observable<ProductConfigMeta[]>((sub) => {
        sub.next([]);
        sub.complete();
      });
    }

    const calls = unique.map((id) => this.getMetaForProductOffer(id));
    return forkJoin(calls);
  }
}
