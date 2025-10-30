import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateContactMediumRequest } from '../models/createContactMediumRequest';
import { CreatedContactMediumResponse } from '../models/createdContactMediumResponse';
import { ContactMediumResponse } from '../models/contactMediumResponse';
import { UpdateContactMediumRequest } from '../models/updateContactMediumRequest';
import { UpdatedContactMediumResponse } from '../models/updatedContactMediumResponse';


@Injectable({
  providedIn: 'root'
})
export class ContactMediumService {

  private readonly baseUrl =
    'http://localhost:8091/customerservice';

  constructor(private httpClient: HttpClient) { }


  createContactMedium(req: CreateContactMediumRequest): Observable<CreatedContactMediumResponse[]> {
  return this.httpClient.post<CreatedContactMediumResponse[]>(`${this.baseUrl}/api/contact-mediums/bulk`, req);
  
}
  getContactMediumsById(customerId: string): Observable<ContactMediumResponse> {
    return this.httpClient.get<ContactMediumResponse>(`${this.baseUrl}/api/contact-mediums/customer/${customerId}`);
  }


  updateContactMedium(req: UpdateContactMediumRequest): Observable<UpdatedContactMediumResponse> {
    return this.httpClient.put<UpdatedContactMediumResponse>(`${this.baseUrl}/api/contact-mediums/updateAsList`, req);
  }
}
