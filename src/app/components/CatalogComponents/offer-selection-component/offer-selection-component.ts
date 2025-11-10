import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CatalogItem } from '../../../models/CatalogModels/catalog-model';
import { CatalogProductOfferWithDetailResponse } from '../../../models/CatalogModels/catalog-product-offer-with-detail';
import { CatalogService } from '../../../services/catalogservice/catalog-service';
import { CatalogProductOfferService } from '../../../services/catalogservice/catalog-product-offer-service';
import { BasketComponent } from '../basket-component/basket-component';

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
  activeOnly = signal(true);
  
  // Selected offers for basket
  selectedOffers = signal<Set<string>>(new Set());
  basketItems = signal<BasketItem[]>([]);

  // Filters
  filterId = signal<string>('');
  filterName = signal<string>('');
  applyFilterToggle = signal(0);

  // Active tab
  activeTab = signal<'catalog' | 'campaign'>('catalog');

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

  constructor(
    private route: ActivatedRoute,
    private catalogApi: CatalogService,
    private cpoApi: CatalogProductOfferService
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
    this.loadOffers();
  }

  loadOffers() {
    const id = this.selectedCatalogId();
    if (!id) return;
    this.loading.set(true);

    this.cpoApi.getByCatalogId(id, this.activeOnly()).subscribe({
      next: data => this.offers.set(data),
      error: err => {
        console.error('getByCatalogId error:', err);
        this.offers.set([]);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  onSearchClick() {
    this.applyFilterToggle.set(this.applyFilterToggle() + 1);
  }

  toggleOfferSelection(offer: CatalogProductOfferWithDetailResponse) {
    const selected = new Set(this.selectedOffers());
    
    if (selected.has(offer.productOfferId)) {
      selected.delete(offer.productOfferId);
      // Remove from basket
      this.basketItems.set(
        this.basketItems().filter(item => item.id !== String(offer.productOfferId))
      );
    } else {
      selected.add(offer.productOfferId);
      // Add to basket
      //const newItem: BasketItem = {
        //id: String(offer.productOfferId),
        //name: offer.productOfferName || 'Unknown',
       // description: offer.description,
       // price: offer.price || 0
     // };
     // this.basketItems.set([...this.basketItems(), newItem]);
    }
    
    this.selectedOffers.set(selected);
  }

  isOfferSelected(offerId: string): boolean {
    return this.selectedOffers().has(offerId);
  }

  addToBasket() {
    // Already handled in toggleOfferSelection
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
    // Navigate to next step
  }
}