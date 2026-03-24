import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra, CompraItem } from '../models/product.model';

export interface CreateCompraDto {
  items: { producto_id: string; size: string; quantity: number }[];
  direccion: {
    calle: string;
    numero_ext: string;
    numero_int?: string;
    colonia: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
    pais?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly http = inject(HttpClient);

  crearCompra(dto: CreateCompraDto): Observable<Compra> {
    return this.http.post<Compra>('/api/compras', dto);
  }

  getMisCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>('/api/compras/mis-compras');
  }

  getCompra(id: string): Observable<Compra> {
    return this.http.get<Compra>(`/api/compras/${id}`);
  }
}
