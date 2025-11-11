import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActiveCampaignProductResponse } from '../../models/CatalogModels/CampaignModels/active-campaign-product-response';

export interface GetCampaignProductOfferResponse {
  campaignId: number;
  productOfferId: string;
  productOfferName: string;
}

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

  // Campaign ID'ye göre ara
  searchByCampaignId(campaignId: number): Observable<GetCampaignProductOfferResponse[]> {
    if (campaignId === null || campaignId === undefined || campaignId === 0) {
      return throwError(() => new Error('Campaign ID cannot be empty.'));
    }
    if (campaignId < 1) {
      return throwError(() => new Error('Campaign ID must be greater than or equal to 1.'));
    }
    return this.http.get<GetCampaignProductOfferResponse[]>(
      `${this.baseUrl}/api/campaign-products/search/by-id?campaignId=${campaignId}`
    ).pipe(
      catchError(error => {
        console.error('Search by campaign ID error:', error);
        return throwError(() => error);
      })
    );
  }

  // Campaign Name'e göre ara
  searchByCampaignName(campaignName: string): Observable<GetCampaignProductOfferResponse[]> {
    if (!campaignName || campaignName.trim() === '') {
      return throwError(() => new Error('Campaign name cannot be empty.'));
    }
    return this.http.get<GetCampaignProductOfferResponse[]>(
      `${this.baseUrl}/api/campaign-products/search/by-name?campaignName=${encodeURIComponent(campaignName.trim())}`
    ).pipe(
      catchError(error => {
        console.error('Search by campaign name error:', error);
        return throwError(() => error);
      })
    );
  }
}