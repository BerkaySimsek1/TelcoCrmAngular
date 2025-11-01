import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateFullCustomerRequest } from '../models/createFullCustomerModels/createFullCustomerRequest';
import { CreateFullCustomerResponse } from '../models/createFullCustomerModels/createFullCustomerResponse';

@Injectable({ providedIn: 'root' })
export class CustomerOnboardingApi {
  private base = 'http://localhost:8091/customerservice'; // controller’da da böyle verdim

  constructor(private http: HttpClient) {}

  createFull(req: CreateFullCustomerRequest): Observable<CreateFullCustomerResponse> {
    return this.http.post<CreateFullCustomerResponse>(`${this.base}/api/onboarding/customers/full`, req);
  }
}