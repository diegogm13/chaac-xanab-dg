import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Categoria } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>('/api/categorias');
  }

  getProductos(filters?: { categoria?: string; badge?: string }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters?.categoria) params = params.set('categoria_slug', filters.categoria);
    if (filters?.badge)     params = params.set('badge', filters.badge);
    return this.http.get<Product[]>('/api/productos', { params });
  }

  getProducto(id: string): Observable<Product> {
    return this.http.get<Product>(`/api/productos/${id}`);
  }
}
