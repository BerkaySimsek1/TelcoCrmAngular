import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateBillingAccountRequest } from '../models/BillingAccountModels/createBillingAccountRequest';
import { CreatedBillingAccountResponse } from '../models/BillingAccountModels/createdBillingAccountResponse';
import { Observable } from 'rxjs/internal/Observable';
import { UpdateBillingAccountRequest } from '../models/BillingAccountModels/updateBillingAccountRequest';
import { UpdatedBillingAccountResponse } from '../models/BillingAccountModels/updatedBillingAccountResponse';
import { BillingAccountResponse } from '../models/BillingAccountModels/billingAccountResponse';

@Injectable({
  providedIn: 'root'
})
export class BillingAccountServiceTs {
  private readonly baseUrl =
    'http://localhost:8091/customerservice';

  constructor(private httpClient: HttpClient) { }

  createBillingAccount(req: CreateBillingAccountRequest): Observable<CreatedBillingAccountResponse> {
      return this.httpClient.post<CreatedBillingAccountResponse>(`${this.baseUrl}/api/billing-accounts`, req);
  }

  updateBillingAccount(id: number, req: UpdateBillingAccountRequest): Observable<UpdatedBillingAccountResponse> {
        return this.httpClient.put<UpdatedBillingAccountResponse>(`${this.baseUrl}/api/billing-accounts/${id}`, req);
  }

  getBillingAccountByCustomerId(customerId: string): Observable<BillingAccountResponse[]> {
    return this.httpClient.get<BillingAccountResponse[]>(
      `${this.baseUrl}/api/billing-accounts/findActiveByCustomerId/${customerId}`
    );  
  }
  deleteBillingAccount(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/api/billing-accounts/${id}`);
  }
}
