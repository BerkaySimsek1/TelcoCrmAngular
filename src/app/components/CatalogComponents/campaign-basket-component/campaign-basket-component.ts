import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CampaignOfferRow } from '../../../models/CatalogModels/CampaignModels/campaign-offer-row';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campaign-basket-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-basket-component.html',
  styleUrl: './campaign-basket-component.scss',
})
export class CampaignBasketComponent {
@Input() items: CampaignOfferRow[] = [];
  @Output() removeItem = new EventEmitter<string>();
  @Output() clearBasket = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  get totalAmount(): number {
    return this.items.reduce((sum, it) => sum + (it.price ?? 0), 0);
  }

  onRemoveItem(productOfferId: string) { this.removeItem.emit(productOfferId); }
  onClear() { this.clearBasket.emit(); }
  onNext() { this.next.emit(); }
}
