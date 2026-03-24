import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../Services/cart.service';
import { ProductsService } from '../../Services/products.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent implements OnInit, OnDestroy {
  slug      = '';
  products: Product[] = [];
  isLoading = true;
  notFound  = false;

  selectedSizes: Record<string, string>  = {};
  addedToCart:   Record<string, boolean> = {};

  private subs = new Subscription();

  constructor(
    private route:          ActivatedRoute,
    private cartService:    CartService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe(params => {
        this.slug = params.get('categoria') || '';
        this.loadProducts();
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  private loadProducts(): void {
    this.isLoading = true;
    this.notFound  = false;
    this.products  = [];
    this.selectedSizes = {};
    this.addedToCart   = {};

    this.subs.add(
      this.productsService.getProductos({ categoria: this.slug }).subscribe({
        next: (data) => {
          this.products  = data.filter(p => p.activo);
          this.notFound  = this.products.length === 0;
          this.isLoading = false;
        },
        error: () => {
          this.notFound  = true;
          this.isLoading = false;
        }
      })
    );
  }

  addToCart(product: Product, size: string): void {
    if (!size) return;
    this.cartService.addToCart({
      id:          product.id,
      name:        product.name,
      price:       product.price,
      image:       product.image_url,
      description: product.description,
      sizes:       product.sizes,
      badge:       product.badge
    }, size);
    const key = product.id + size;
    this.addedToCart[key] = true;
    setTimeout(() => { this.addedToCart[key] = false; }, 1500);
  }

  badgeLabel(badge: string): string {
    const map: Record<string, string> = { new: 'Nuevo', sale: 'Oferta', popular: 'Popular' };
    return map[badge] ?? badge;
  }

  getDiscount(product: Product): number {
    if (!product.original_price) return 0;
    return Math.round((1 - product.price / product.original_price) * 100);
  }
}
