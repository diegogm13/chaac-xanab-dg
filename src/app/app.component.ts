import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    this.subs.add(
      this.cartService.cart$
        .pipe(map(() => this.cartService.getCount()))
        .subscribe(count => this.cartCount = count)
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

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
