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

  it('should load products', async () => {
    const productsResponse: ProductsResponse = {
      data: [{ id: 1, name: 'Product 1', price: 100, quantity: 1 }],
      pagination: {
        hasNextPage: false,
        limit: 20,
        order: 'desc',
      },
    };

    const products$ = service.getProducts();
    const productsPromise = firstValueFrom(products$);

    const req = httpMock.expectOne(`${environment.apiUrl}/products?order=desc`);
    expect(req.request.method).toBe('GET');
    req.flush(productsResponse);

    expect(await productsPromise).toEqual(productsResponse.data);
  });
});
