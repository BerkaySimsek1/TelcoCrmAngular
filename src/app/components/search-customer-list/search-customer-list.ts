import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchCustomerResponse } from '../../models/searchCustomerResponse';

@Component({
  selector: 'app-search-customer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-customer-list.html'
})
export class SearchCustomerListComponent {
  @Input({ required: true }) results: SearchCustomerResponse[] = [];
  @Input() loading = false;
  @Input() searched = false;

  @Output() createCustomer = new EventEmitter<void>();

  pageSize = 20;
  currentPage = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil((this.results?.length ?? 0) / this.pageSize)));

  get pageSlice(): SearchCustomerResponse[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return (this.results ?? []).slice(start, start + this.pageSize);
  }

  go(p: number) {
    const t = this.totalPages();
    if (p < 1 || p > t) return;
    this.currentPage.set(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ACC-8: Customer Info ekranına yönlendir
  constructor(private router: Router) {}
  openCustomerInfo(item: SearchCustomerResponse) {
    this.router.navigate(['/customer', item.id]);
  }
}
