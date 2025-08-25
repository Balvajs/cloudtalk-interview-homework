import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { BehaviorSubject, finalize } from 'rxjs';

import { Product } from '../../core/models/products';

import { ListItemComponent } from './list-item/list-item.component';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, ListItemComponent, InfiniteScrollDirective],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent implements OnInit {
  private productsService = inject(ProductsService);

  items: Product[] = [];
  loading = false;
  hasNextPage = false;
  nextCursor?: string;

  private itemsSubject = new BehaviorSubject<Product[]>([]);
  items$ = this.itemsSubject.asObservable();

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.productsService
      .getProducts()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.items = response.data;
          this.hasNextPage = response.pagination.hasNextPage;
          this.nextCursor = response.pagination.nextCursor;
          this.itemsSubject.next(this.items);
        },
        error: (error) => {
          console.error('Error loading products:', error);
        },
      });
  }

  onScrollDown(): void {
    if (this.loading || !this.hasNextPage) {
      return;
    }

    this.loading = true;
    this.productsService
      .getProducts(this.nextCursor)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.items = [...this.items, ...response.data];
          this.hasNextPage = response.pagination.hasNextPage;
          this.nextCursor = response.pagination.nextCursor;
          this.itemsSubject.next(this.items);
        },
        error: (error) => {
          console.error('Error loading more products:', error);
        },
      });
  }
}
