import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProductsResponse } from 'src/app/core/models/products';
import { environment } from 'src/environments/environment';

import { ItemsListComponent } from './items-list.component';
import { ProductsService } from './products.service';

describe('ItemsListComponent', () => {
  let component: ItemsListComponent;
  let fixture: ComponentFixture<ItemsListComponent>;
  let httpMock: HttpTestingController;
  let productsService: ProductsService;

  const mockProductsResponse: ProductsResponse = {
    data: [
      { id: 1, name: 'Product 1', price: 100, quantity: 1 },
      { id: 2, name: 'Product 2', price: 200, quantity: 2 },
    ],
    pagination: {
      hasNextPage: true,
      nextCursor: '1234567890,product-id-2',
      limit: 20,
      order: 'desc',
    },
  };

  const mockSecondPageResponse: ProductsResponse = {
    data: [
      { id: 3, name: 'Product 3', price: 300, quantity: 3 },
      { id: 4, name: 'Product 4', price: 400, quantity: 4 },
    ],
    pagination: {
      hasNextPage: false,
      limit: 20,
      order: 'desc',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [ItemsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    productsService = TestBed.inject(ProductsService);

    // Prevent automatic HTTP calls in most tests by spying on loadMore

    spyOn(component, 'loadMore');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should setup intersection observer after view init', () => {
    const setupSpy = spyOn(component, 'setupIntersectionObserver');

    component.ngAfterViewInit();

    expect(setupSpy).toHaveBeenCalled();
  });

  it('should disconnect intersection observer on destroy', () => {
    const mockObserver = {
      disconnect: jasmine.createSpy('disconnect'),
      observe: jasmine.createSpy('observe'),
    } as unknown as IntersectionObserver;

    component.intersectionObserver = mockObserver;

    component.ngOnDestroy();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  it('should load initial data on init', () => {
    // The spy is already set up in beforeEach
    component.ngOnInit();

    expect(component.loadMore).toHaveBeenCalled();
  });

  it('should load and display initial products', async () => {
    // Restore the original method for this test

    (component.loadMore as jasmine.Spy).and.callThrough();

    fixture.detectChanges(); // This triggers ngOnInit

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20`,
    );
    req.flush(mockProductsResponse);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.items).toEqual(mockProductsResponse.data);
    expect(component.hasNextPage).toBe(true);
    expect(component.nextCursor).toBe('1234567890,product-id-2');
    expect(component.loading).toBe(false);

    // Check if products are displayed in the template
    const listItems = fixture.debugElement.queryAll(By.css('app-list-item'));
    expect(listItems.length).toBe(2);
  });

  it('should load more products when intersection is triggered', async () => {
    // Restore the original method for this test

    (component.loadMore as jasmine.Spy).and.callThrough();

    // Initial load
    fixture.detectChanges();
    const initialRequest = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20`,
    );
    initialRequest.flush(mockProductsResponse);

    await fixture.whenStable();
    fixture.detectChanges();

    // Trigger intersection (load more)
    component.onIntersection();

    const scrollRequest = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20&cursor=1234567890,product-id-2`,
    );
    scrollRequest.flush(mockSecondPageResponse);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.items.length).toBe(4);
    expect(component.items).toEqual([
      ...mockProductsResponse.data,
      ...mockSecondPageResponse.data,
    ]);
    expect(component.hasNextPage).toBe(false);
    expect(component.loading).toBe(false);
  });

  it('should not load more products when loading is true', () => {
    component.loading = true;
    component.hasNextPage = true;

    spyOn(productsService, 'getProducts');

    component.onIntersection();

    expect(productsService.getProducts).not.toHaveBeenCalled();
  });

  it('should not load more products when hasNextPage is false', () => {
    component.loading = false;
    component.hasNextPage = false;

    spyOn(productsService, 'getProducts');

    component.onIntersection();

    expect(productsService.getProducts).not.toHaveBeenCalled();
  });

  it('should show loading message when loading', async () => {
    component.loading = true;
    component.items = []; // Ensure items is empty to show loading
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('.loading'));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain(
      'Loading products...',
    );
  });

  it('should show no items message when no products available', async () => {
    // Restore the original method for this test

    (component.loadMore as jasmine.Spy).and.callThrough();

    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20`,
    );
    req.flush({
      data: [],
      pagination: {
        hasNextPage: false,
        limit: 20,
        order: 'desc',
      },
    });

    await fixture.whenStable();
    fixture.detectChanges();

    const noItemsElement = fixture.debugElement.query(By.css('.no-items'));
    expect(noItemsElement).toBeTruthy();
    expect(noItemsElement.nativeElement.textContent).toContain(
      'No products available',
    );
  });

  it('should show end message when all products are loaded', async () => {
    // Restore the original method for this test

    (component.loadMore as jasmine.Spy).and.callThrough();

    // Initial load
    fixture.detectChanges();
    const initialRequest = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20`,
    );
    initialRequest.flush(mockProductsResponse);

    await fixture.whenStable();
    fixture.detectChanges();

    // Load second page (last page)
    component.onIntersection();
    const scrollRequest = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20&cursor=1234567890,product-id-2`,
    );
    scrollRequest.flush(mockSecondPageResponse);

    await fixture.whenStable();
    fixture.detectChanges();

    const endMessageElement = fixture.debugElement.query(
      By.css('.end-message'),
    );
    expect(endMessageElement).toBeTruthy();
    expect(endMessageElement.nativeElement.textContent).toContain(
      'No more products to load',
    );
  });

  it('should handle error when loading initial data', async () => {
    spyOn(console, 'error');
    // Restore the original method for this test

    (component.loadMore as jasmine.Spy).and.callThrough();

    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20`,
    );
    req.error(new ProgressEvent('Network error'));

    await fixture.whenStable();

    expect(console.error).toHaveBeenCalledWith(
      'Error loading more products:',
      jasmine.any(Object),
    );
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading more data', async () => {
    spyOn(console, 'error');
    // Restore the original method for this test

    (component.loadMore as jasmine.Spy).and.callThrough();

    // Initial load
    fixture.detectChanges();
    const initialRequest = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20`,
    );
    initialRequest.flush(mockProductsResponse);

    await fixture.whenStable();
    fixture.detectChanges();

    // Trigger intersection with error
    component.onIntersection();

    const scrollRequest = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20&cursor=1234567890,product-id-2`,
    );
    scrollRequest.error(new ProgressEvent('Network error'));

    await fixture.whenStable();

    expect(console.error).toHaveBeenCalledWith(
      'Error loading more products:',
      jasmine.any(Object),
    );
    expect(component.loading).toBe(false);
  });

  it('should delete item and remove it from the list', async () => {
    // Setup initial data without using private property
    component.items = [...mockProductsResponse.data];
    fixture.detectChanges();

    const productId = 1;

    component.onDeleteItem(productId);

    const deleteRequest = httpMock.expectOne(
      `${environment.apiUrl}/products/${productId}`,
    );
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush({});

    await fixture.whenStable();

    expect(component.items.length).toBe(1);
    expect(
      component.items.find((item) => item.id === productId),
    ).toBeUndefined();
    expect(component.items[0].id).toBe(2);
  });

  it('should handle error when deleting item', async () => {
    spyOn(console, 'error');

    // Setup initial data
    component.items = [...mockProductsResponse.data];

    const productId = 1;
    const originalItemsLength = component.items.length;

    component.onDeleteItem(productId);

    const deleteRequest = httpMock.expectOne(
      `${environment.apiUrl}/products/${productId}`,
    );
    deleteRequest.error(new ProgressEvent('Network error'));

    await fixture.whenStable();

    expect(console.error).toHaveBeenCalledWith(
      'Error deleting product:',
      jasmine.any(Object),
    );
    // Items should not be removed on error
    expect(component.items.length).toBe(originalItemsLength);
  });
});
