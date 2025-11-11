import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BasketItem } from '../../../models/CatalogModels/BasketModels/basket-item';

type Group =
  | { kind: 'campaign'; title: string; items: BasketItem[]; subtotal: number }
  | { kind: 'others'; items: BasketItem[] };

@Component({
  selector: 'app-basket-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './basket-component.html',
  styleUrl: './basket-component.scss',
})
export class BasketComponent {
  @Input() items: BasketItem[] = [];
  @Output() removeItem = new EventEmitter<string>();
  @Output() clearBasket = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  get totalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  // sıraya bakmak yerine isCampaign / isHeader alanlarını kullan
  get groups(): Group[] {
  const header = this.items.find(x => x.isHeader === true);
  const campaignItems = this.items.filter(x => x.isCampaign === true && x.isHeader !== true);
  const otherItems    = this.items.filter(x => (x.isCampaign !== true) && (x.isHeader !== true));

  const res: Group[] = [];
  if (header) {
    const subtotal = campaignItems.reduce((s, it) => s + (Number(it.price) || 0), 0);
    res.push({ kind: 'campaign', title: header.name, items: campaignItems, subtotal });
  }
  if (otherItems.length) {
    res.push({ kind: 'others', items: otherItems });
  }
  return res;
}


  onRemoveItem(itemId: string) {
    this.removeItem.emit(itemId);
  }
  onClear() { this.clearBasket.emit(); }
  onNext() { this.next.emit(); }
}
