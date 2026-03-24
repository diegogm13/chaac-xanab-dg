import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { ProductsService } from '../../Services/products.service';
import { CartService } from '../../Services/cart.service';
import { SearchService } from '../../Services/search.service';
import { Categoria, Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  categorias:    Categoria[] = [];
  allProducts:   Product[]   = [];
  searchTerm     = '';
  isLoading      = true;

  selectedSizes: Record<string, string>  = {};
  addedToCart:   Record<string, boolean> = {};

  private subs = new Subscription();

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.searchService.term$.subscribe(term => this.searchTerm = term)
    );

    this.subs.add(
      combineLatest([
        this.productsService.getCategorias(),
        this.productsService.getProductos()
      ]).subscribe({
        next: ([categorias, productos]) => {
          this.categorias  = categorias;
          this.allProducts = productos.filter(p => p.activo);
          this.isLoading   = false;
        },
        error: () => { this.isLoading = false; }
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  get isSearching(): boolean { return this.searchTerm.length > 0; }

  get featuredProducts(): Product[] {
    return this.allProducts.filter(p => p.badge === 'new');
  }

  get bestSellers(): Product[] {
    return this.allProducts.filter(p => p.badge === 'popular');
  }

  get searchResults(): Product[] {
    const term = this.searchTerm.toLowerCase();
    return this.allProducts.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.badge?.toLowerCase().includes(term) ||
      p.categorias?.name.toLowerCase().includes(term)
    );
  }

  badgeLabel(badge: string): string {
    const map: Record<string, string> = { new: 'Nuevo', sale: 'Oferta', popular: 'Popular' };
    return map[badge] ?? badge;
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

  clearSearch(): void { this.searchService.clearTerm(); }
}
