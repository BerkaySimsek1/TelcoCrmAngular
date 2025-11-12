import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Basket } from '../../models/CatalogModels/BasketModels/basket-model';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private readonly baseUrl = 'http://localhost:8091/basketservice';

  constructor(private http: HttpClient) {}

  /** Tekil ProductOffer ekler */
  addProductOffer(billingAccId: number, productOfferId: string, qty = 1): Observable<void> {
    const params = new HttpParams()
      .set('billingAccId', String(billingAccId))
      .set('productOfferId', productOfferId)
      .set('qty', String(qty));
    return this.http.post<void>(`${this.baseUrl}/api/baskets`, null, { params });
  }

  /** CampaignProduct üzerinden ekler (campaignProductId ile) */
  addCampaignProduct(billingAccId: number, campaignProductId: number, qty = 1): Observable<void> {
    const params = new HttpParams()
      .set('billingAccId', String(billingAccId))
      .set('campaignProductId', String(campaignProductId))
      .set('qty', String(qty));
    return this.http.post<void>(`${this.baseUrl}/api/baskets/campaign-products`, null, { params });
  }

  // src/app/services/basket.service.ts

addCampaign(billingAccId: number, campaignId: number): Observable<void> {
  const params = new HttpParams()
    .set('billingAccId', String(billingAccId))
    .set('campaignId', String(campaignId));
  return this.http.post<void>(`${this.baseUrl}/api/baskets/campaigns`, null, { params });
}


  /** Sepeti (tümü) getirip, FE tarafında billingAccId ile filtreleriz */
  getForBilling(billingAccId: number): Observable<Basket | null> {
  return this.http.get<Basket>(`${this.baseUrl}/api/baskets/${billingAccId}`)
    .pipe(catchError(() => of(null)));
}


  /** Tekil sepet item silme */
  deleteItem(billingAccId: number, basketItemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/baskets/${billingAccId}/items/${basketItemId}`);
  }

  /** Sepeti tamamen temizle */
  clear(billingAccId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/baskets/${billingAccId}`);
  }


  deleteCampaign(billingAccId: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/api/baskets/${billingAccId}/campaign`);
  }

}
