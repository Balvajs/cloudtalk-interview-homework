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
  @Output() deleteItem = new EventEmitter<number>();

  onDelete(): void {
    this.deleteItem.emit(this.item.id);
  }
}
