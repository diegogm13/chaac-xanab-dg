import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from './Services/auth.service';
import { CartService } from './Services/cart.service';
import { SearchService } from './Services/search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  searchTerm  = '';
  cartCount   = 0;
  isLoggedIn  = false;
  userName    = '';
  isAdminRoute = false;

  private subs = new Subscription();
  private platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    public authService: AuthService,
    public cartService: CartService,
    private searchService: SearchService
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isAdminRoute = e.urlAfterRedirects.startsWith('/admin');
        this.refreshAuth();
      });
  }

  ngOnInit(): void {
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.refreshAuth();
    this.handleSupabaseHashRedirect();
    this.subs.add(
      this.cartService.cart$
        .pipe(map(() => this.cartService.getCount()))
        .subscribe(count => this.cartCount = count)
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  private handleSupabaseHashRedirect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return;

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const type = params.get('type');

    if (accessToken && type === 'signup') {
      // Clear the hash from the URL without triggering navigation
      history.replaceState(null, '', window.location.pathname);
      this.router.navigate(['/verify-email'], { queryParams: { access_token: accessToken } });
    }
  }

  private refreshAuth(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userName   = this.authService.getCurrentUser()?.name || '';
  }

  onSearch(): void {
    this.searchService.setTerm(this.searchTerm.trim());
    if (this.router.url.split('?')[0] !== '/') {
      this.router.navigate(['/']);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchService.clearTerm();
  }

  logout(): void {
    this.authService.logout();
    this.refreshAuth();
    this.router.navigate(['/']);
  }
}
