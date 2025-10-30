import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateCustomerRequest } from '../models/createCustomerRequest';
import { CreatedCustomerRespose } from '../models/createdCustomerResponse';
import { CustomerResponse } from '../models/customerResponse';
import { UpdateCustomerRequest } from '../models/updateCustomerRequest';
import { UpdatedCustomerResponse } from '../models/updatedCustomerResponse';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly baseUrl =
    'http://localhost:8091/customerservice';

  constructor(private httpClient: HttpClient) { }

  createCustomer(req: CreateCustomerRequest): Observable<CreatedCustomerRespose> {
    return this.httpClient.post<CreatedCustomerRespose>(`${this.baseUrl}/api/individual-customers/`, req);
  }


  getCustomerById(id: string): Observable<CustomerResponse> {
    return this.httpClient.get<CustomerResponse>(`${this.baseUrl}/api/individual-customers/getById/${id}`);
  }


  updateCustomer(id: string, req: UpdateCustomerRequest): Observable<UpdatedCustomerResponse> {
    return this.httpClient.put<UpdatedCustomerResponse>(`${this.baseUrl}/api/individual-customers/${id}`, req);
  }

  softDeleteCustomer(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/api/individual-customers/${id}/soft`);
  }

existsByNationalId(nationalId: string): Observable<boolean> {
  return this.httpClient.get<boolean>(`${this.baseUrl}/api/individual-customers/existsByNationalId/${nationalId}`);
}

}
