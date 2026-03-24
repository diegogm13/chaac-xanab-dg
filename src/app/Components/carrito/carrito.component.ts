import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../Services/cart.service';
import { AuthService } from '../../Services/auth.service';
import { ComprasService } from '../../Services/compras.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit, OnDestroy {
  items:      CartItem[] = [];
  isLoggedIn  = false;
  isCheckingOut = false;
  errorMsg    = '';

  // Dirección de envío requerida para confirmar compra
  direccion = {
    calle:          '',
    numero_ext:     '',
    numero_int:     '',
    colonia:        '',
    ciudad:         '',
    estado:         '',
    codigo_postal:  '',
    pais:           'México'
  };

  private sub!: Subscription;

  constructor(
    public  cartService:   CartService,
    public  authService:   AuthService,
    private comprasService: ComprasService,
    private router:        Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.sub = this.cartService.cart$.subscribe(items => this.items = items);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  get total(): number { return this.cartService.getTotal(); }

  removeItem(index: number): void  { this.cartService.removeFromCart(index); }
  changeQty(index: number, delta: number): void { this.cartService.updateQuantity(index, delta); }
  getSubtotal(item: CartItem): number { return item.product.price * item.quantity; }

  isDireccionValid(): boolean {
    const d = this.direccion;
    return !!(d.calle && d.numero_ext && d.colonia && d.ciudad && d.estado && d.codigo_postal);
  }

  checkout(): void {
    this.errorMsg = '';
    if (!this.isLoggedIn) return;

    // Verificar que todos los productos tienen ID del backend
    const missingId = this.items.some(i => !i.product.id);
    if (missingId) {
      this.errorMsg = 'Algunos productos no tienen referencia válida. Vuelve a agregarlos.';
      return;
    }
    if (!this.isDireccionValid()) {
      this.errorMsg = 'Por favor completa todos los datos de envío.';
      return;
    }

    this.isCheckingOut = true;
    const dto = {
      items: this.items.map(i => ({
        producto_id: i.product.id!,
        size:        i.size,
        quantity:    i.quantity
      })),
      direccion: this.direccion
    };

    this.comprasService.crearCompra(dto).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.router.navigate(['/gracias']);
      },
      error: (err) => {
        this.isCheckingOut = false;
        this.errorMsg = err?.error?.message ?? 'Error al procesar la compra. Inténtalo de nuevo.';
      }
    });
  }
}
