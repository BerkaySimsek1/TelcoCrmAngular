import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface BasketItem {
  id: string;
  name: string;
  description?: string;
  price: number;
}

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

  onRemoveItem(itemId: string) {
    this.removeItem.emit(itemId);
  }

  onClear() {
    this.clearBasket.emit();
  }

  onNext() {
    this.next.emit();
  }
}
