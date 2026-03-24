import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartProduct {
  id?: string;      // UUID del producto en Supabase — requerido para confirmar compra
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  badge?: string;
}

export interface CartItem {
  product: CartProduct;
  size: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly CART_KEY = 'chaac_cart';
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());

  cart$: Observable<CartItem[]> = this.cartSubject.asObservable();

  private loadCart(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.CART_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private saveCart(items: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this.cartSubject.next(items);
  }

  addToCart(product: CartProduct, size: string): void {
    const items = [...this.cartSubject.value];
    const existingIndex = items.findIndex(
      i => i.product.name === product.name && i.size === size
    );
    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + 1
      };
    } else {
      items.push({ product, size, quantity: 1 });
    }
    this.saveCart(items);
  }

  removeFromCart(index: number): void {
    const items = [...this.cartSubject.value];
    items.splice(index, 1);
    this.saveCart(items);
  }

  updateQuantity(index: number, delta: number): void {
    const items = [...this.cartSubject.value];
    const newQty = items[index].quantity + delta;
    if (newQty < 1) return;
    items[index] = { ...items[index], quantity: newQty };
    this.saveCart(items);
  }

  clearCart(): void {
    this.saveCart([]);
  }

  getTotal(): number {
    return this.cartSubject.value.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  getCount(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }
}
