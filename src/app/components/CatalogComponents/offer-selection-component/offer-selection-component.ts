import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// CATALOG tarafı
import { CatalogItem } from '../../../models/CatalogModels/catalog-model';
import { CatalogProductOfferWithDetailResponse } from '../../../models/CatalogModels/catalog-product-offer-with-detail';
import { CatalogService } from '../../../services/catalogservice/catalog-service';
import { CatalogProductOfferService } from '../../../services/catalogservice/catalog-product-offer-service';
import { BasketComponent } from '../basket-component/basket-component';
import { GetListSearchProductOfferResponse } from '../../../models/CatalogModels/getListSearchProductOfferResponse';
import { ProductOfferService } from '../../../services/catalogservice/product-offer-service';
import { CampaignOfferRow } from '../../../models/CatalogModels/CampaignModels/campaign-offer-row';
import { CampaignProductOfferService, GetCampaignProductOfferResponse } from '../../../services/catalogservice/campaign-product-offer-service';
import { BasketService } from '../../../services/catalogservice/basket-service';
import { Basket } from '../../../models/CatalogModels/BasketModels/basket-model';
import { catchError, of, throwError } from 'rxjs';
import { BasketItem } from '../../../models/CatalogModels/BasketModels/basket-item';
import { OrderCreationService } from '../../../services/catalogservice/order-creation-service';


@Component({
  selector: 'app-offer-selection',
  standalone: true,
  imports: [CommonModule, BasketComponent],
  templateUrl: './offer-selection-component.html',
  styleUrls: ['./offer-selection-component.scss'],
})
export class OfferSelectionComponent implements OnInit {
  billingAccountId = signal<number | null>(null);
  catalogs = signal<CatalogItem[]>([]);
  selectedCatalogId = signal<number | null>(null);
  offers = signal<CatalogProductOfferWithDetailResponse[]>([]);
  loading = signal(false);

  activeOnly = signal(true);
  includeChildren = signal(true);

  selectedOffers = signal<Set<string>>(new Set());
  basketItems = signal<BasketItem[]>([]);

  filterId = signal<string>('');
  filterName = signal<string>('');
  applyFilterToggle = signal(0);

  private cpidToCid = new Map<number, number>();

  // -------------------- TABS --------------------
  activeTab = signal<'catalog' | 'campaign'>('catalog');

  // Search Mode
  searchResults = signal<GetListSearchProductOfferResponse[]>([]);
  isSearchMode = signal(false);
  searchError = signal<string>('');

  filteredOffers = computed(() => {
    this.applyFilterToggle();
    const idText = this.filterId().trim();
    const nameText = this.filterName().trim().toLowerCase();

    return this.offers().filter((o) => {
      const idOk = idText ? String(o.productOfferId).includes(idText) : true;
      const nameOk = nameText
        ? (o.productOfferName ?? '').toLowerCase().includes(nameText)
        : true;
      return idOk && nameOk;
    });
  });

  searchFilteredResults = computed(() => {
    return this.searchResults();
  });

  // -------------------- CAMPAIGN (yeni) --------------------
  campaignLoading = signal(false);
  campaignOptions = signal<{ id: number; name: string }[]>([]);
  selectedCampaignId = signal<number | null>(null);

  campaignRows = signal<CampaignOfferRow[]>([]);
  campaignSelected = signal<Set<string>>(new Set());
  campaignBasket = signal<CampaignOfferRow[]>([]);

  campaignFilterCampaignId = signal<string>('');
  campaignFilterCampaignName = signal<string>('');
  campaignApplyFilterToggle = signal(0);

  // -------------------- CAMPAIGN SEARCH (YENİ) --------------------
  campaignSearchResults = signal<GetCampaignProductOfferResponse[]>([]);
  campaignIsSearchMode = signal(false);
  campaignSearchError = signal<string>('');

  filteredCampaignRows = computed(() => {
    this.campaignApplyFilterToggle();

    // Eğer arama yapıldıysa, arama sonuçlarını CampaignOfferRow formatına dönüştür
    if (this.campaignIsSearchMode()) {
      return this.campaignSearchResults().map(r => ({
        campaignId: r.campaignId,
        campaignName: '', // arama sonuçlarında name yok
        productOfferId: r.productOfferId,
        productOfferName: r.productOfferName,
        price: 0, // arama sonuçlarında price yok
      } as CampaignOfferRow));
    }

    // Normal filtering
    const idTxt = this.campaignFilterCampaignId().trim();
    const nameTxt = this.campaignFilterCampaignName().trim().toLowerCase();
    return this.campaignRows().filter((r) => {
      const idOk = idTxt ? String(r.campaignId).includes(idTxt) : true;
      const nameOk = nameTxt
        ? r.productOfferName.toLowerCase().includes(nameTxt)
        : true;
      return idOk && nameOk;
    });
  });

