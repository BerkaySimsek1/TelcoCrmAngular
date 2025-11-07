import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CatalogItem } from '../../models/CatalogModels/catalog-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly baseUrl = 'http://localhost:8091/catalogservice';

  constructor(private httpClient: HttpClient) {}

  getCatalogItems(): Observable<CatalogItem[]> {
    return this.httpClient.get<CatalogItem[]>(`${this.baseUrl}/api/catalogs/`);
  }

}
