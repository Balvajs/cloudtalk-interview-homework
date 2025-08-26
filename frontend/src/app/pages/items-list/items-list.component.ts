import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { replace } from 'radashi';
import { BehaviorSubject, finalize } from 'rxjs';

import { Product } from '../../core/models/products';

import { ListItemComponent } from './list-item/list-item.component';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, ListItemComponent],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private productsService = inject(ProductsService);

  @ViewChild('listEnd', { static: false }) listEnd!: ElementRef;

  items: Product[] = [];
  loadingItems = new Set<string>();
  loading = true;
  hasNextPage = true;
  nextCursor?: string;

  itemsSubject = new BehaviorSubject<Product[]>([]);
  items$ = this.itemsSubject.asObservable();

  intersectionObserver?: IntersectionObserver;

  ngOnInit(): void {
    this.loadMore();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  setupIntersectionObserver(): void {
    // Disconnect existing observer if it exists
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (!this.listEnd) return;

    const options: IntersectionObserverInit = {
      root: undefined, // Use viewport as root
      rootMargin: '300px', // Trigger 300px before the element comes into view
      threshold: 0.001, // Trigger when 0.1% of the element is visible
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.onIntersection();
        }
      }
    }, options);

    this.intersectionObserver.observe(this.listEnd.nativeElement);
  }

  loadMore(): void {
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

          // // Re-setup observer after new items are rendered
          setTimeout(() => this.setupIntersectionObserver(), 0);
        },
        error: (error) => {
          console.error('Error loading more products:', error);
        },
      });
  }

  onIntersection(): void {
    if (this.loading || !this.hasNextPage) {
      return;
    }

    this.loadMore();
  }

  onDeleteItem(productId: string): void {
    this.loadingItems.add(productId);
    this.productsService.deleteProduct(productId).subscribe({
      next: () => {
        // Remove the item from the local array
        this.items = this.items.filter((item) => item.id !== productId);
        this.itemsSubject.next(this.items);
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.loadingItems.delete(productId);
        // You could add a toast notification or error handling here
      },
      complete: () => {
        this.loadingItems.delete(productId);
      },
    });
  }

  onIncreaseStock(productId: string): void {
    this.loadingItems.add(productId);
    this.productsService.increaseStock(productId).subscribe({
      next: (data) => {
        this.items = replace(
          this.items,
          data as Product,
          (item) => item.id === productId,
        );
        this.itemsSubject.next(this.items);
      },
      error: (error) => {
        console.error('Error increasing product stock:', error);
        this.loadingItems.delete(productId);
        // You could add a toast notification or error handling here
      },
      complete: () => {
        this.loadingItems.delete(productId);
      },
    });
  }

  onDecreaseStock(productId: string): void {
    this.loadingItems.add(productId);
    this.productsService.decreaseStock(productId).subscribe({
      next: (data) => {
        this.items = replace(
          this.items,
          data as Product,
          (item) => item.id === productId,
        );
        this.itemsSubject.next(this.items);
      },
      error: (error) => {
        console.error('Error decreasing product stock:', error);
        this.loadingItems.delete(productId);
        // You could add a toast notification or error handling here
      },
      complete: () => {
        this.loadingItems.delete(productId);
      },
    });
  }

  isItemLoading(itemId: string): boolean {
    return this.loadingItems.has(itemId);
  }
}
