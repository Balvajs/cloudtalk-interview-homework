import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Product } from '../../../core/models/products';

@Component({
  selector: 'app-list-item',
  imports: [CommonModule],
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent {
  @Input({ required: true }) item!: Product;
}
