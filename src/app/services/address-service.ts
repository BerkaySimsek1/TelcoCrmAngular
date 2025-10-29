import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateAddressRequest } from '../models/createAddressRequest';
import { AddressResponse } from '../models/addressResponse';
import { CreatedAddressResponse } from '../models/createdAddressResponse';
import { DistrictResponse } from '../models/districtResponse';
import { CityResponse } from '../models/cityResponse';
import { UpdateAddressRequest } from '../models/updateAddressRequest';
import { UpdatedAddressResponse } from '../models/updatedAddressResponse';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private readonly baseUrl =
    'http://localhost:8091/customerservice';

  constructor(private httpClient: HttpClient) { }

  createAddress(req: CreateAddressRequest): Observable<CreatedAddressResponse> {
    return this.httpClient.post<CreatedAddressResponse>(`${this.baseUrl}/api/addresses`, req);
  }


  getAddressByCustomerId(customerId: string): Observable<AddressResponse> {
    return this.httpClient.get<AddressResponse>(`${this.baseUrl}/api/addresses/findByCustomerId/${customerId}`);
  }

  getDistrictByCityId(cityId:number):Observable<DistrictResponse> {
    return this.httpClient.get<DistrictResponse>(`${this.baseUrl}/api/districts/findByCityId/${cityId}`);
  }
  getCity():Observable<CityResponse> {
    return this.httpClient.get<CityResponse>(`${this.baseUrl}/api/cities`);
  }

  updateAddress(id: number, req: UpdateAddressRequest): Observable<UpdatedAddressResponse> {
      return this.httpClient.put<UpdatedAddressResponse>(`${this.baseUrl}/api/addresses/${id}`, req);
  }

  softDeleteAddress(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/api/addresses/${id}/soft`);
  }
}