  constructor(
    private route: ActivatedRoute,
    private catalogApi: CatalogService,
    private cpoApi: CatalogProductOfferService,
    private productOfferService: ProductOfferService,
    private campaignApi: CampaignProductOfferService,
    private productOfferApi: ProductOfferService,
    private basketApi: BasketService,
    private router: Router,
    private orderCreation: OrderCreationService
  ) {}


ngOnInit(): void {
  const billingAccIdParam = this.route.snapshot.paramMap.get('billingAccountId')
                      ?? this.route.parent?.snapshot.paramMap.get('billingAccountId');
  if (billingAccIdParam) {
    this.billingAccountId.set(Number(billingAccIdParam));
    this.refreshBasketUI(); // sayfa açılışında sepeti çek
  }

  this.catalogApi.getCatalogItems().subscribe((cs) => this.catalogs.set(cs));

  // Kampanya dropdown ve harita
  this.campaignApi.getAllActive().subscribe({
    next: (list) => {
      // dropdown
      const map = new Map<number, string>();
      list.forEach((x) => { if (!map.has(x.campaignId)) map.set(x.campaignId, x.campaignName); });
      this.campaignOptions.set(Array.from(map.entries()).map(([id, name]) => ({ id, name })));

      // 🔥 campaignProductId -> campaignId haritası
      this.cpidToCid.clear();
      list.forEach(x => this.cpidToCid.set(x.campaignProductId, x.campaignId));

      // Harita geldikten sonra sepeti yeniden çiz (yanlış gruplamayı düzeltir)
      this.refreshBasketUI();
    },
    error: (e) => console.error('getAllActive campaigns error:', e),
  });
}


  // ---------- tabs ----------
  onTabChange(tab: 'catalog' | 'campaign') {
    this.activeTab.set(tab);
  }

  // ================== CATALOG methods ==================
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
      next: (data) => this.offers.set(data),
      error: (err) => {
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

    if (!id && !name) {
      this.searchError.set('Please enter either Prod Offer ID or Prod Offer Name');
      this.isSearchMode.set(false);
      this.searchResults.set([]);
      return;
    }

    this.loading.set(true);
    this.searchError.set('');
    this.isSearchMode.set(true);

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
        this.searchError.set(err?.error?.message || 'No results found. Please check your search parameters.');
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
      this.basketItems.set(this.basketItems().filter((item) => item.id !== key));
    } else {
      selected.add(key);
    }
    this.selectedOffers.set(selected);
  }

  isOfferSelected(offerId: string): boolean {
    return this.selectedOffers().has(offerId);
  }

  addToBasket() {
  const billingAccId = this.billingAccountId();
  if (!billingAccId) return;

  const ids = Array.from(this.selectedOffers());
  if (ids.length === 0) return;

  import('rxjs').then(({ from, last, concatMap }) => {
  const calls$ = from(ids).pipe(
    concatMap(id => this.basketApi.addProductOffer(billingAccId, id, 1))
  );

  calls$.subscribe({
    next: () => {},                 // her add başarıyla bittiğinde
    error: (err) => console.error('addToBasket error:', err),
    complete: () => {
      this.selectedOffers.set(new Set());
      this.refreshBasketUI();
    }
  });
});

}


  onRemoveFromBasket(basketItemId: string) {
  const accId = this.billingAccountId();
  if (!accId) return;

  this.basketApi.deleteItem(accId, basketItemId).subscribe({
    next: () => this.refreshBasketUI(),
    error: (err) => console.error('deleteItem error:', err),
  });
}

