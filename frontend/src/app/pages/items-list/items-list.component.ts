import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '../../core/models/products';

import { ListItemComponent } from './list-item/list-item.component';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, ListItemComponent],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent {
  private productsService = inject(ProductsService);

  items$: Observable<Product[]> = this.productsService.getProducts();
}
