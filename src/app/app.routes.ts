import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./Components/home/home.component').then(m => m.HomeComponent),
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./Components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./Components/registro/registro.component').then(m => m.RegistroComponent),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./Components/carrito/carrito.component').then(m => m.CarritoComponent),
  },
  // ── Rutas protegidas — ANTES del catch-all :categoria ──────────────────────
  {
    path: 'gracias',
    loadComponent: () => import('./Components/compra-final/compra-final.component').then(m => m.CompraFinalComponent),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./Components/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'mis-compras',
    loadComponent: () => import('./Components/mis-compras/mis-compras.component').then(m => m.MisComprasComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./Components/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./Components/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: 'terminos',
    loadComponent: () => import('./Components/terminos-uso/terminos-uso.component').then(m => m.TerminosUsoComponent),
  },
  // ── Catch-all de categorías — SIEMPRE al final ─────────────────────────────
  {
    path: ':categoria',
    loadComponent: () => import('./Components/categoria/categoria.component').then(m => m.CategoriaComponent),
  },
  { path: '**', redirectTo: '' },
];