onClearBasket() {
  const accId = this.billingAccountId();
  if (!accId) {
    // route’tan henüz gelmediyse, sadece local temizle
    this.basketItems.set([]);
    this.selectedOffers.set(new Set());
    return;
  }

  this.basketApi.clear(accId).subscribe({
    next: () => {
      this.basketItems.set([]);
      this.selectedOffers.set(new Set());
      this.refreshBasketUI();
    },
    error: (err) => console.error('clearBasket error:', err),
  });
}


  onNextClick() {
  const st = this.orderCreation.state();

  const customerId =
    this.route.parent?.snapshot.paramMap.get('customerId') ??
    this.route.snapshot.paramMap.get('customerId');
  const billingAccId = this.billingAccountId();

  if (!customerId || !billingAccId) {
    console.warn('customerId veya billingAccountId yok');
    return;
  }

  if (!st.basket || !st.basket.basketItems || st.basket.basketItems.length === 0) {
    console.warn('Boş basket ile config sayfasına geçmiyoruz');
    return;
  }

  this.router.navigate([
    '/customer',
    customerId,
    'start-new-sale',
    billingAccId,
    'configuration',
  ]);
}



  // ================== CAMPAIGN methods ==================
  private loadCampaignDropdown() {
    this.campaignApi.getAllActive().subscribe({
      next: (list) => {
        const map = new Map<number, string>();
        list.forEach((x) => {
          if (!map.has(x.campaignId)) map.set(x.campaignId, x.campaignName);
        });
        this.campaignOptions.set(
          Array.from(map.entries()).map(([id, name]) => ({ id, name }))
        );
      },
      error: (e) => console.error('getAllActive campaigns error:', e),
    });
  }

  canAddCampaignToBasket = computed(() =>
    this.selectedCampaignId() !== null && this.campaignRows().length > 0 && !this.campaignLoading()
  );

  onCampaignChange(val: string) {
    const id = Number(val);
    if (Number.isNaN(id)) return;
    this.selectedCampaignId.set(id);
    this.campaignSelected.set(new Set());
    this.campaignIsSearchMode.set(false);
    this.campaignSearchResults.set([]);
    this.campaignFilterCampaignId.set('');
    this.campaignFilterCampaignName.set('');
    this.campaignSearchError.set('');
    this.loadCampaignRows(id);
  }

  private loadCampaignRows(campaignId: number) {
    this.campaignLoading.set(true);
    this.campaignApi.getAllActive().subscribe({
      next: (all) => {
        const items = all.filter((x) => x.campaignId === campaignId);

        import('rxjs').then(({ forkJoin, of }) => {
          import('rxjs/operators').then(({ map, catchError }) => {
            const reqs = items.map((x) =>
              this.productOfferApi.getForBasket(x.productId).pipe(
                map((p) => ({
                  campaignProductId: x.campaignProductId,
                  campaignId: x.campaignId,
                  campaignName: x.campaignName,
                  productOfferId: p.id,
                  productOfferName: p.productName,
                  price: p.price,
                }) as CampaignOfferRow),
                catchError((err) => {
                  console.error('getForBasket error for', x.productId, err);
                  return of({
                    campaignId: x.campaignId,
                    campaignName: x.campaignName,
                    productOfferId: x.productId,
                    productOfferName: '(unknown)',
                    price: 0,
                  } as CampaignOfferRow);
                })
              )
            );

            forkJoin(reqs).subscribe({
              next: (rows) => this.campaignRows.set(rows),
              error: (err) => {
                console.error('compose campaign rows error:', err);
                this.campaignRows.set([]);
              },
              complete: () => this.campaignLoading.set(false),
            });
          });
        });
      },
      error: (err) => {
        console.error('getAllActive error:', err);
        this.campaignLoading.set(false);
      },
    });
  }

  // ================== CAMPAIGN SEARCH METHODS (YENİ) ==================
  onCampaignSearchClick() {
    const campaignId = this.campaignFilterCampaignId().trim();
    const campaignName = this.campaignFilterCampaignName().trim();

    if (!campaignId && !campaignName) {
      this.campaignSearchError.set('Please enter either Campaign ID or Campaign Name.');
      this.campaignIsSearchMode.set(false);
      this.campaignSearchResults.set([]);
      return;
    }

    this.campaignLoading.set(true);
    this.campaignSearchError.set('');
    this.campaignIsSearchMode.set(true);

    const searchObservable = campaignId
      ? this.campaignApi.searchByCampaignId(Number(campaignId))
      : this.campaignApi.searchByCampaignName(campaignName);

    searchObservable.subscribe({
      next: (data) => {
        this.campaignSearchResults.set(data);
        this.campaignLoading.set(false);
      },
      error: (err) => {
        console.error('Campaign search error:', err);
        this.campaignSearchError.set(
          err?.error?.message || 'No results found. Please check your search parameters.'
        );
        this.campaignSearchResults.set([]);
        this.campaignLoading.set(false);
      }
    });
  }

  toggleCampaignSelection(row: CampaignOfferRow) {
    const set = new Set(this.campaignSelected());
    if (set.has(row.productOfferId)) {
      set.delete(row.productOfferId);
      this.campaignBasket.set(
        this.campaignBasket().filter((i) => i.productOfferId !== row.productOfferId)
      );
    } else {
      set.add(row.productOfferId);
    }
    this.campaignSelected.set(set);
  }

  toggleCampaignSearchResultSelection(campaignId: number, productOfferId: string, productOfferName: string) {
    const set = new Set(this.campaignSelected());
    if (set.has(productOfferId)) {
      set.delete(productOfferId);
    } else {
      set.add(productOfferId);
    }
    this.campaignSelected.set(set);
  }

  isCampaignRowSelected(productOfferId: string) {
    return this.campaignSelected().has(productOfferId);
  }

  addCampaignToBasket() {
  const billingAccId = this.billingAccountId();
  const campaignId = this.selectedCampaignId();
  if (!billingAccId || !campaignId) return;

  this.campaignLoading.set(true);
  this.basketApi.addCampaign(billingAccId, campaignId).subscribe({
    next: () => {
      this.onCampaignClearBasket(); // local seçimleri temizle (UI)
      this.refreshBasketUI();       // BE sepetini sağ panelde göster
      this.campaignLoading.set(false);
    },
    error: (err) => {
      console.error('addCampaignToBasket error:', err);
      this.campaignLoading.set(false);
    }
  });
}

