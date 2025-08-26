import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Product } from '../../../core/models/products';

@Component({
  selector: 'app-list-item',
  imports: [CommonModule],
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent {
  @Input({ required: true }) item!: Product;
  @Input() isLoading = false;
  @Output() deleteItem = new EventEmitter<string>();
  @Output() increaseStock = new EventEmitter<string>();
  @Output() decreaseStock = new EventEmitter<string>();

  onDelete(): void {
    this.deleteItem.emit(this.item.id);
  }

  onIncreaseStock(): void {
    this.increaseStock.emit(this.item.id);
  }

  onDecreaseStock(): void {
    this.decreaseStock.emit(this.item.id);
  }
}
