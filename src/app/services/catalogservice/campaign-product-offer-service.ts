import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActiveCampaignProductResponse } from '../../models/CatalogModels/CampaignModels/active-campaign-product-response';

@Injectable({ providedIn: 'root' })
export class CampaignProductOfferService {
  private readonly baseUrl = 'http://localhost:8091/catalogservice';

  constructor(private http: HttpClient) {}

  // Tüm aktif campaign-product ilişkileri (backend: GET /api/campaign-products/active)
  getAllActive(): Observable<ActiveCampaignProductResponse[]> {
    return this.http.get<ActiveCampaignProductResponse[]>(
      `${this.baseUrl}/api/campaign-products/active`
    );
  }

  // Gerekirse: belirli ProductOffer için en iyi kampanya (backend hazır)
  getBestActiveForProduct(productOfferId: string): Observable<ActiveCampaignProductResponse> {
    return this.http.get<ActiveCampaignProductResponse>(
      `${this.baseUrl}/api/campaign-products/active/${productOfferId}`
    );
  }
}
