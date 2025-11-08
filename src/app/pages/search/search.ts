import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchCustomerResponse } from '../../models/SearchModels/searchCustomerResponse';
import { Router } from '@angular/router';
import { SearchFilters, SearchService } from '../../services/search-service';
import { SearchCustomerCard } from '../../components/SearchComponents/search-customer-card/search-customer-card';
import { SearchCustomerListComponent } from '../../components/SearchComponents/search-customer-list/search-customer-list';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SearchCustomerCard, SearchCustomerListComponent],
  templateUrl: './search.html'
})
export class Search {
  results = signal<SearchCustomerResponse[]>([]);  // ✅ Signal olarak tanımla
  loading = signal(false);
  searched = signal(false);

  constructor(private searchService: SearchService, private router: Router) {}

  onSearch(filters: SearchFilters) {
    this.loading.set(true);
    this.searched.set(false);
    this.results.set([]);  // ✅ Signal'ı güncelle

    this.searchService.searchByFilters(filters).subscribe({
      next: (res) => { 
        this.results.set(res ?? []);  // ✅ Signal.set() kullan
        this.loading.set(false); 
        this.searched.set(true); 
      },
      error: () => { 
        this.results.set([]);  // ✅ Signal.set() kullan
        this.loading.set(false); 
        this.searched.set(true); 
      }
    });
  }

  onCleared() {
    this.results.set([]);  // ✅ Signal.set() kullan
    this.searched.set(false);
  }

  goCreate() {
    this.router.navigate(['/create-customer']);
  }
}