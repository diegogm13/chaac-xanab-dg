import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './Services/auth.service';
import { CartService } from './Services/cart.service';

export interface Product {
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  badge?: string;
}

interface Category {
  title: string;
  subtitle: string;
  image: string;
  keywords: string[];
  price: number;
  sizes: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'CHAAC XANAB';
  searchTerm: string = '';
  isSearching: boolean = false;
  isHome: boolean = true;

  cartCount = 0;
  isLoggedIn = false;
  userName = '';

  selectedSizes: Record<string, string> = {};
  addedToCart: Record<string, boolean> = {};

  private subs = new Subscription();

  constructor(
    private router: Router,
    public authService: AuthService,
    public cartService: CartService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isHome = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '';
        this.refreshAuth();
      });
  }

  ngOnInit(): void {
    this.refreshAuth();
    this.subs.add(
      this.cartService.cart$.pipe(map(() => this.cartService.getCount()))
        .subscribe(count => this.cartCount = count)
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private refreshAuth(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getCurrentUser();
    this.userName = user?.name || '';
  }

  logout(): void {
    this.authService.logout();
    this.refreshAuth();
    this.router.navigate(['/']);
  }

  addToCart(product: Product, size: string): void {
    if (!size) return;
    this.cartService.addToCart(product, size);
    this.addedToCart[product.name + size] = true;
    setTimeout(() => {
      this.addedToCart[product.name + size] = false;
    }, 1500);
  }

  addCategoryToCart(category: Category, size: string): void {
    if (!size) return;
    this.cartService.addToCart({
      name: category.title,
      price: category.price,
      image: category.image,
      description: category.subtitle,
      sizes: category.sizes
    }, size);
    const key = 'cat_' + category.title + size;
    this.addedToCart[key] = true;
    setTimeout(() => { this.addedToCart[key] = false; }, 1500);
  }

  categories: Category[] = [
    {
      title: 'Running',
      subtitle: 'Conquista cada kilómetro',
      image: 'assets/categoria-running.jpg',
      keywords: ['running', 'correr', 'kilómetro', 'deportivo'],
      price: 2450,
      sizes: ['25', '26', '27', '28', '29']
    },
    {
      title: 'Básquetbol',
      subtitle: 'Domina la cancha',
      image: 'assets/categoria-basquetbol.jpg',
      keywords: ['básquetbol', 'basketball', 'cancha', 'domina'],
      price: 3100,
      sizes: ['25', '26', '27', '28', '29']
    },
    {
      title: 'Lifestyle',
      subtitle: 'Estilo urbano',
      image: 'assets/categoria-lifestyle.jpg',
      keywords: ['lifestyle', 'estilo', 'urbano', 'casual'],
      price: 1980,
      sizes: ['25', '26', '27', '28', '29']
    }
  ];

  filteredCategories: Category[] = [...this.categories];

  featuredProducts: Product[] = [
    {
      name: 'Air Max Pulse',
      price: 2850,
      image: 'assets/product1.jpg',
      description: 'Amortiguación extrema para máximo rendimiento',
      sizes: ['25', '26', '27', '28', '29'],
      badge: 'new'
    },
    {
      name: 'React Vision',
      price: 2400,
      image: 'assets/product2.jpg',
      description: 'Diseño futurista y comodidad todo el día',
      sizes: ['25', '26', '27', '28', '29'],
      badge: 'popular'
    },
    {
      name: 'Free Run 5.0',
      price: 1990,
      image: 'assets/product3.jpg',
      description: 'Ligereza natural para movimiento libre',
      sizes: ['25', '26', '27', '28', '29'],
      badge: 'sale'
    }
  ];

  bestSellers: Product[] = [
    {
      name: 'Air Force 1',
      price: 2100,
      image: 'assets/product4.jpg',
      description: 'El clásico icónico que nunca pasa de moda',
      sizes: ['25', '26', '27', '28', '29'],
      badge: 'popular'
    },
    {
      name: 'Jordan 1 Retro',
      price: 3200,
      image: 'assets/product5.jpg',
      description: 'Legado del básquetbol en tus pies',
      sizes: ['25', '26', '27', '28', '29']
    },
    {
      name: 'Dunk Low',
      price: 2600,
      image: 'assets/product6.jpg',
      description: 'Versatilidad y estilo en cada paso',
      sizes: ['25', '26', '27', '28', '29'],
      badge: 'new'
    }
  ];

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.isSearching = term.length > 0;

    if (term === '') {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(category =>
        category.title.toLowerCase().includes(term) ||
        category.subtitle.toLowerCase().includes(term) ||
        category.keywords.some(keyword => keyword.includes(term))
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.filteredCategories = [...this.categories];
  }

  getSearchResultsCount(): number {
    return this.filteredCategories.length;
  }
}
