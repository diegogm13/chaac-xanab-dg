import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../Services/cart.service';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  isLoggedIn = false;
  private sub!: Subscription;

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.sub = this.cartService.cart$.subscribe(items => {
      this.items = items;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get total(): number {
    return this.cartService.getTotal();
  }

  removeItem(index: number): void {
    this.cartService.removeFromCart(index);
  }

  changeQty(index: number, delta: number): void {
    this.cartService.updateQuantity(index, delta);
  }

  checkout(): void {
    if (!this.isLoggedIn) return;
    this.cartService.clearCart();
    this.router.navigate(['/gracias']);
  }

  getSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }
}
