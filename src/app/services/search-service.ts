// src/app/services/search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchCustomerResponse } from '../models/SearchModels/searchCustomerResponse';

export interface SearchFilters {
  natId?: string;
  customerId?: string;
  accountNumber?: string;
  gsmNumber?: string;
  firstName?: string;
  lastName?: string;
  orderNumber?: string;
}

// src/app/services/search.service.ts
@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = 'http://localhost:8091/searchservice/api/customer-search';
  constructor(private http: HttpClient) {}

  // page/size ekleyelim (varsayılanları yüksek tut)
  searchByFilters(
    filters: SearchFilters,
    page = 0,
    size = 1000
  ): Observable<SearchCustomerResponse[]> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof SearchFilters];
      if (value) {
        const trimmed = value.trim();
        if (trimmed.length > 0) params = params.set(key, trimmed);
      }
    });

    params = params.set('page', String(page));
    params = params.set('size', String(size));

    return this.http.get<SearchCustomerResponse[]>(`${this.apiUrl}/dynamic-search`, { params });
  }
}
