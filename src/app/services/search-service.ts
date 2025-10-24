// src/app/services/search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchCustomerResponse } from '../models/searchCustomerResponse';

export interface SearchFilters {
  natId?: string;
  customerId?: string;
  accountNumber?: string;
  gsmNumber?: string;
  firstName?: string;
  lastName?: string;
  orderNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = 'http://localhost:8091/searchservice/api/customer-search';
  constructor(private http: HttpClient) {}

  // ES query_string için kritik karakterleri kaçır
  private escapeQS(v: string): string {
    // + - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ / .
    return v.replace(/([+\-=&|><!(){}\[\]^"~*?:\\/\.])/g, '\\$1');
  }

  // first/last için contains, id alanları için exact
  private buildRaw(filters: SearchFilters): string {
    const clauses: string[] = [];

    if (filters.natId)         clauses.push(`nationalId:${this.escapeQS(filters.natId)}`);
    if (filters.customerId)    clauses.push(`customerNumber:${this.escapeQS(filters.customerId)}`);
    if (filters.accountNumber) clauses.push(`accountNumber:${this.escapeQS(filters.accountNumber)}`);
    if (filters.orderNumber)   clauses.push(`orderNumber:${this.escapeQS(filters.orderNumber)}`);

    if (filters.gsmNumber) {
    // basit normalizasyon: yalnız rakamları bırak
    const digits = filters.gsmNumber.replace(/\D+/g, '');
    const esc = this.escapeQS(digits);

    // contactMediums.value içinde farklı formatlar olabilir diye contains kullanalım
    // AND type:phone_number ile birlikte
    // Parantezle tek clause haline getirdik:
    clauses.push(`(gsmNumber:${esc} OR (contactMediums.type:phone_number AND contactMediums.value:*${esc}*))`);
  }

    if (filters.firstName) {
      const v = this.escapeQS(filters.firstName.toLowerCase());
      clauses.push(`firstName:*${v}*`);
    }
    if (filters.lastName) {
      const v = this.escapeQS(filters.lastName.toLowerCase());
      clauses.push(`lastName:*${v}*`);
    }

    // Hepsini açıkça AND’le
    return clauses.join(' AND ');
  }

  searchByFilters(filters: SearchFilters): Observable<SearchCustomerResponse[]> {
    const raw = this.buildRaw(filters);
    const params = new HttpParams().set('keyword', raw);
    return this.http.get<SearchCustomerResponse[]>(`${this.apiUrl}/fulltext`, { params });
  }
}