onRemoveCampaign() {
  const accId = this.billingAccountId();
  if (!accId) return;
  this.basketApi.deleteCampaign(accId).subscribe({
    next: () => this.refreshBasketUI(),
    error: (err) => console.error('deleteCampaign error:', err),
  });
}



private mapBasketToUiItems(basket: Basket): BasketItem[] {
  if (!basket) return [];

  const result: BasketItem[] = [];
  const activeCampaignId = basket.campaignId; // seçip eklediğin kampanya
  const hasCampaignMeta = activeCampaignId != null && basket.campaignName != null;

  // Header: yalnızca meta göstermek için
  if (hasCampaignMeta) {
    result.push({
      id: `__hdr__${activeCampaignId}`,
      name: basket.campaignName!,
      description: 'Campaign bundle',
      price: 0,
      isHeader: true,
      isCampaign: true
    } as BasketItem);
  }

  const items = (basket.basketItems ?? []).map(it => {
    const unit = Number(it.discountedPrice) || 0;
    const qty  = Number(it.quantity) || 1;

    // 👇 Sadece SEÇİLEN kampanyaya aitse kampanya kalemi yap
    const cpid = Number(it.campaignProductId ?? 0);
    const belongsToSelected =
      hasCampaignMeta &&
      cpid > 0 &&
      this.cpidToCid.has(cpid) &&
      this.cpidToCid.get(cpid) === activeCampaignId;

    return {
      id: it.id,
      name: it.productName ?? it.productOfferId ?? it.productId,
      description: `${qty} × ${unit.toFixed(2)} TL`,
      price: unit * qty,
      isCampaign: belongsToSelected
    } as BasketItem;
  });

  const campaignItems = items.filter(x => x.isCampaign === true);
  const otherItems    = items.filter(x => !x.isCampaign);

  if (hasCampaignMeta) result.push(...campaignItems);
  result.push(...otherItems);

  return result;
}



private refreshBasketUI(): void {
  const accId = this.billingAccountId();
  if (!accId) return;

  this.basketApi.getForBilling(accId).pipe(
    catchError((err: any) => {
      if (err?.status === 404 || err?.status === 400) {
        return of(null as Basket | null);
      }
      return throwError(() => err);
    })
  ).subscribe({
    next: (basket: Basket | null) => {
      if (basket) {
        // wizard state
        this.orderCreation.setBillingAccountId(accId);
        this.orderCreation.setBasket(basket);

        this.basketItems.set(this.mapBasketToUiItems(basket));
      } else {
        this.orderCreation.setBasket(null);
        this.basketItems.set([]);
      }
    },
    error: (err) => {
      console.error('refreshBasketUI error:', err);
      this.orderCreation.setBasket(null);
      this.basketItems.set([]);
    }
  });
}


  onCampaignRemoveFromBasket(id: string) {
    this.campaignBasket.set(this.campaignBasket().filter((i) => i.productOfferId !== id));
    const set = new Set(this.campaignSelected());
    set.delete(id);
    this.campaignSelected.set(set);
  }

  onCampaignClearBasket() {
    this.campaignBasket.set([]);
    this.campaignSelected.set(new Set());
  }

  onCampaignNext() {
    console.log('[CAMPAIGN] Proceed:', this.campaignBasket());
  }
}