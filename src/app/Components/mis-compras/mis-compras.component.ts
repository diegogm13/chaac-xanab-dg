import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComprasService } from '../../Services/compras.service';
import { Compra } from '../../models/product.model';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-compras.component.html',
  styleUrl: './mis-compras.component.css'
})
export class MisComprasComponent implements OnInit {
  compras: Compra[] = [];
  isLoading = true;
  errorMsg  = '';

  expandedId: string | null = null;

  constructor(private comprasService: ComprasService) {}

  ngOnInit(): void {
    this.comprasService.getMisCompras().subscribe({
      next: (data) => {
        this.compras   = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg  = 'No se pudieron cargar tus compras.';
        this.isLoading = false;
      }
    });
  }

  toggle(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pendiente:  'Pendiente',
      procesando: 'Procesando',
      enviado:    'Enviado',
      entregado:  'Entregado',
      cancelado:  'Cancelado'
    };
    return map[status] ?? status;
  }
}
