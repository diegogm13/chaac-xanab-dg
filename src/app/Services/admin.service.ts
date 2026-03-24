import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Compra, Categoria } from '../models/product.model';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/api/admin';

  // ─── Productos ───────────────────────────────────────────────────────────────
  getProductos(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.BASE}/productos`);
  }

  createProducto(form: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.BASE}/productos`, form);
  }

  updateProducto(id: string, form: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.BASE}/productos/${id}`, form);
  }

  deleteProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/productos/${id}`);
  }

  ajustarStock(id: string, delta: number): Observable<Product> {
    return this.http.put<Product>(`${this.BASE}/productos/${id}/stock`, { delta });
  }

  // ─── Compras ─────────────────────────────────────────────────────────────────
  getCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.BASE}/compras`);
  }

  updateCompraStatus(id: string, status: string): Observable<Compra> {
    return this.http.put<Compra>(`${this.BASE}/compras/${id}/status`, { status });
  }

  // ─── Usuarios ────────────────────────────────────────────────────────────────
  getUsuarios(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.BASE}/usuarios`);
  }

  // ─── Categorías ──────────────────────────────────────────────────────────────
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>('/api/categorias');
  }

  createCategoria(form: FormData): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.BASE}/categorias`, form);
  }

  updateCategoria(id: string, form: FormData): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.BASE}/categorias/${id}`, form);
  }

  deleteCategoria(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/categorias/${id}`);
  }
}
