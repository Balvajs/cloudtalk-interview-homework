import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ProductsResponse } from '../../core/models/products';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);

  getProducts(cursor?: string, limit = 20): Observable<ProductsResponse> {
    let parameters = new HttpParams().set('order', 'desc').set('limit', limit);

    if (cursor) {
      parameters = parameters.set('cursor', cursor);
    }

    return this.http.get<ProductsResponse>(`${environment.apiUrl}/products`, {
      params: parameters,
    });
  }

  deleteProduct(id: string): Observable<unknown> {
    return this.http.delete(`${environment.apiUrl}/products/${id}`);
  }

  increaseStock(id: string): Observable<unknown> {
    return this.http.put(
      `${environment.apiUrl}/products/${id}/increase-stock`,
      {},
    );
  }

  decreaseStock(id: string): Observable<unknown> {
    return this.http.put(
      `${environment.apiUrl}/products/${id}/decrease-stock`,
      {},
    );
  }
}
