import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Product, ProductsResponse } from '../../core/models/products';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ProductsResponse>(`${environment.apiUrl}/products?order=desc`)
      .pipe(map((response) => response.data));
  }
}
