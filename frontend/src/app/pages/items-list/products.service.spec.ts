import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ProductsResponse } from 'src/app/core/models/products';
import { environment } from 'src/environments/environment';

import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ProductsService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load products without cursor', async () => {
    const productsResponse: ProductsResponse = {
      data: [
        { id: '1', name: 'Product 1', price: 100, quantity: 1 },
        { id: '2', name: 'Product 2', price: 200, quantity: 2 },
      ],
      pagination: {
        hasNextPage: true,
        nextCursor: '1234567890,product-id-2',
        limit: 20,
        order: 'desc',
      },
    };

    const products$ = service.getProducts();
    const productsPromise = firstValueFrom(products$);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(productsResponse);

    const result = await productsPromise;
    expect(result).toEqual(productsResponse);
    expect(result.data).toEqual(productsResponse.data);
    expect(result.pagination.hasNextPage).toBe(true);
  });

  it('should load products with cursor for pagination', async () => {
    const cursor = '1234567890,product-id-2';
    const productsResponse: ProductsResponse = {
      data: [
        { id: '3', name: 'Product 3', price: 300, quantity: 3 },
        { id: '4', name: 'Product 4', price: 400, quantity: 4 },
      ],
      pagination: {
        hasNextPage: false,
        limit: 20,
        order: 'desc',
      },
    };

    const products$ = service.getProducts(cursor);
    const productsPromise = firstValueFrom(products$);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=20&cursor=1234567890,product-id-2`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(productsResponse);

    const result = await productsPromise;
    expect(result).toEqual(productsResponse);
    expect(result.pagination.hasNextPage).toBe(false);
  });

  it('should load products with custom limit', async () => {
    const customLimit = 10;
    const productsResponse: ProductsResponse = {
      data: [{ id: '1', name: 'Product 1', price: 100, quantity: 1 }],
      pagination: {
        hasNextPage: false,
        limit: customLimit,
        order: 'desc',
      },
    };

    const products$ = service.getProducts(undefined, customLimit);
    const productsPromise = firstValueFrom(products$);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=${customLimit}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(productsResponse);

    const result = await productsPromise;
    expect(result.pagination.limit).toBe(customLimit);
  });

  it('should load products with both cursor and custom limit', async () => {
    const cursor = '1234567890,product-id-5';
    const customLimit = 15;
    const productsResponse: ProductsResponse = {
      data: [{ id: '6', name: 'Product 6', price: 600, quantity: 6 }],
      pagination: {
        hasNextPage: true,
        nextCursor: '1234567891,product-id-6',
        limit: customLimit,
        order: 'desc',
      },
    };

    const products$ = service.getProducts(cursor, customLimit);
    const productsPromise = firstValueFrom(products$);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products?order=desc&limit=${customLimit}&cursor=1234567890,product-id-5`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(productsResponse);

    const result = await productsPromise;
    expect(result).toEqual(productsResponse);
  });

  it('should delete a product', async () => {
    const productId = '123';

    const delete$ = service.deleteProduct(productId);
    const deletePromise = firstValueFrom(delete$);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products/${productId}`,
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    const result = await deletePromise;
    expect(result).toEqual({});
  });

  it('should increase stock for a product', async () => {
    const productId = '123';

    const increaseStock$ = service.increaseStock(productId);
    const increaseStockPromise = firstValueFrom(increaseStock$);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products/${productId}/increase-stock`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({});

    const result = await increaseStockPromise;
    expect(result).toEqual({});
  });

  it('should decrease stock for a product', async () => {
    const productId = '456';

    const decreaseStock$ = service.decreaseStock(productId);
    const decreaseStockPromise = firstValueFrom(decreaseStock$);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/products/${productId}/decrease-stock`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({});

    const result = await decreaseStockPromise;
    expect(result).toEqual({});
  });
});
