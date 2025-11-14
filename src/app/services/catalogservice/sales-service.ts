// src/app/services/sales-service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrderRequest } from '../../models/CatalogModels/create-order-request';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly baseUrl = 'http://localhost:8091/salesservice';

  constructor(private http: HttpClient) {}

  createOrder(req: CreateOrderRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/orders`, req);
  }
}
