import { Component, EventEmitter, Output, computed, signal, OnInit, ChangeDetectionStrategy, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchCustomerResponse } from '../../../models/SearchModels/searchCustomerResponse';

@Component({
  selector: 'app-search-customer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-customer-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchCustomerListComponent implements OnInit {
  // Signal input kullan
  results = input<SearchCustomerResponse[]>([]);
  loading = input(false);
  searched = input(false);

  @Output() createCustomer = new EventEmitter<void>();

  currentPage = signal(1);
  itemsPerPage = 1;
  
  totalPages = computed(() => 
    Math.max(1, Math.ceil((this.results()?.length ?? 0) / this.itemsPerPage))
  );

  constructor(private router: Router) {}

  ngOnInit() {
    // results değiştiğinde otomatik olarak sayfa 1'e dön
    effect(() => {
      if (this.results().length >= 0) {
        this.currentPage.set(1);
      }
    });
  }

  // Sayfalanmış verileri dönen method
  getPaginatedResults(): SearchCustomerResponse[] {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return (this.results() ?? []).slice(startIndex, endIndex);
  }

  // Sayfa numaralarını oluştur (ellipsis ile)
  getPageNumbers(): (number | string)[] {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      // 5 ya da daha az sayfa varsa hepsini göster
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // İlk sayfa
      pages.push(1);

      // Mevcut sayfanın etrafındaki sayfalar
      const startRange = Math.max(2, currentPage - 1);
      const endRange = Math.min(totalPages - 1, currentPage + 1);

      if (startRange > 2) {
        pages.push('...');
      }

      for (let i = startRange; i <= endRange; i++) {
        pages.push(i);
      }

      if (endRange < totalPages - 1) {
        pages.push('...');
      }

      // Son sayfa
      pages.push(totalPages);
    }

    return pages;
  }

  // Belirtilen sayfaya git
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Önceki sayfaya git
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(val => val - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Sonraki sayfaya git
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(val => val + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openCustomerInfo(item: SearchCustomerResponse) {
    this.router.navigate(['/customer', item.id]);
  }
}