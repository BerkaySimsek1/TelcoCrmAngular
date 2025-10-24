import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchCustomerResponse } from '../models/searchCustomerResponse';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private apiUrl = 'http://localhost:8091/searchservice/api/customer-search'; // backend controller base URL

  constructor(private http: HttpClient) { }

  search(keyword: string): Observable<SearchCustomerResponse[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<SearchCustomerResponse[]>(`${this.apiUrl}/fulltext?`, { params });
  }

}

