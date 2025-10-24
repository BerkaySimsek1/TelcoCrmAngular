import { Component } from '@angular/core';
import { SearchCustomerResponse } from '../../models/searchCustomerResponse';
import { SearchService } from '../../services/search-service';
import { SearchCustomerCard } from "../search-customer-card/search-customer-card";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-customer-list',
  templateUrl: './search-customer-list.html',
  styleUrls: ['./search-customer-list.scss'],
  imports: [CommonModule,SearchCustomerCard]
})
export class SearchCustomerList {

  customers: SearchCustomerResponse[] = [];
  loading = false;
  errorMessage = '';

  constructor(private searchService: SearchService) {}

  onSearch(keyword: string) {
    this.loading = true;
    this.errorMessage = '';
    this.customers = [];

    this.searchService.search(keyword).subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Arama sırasında bir hata oluştu.';
        console.error(err);
        this.loading = false;
      }
    });
  }
}


