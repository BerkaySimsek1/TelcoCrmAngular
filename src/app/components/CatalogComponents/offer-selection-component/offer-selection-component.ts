import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CatalogItem } from '../../../models/CatalogModels/catalog-model';
import { CatalogProductOfferWithDetailResponse } from '../../../models/CatalogModels/catalog-product-offer-with-detail';
import { CatalogService } from '../../../services/catalogservice/catalog-service';
import { CatalogProductOfferService } from '../../../services/catalogservice/catalog-product-offer-service';
import { BasketComponent } from '../basket-component/basket-component';
import { GetListSearchProductOfferResponse } from '../../../models/CatalogModels/getListSearchProductOfferResponse';
import { ProductOfferService } from '../../../services/catalogservice/product-offer-service';

export interface BasketItem {
  id: string;
  name: string;
  description?: string;
  price: number;
}

@Component({
  selector: 'app-offer-selection',
  standalone: true,
  imports: [CommonModule, BasketComponent],
  templateUrl: './offer-selection-component.html',
  styleUrls: ['./offer-selection-component.scss'],
})
export class OfferSelectionComponent implements OnInit {
  catalogs = signal<CatalogItem[]>([]);
  selectedCatalogId = signal<number | null>(null);
  offers = signal<CatalogProductOfferWithDetailResponse[]>([]);
  loading = signal(false);

  // filtreler
  activeOnly = signal(true);
  includeChildren = signal(true);

  // Basket
  selectedOffers = signal<Set<string>>(new Set());
  basketItems = signal<BasketItem[]>([]);

  // Filters
  filterId = signal<string>('');
  filterName = signal<string>('');
  applyFilterToggle = signal(0);

  // Tab
  activeTab = signal<'catalog' | 'campaign'>('catalog');

  // Search Mode
  searchResults = signal<GetListSearchProductOfferResponse[]>([]);
  isSearchMode = signal(false);
  searchError = signal<string>('');

  filteredOffers = computed(() => {
    this.applyFilterToggle();
    const idText = this.filterId().trim();
    const nameText = this.filterName().trim().toLowerCase();

    return this.offers().filter(o => {
      const idOk = idText ? String(o.productOfferId).includes(idText) : true;
      const nameOk = nameText ? (o.productOfferName ?? '').toLowerCase().includes(nameText) : true;
      return idOk && nameOk;
    });
  });

  searchFilteredResults = computed(() => {
    return this.searchResults();
  });

  constructor(
    private route: ActivatedRoute,
    private catalogApi: CatalogService,
    private cpoApi: CatalogProductOfferService,
    private productOfferService: ProductOfferService
  ) {}

  ngOnInit(): void {
    this.catalogApi.getCatalogItems().subscribe(cs => this.catalogs.set(cs));
  }

  onTabChange(tab: 'catalog' | 'campaign') {
    this.activeTab.set(tab);
  }

  onCatalogChange(val: string) {
    const id = Number(val);
    if (Number.isNaN(id)) return;
    this.selectedCatalogId.set(id);
    this.isSearchMode.set(false);
    this.searchResults.set([]);
    this.filterId.set('');
    this.filterName.set('');
    this.searchError.set('');
    this.loadOffers();
  }

  loadOffers() {
    const id = this.selectedCatalogId();
    if (!id) return;
    this.loading.set(true);

    this.cpoApi.getByCatalogId(id, true, true).subscribe({
      next: data => this.offers.set(data),
      error: err => {
        console.error('getByCatalogId error:', err);
        this.offers.set([]);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  onToggleActiveOnly(val: boolean) {
    this.activeOnly.set(val);
    this.loadOffers();
  }

  onToggleIncludeChildren(val: boolean) {
    this.includeChildren.set(val);
    this.loadOffers();
  }

  onSearchClick() {
    const id = this.filterId().trim();
    const name = this.filterName().trim();

    // Eğer ikisi de boş ise
    if (!id && !name) {
      this.searchError.set('Lütfen ID veya Ad alanlarından birini doldurunuz.');
      this.isSearchMode.set(false);
      this.searchResults.set([]);
      return;
    }

    this.loading.set(true);
    this.searchError.set('');
    this.isSearchMode.set(true);

    // İlk olarak ID'yi ara, ID boşsa Name ile ara
    const searchObservable = id 
      ? this.productOfferService.searchById(id)
      : this.productOfferService.searchByName(name);

    searchObservable.subscribe({
      next: data => {
        this.searchResults.set(data);
        this.loading.set(false);
      },
      error: err => {
        console.error('Search error:', err);
        this.searchError.set(err?.error?.message || 'Sonuç bulunamadı. Lütfen arama parametrelerini kontrol ediniz.');
        this.searchResults.set([]);
        this.loading.set(false);
      }
    });
  }

  toggleOfferSelection(offer: CatalogProductOfferWithDetailResponse) {
    const selected = new Set(this.selectedOffers());
    const key = String(offer.productOfferId);

    if (selected.has(key)) {
      selected.delete(key);
      this.basketItems.set(this.basketItems().filter(item => item.id !== key));
    } else {
      selected.add(key);
    }
    this.selectedOffers.set(selected);
  }

  toggleSearchResultSelection(id: string, name: string) {
    const selected = new Set(this.selectedOffers());
    const key = id;

    if (selected.has(key)) {
      selected.delete(key);
      this.basketItems.set(this.basketItems().filter(item => item.id !== key));
    } else {
      selected.add(key);
    }
    this.selectedOffers.set(selected);
  }

  isOfferSelected(offerId: string): boolean {
    return this.selectedOffers().has(offerId);
  }

  addToBasket() {
    console.log('Basket items:', this.basketItems());
  }

  onRemoveFromBasket(itemId: string) {
    this.basketItems.set(this.basketItems().filter(item => item.id !== itemId));
    const selected = new Set(this.selectedOffers());
    selected.delete(itemId);
    this.selectedOffers.set(selected);
  }

  onClearBasket() {
    this.basketItems.set([]);
    this.selectedOffers.set(new Set());
  }

  onNextClick() {
    console.log('Proceeding with basket items:', this.basketItems());
  }
}